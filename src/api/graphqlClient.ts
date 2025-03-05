import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import ApiContants from "./ApiContants";
import authService from "../core/authService";

const httpLink = createHttpLink({
  uri: ApiContants.graphqlEndpoint,
  fetch: (uri, options) => {
    return fetch(uri, {
      ...options,
      keepalive: true,
    });
  },
});

const authLink = setContext((request, { headers }) => {
  const publicOperations = ["Login", "Signup"];
  if (!publicOperations.includes(request.operationName ?? "")) {
    if (authService.isTokenExpired()) {
      authService.logout();
    }
  }

  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("token");

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([authLink, httpLink]),
});

export default graphqlClient;
