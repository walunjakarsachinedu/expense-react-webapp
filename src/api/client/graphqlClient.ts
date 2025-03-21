import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import ApiContants from "../constants/ApiContants";
import authService from "../../core/authService";
import { timer } from "../../store/usePersonStore";
import { showInfoDialog } from "../../components/info-dialog";

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
  const publicOperations = [
    "Login",
    "Signup",
    "SendPasswordResetCode",
    "VerifyResetCode",
    "ChangePassword",
  ];
  if (!publicOperations.includes(request.operationName ?? "")) {
    if (authService.isTokenExpired()) {
      timer.timeout();
      showInfoDialog("Your session has expired. Click Ok to log in.", () => {
        authService.logout();
      });
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
