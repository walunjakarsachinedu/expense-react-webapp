import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import ApiContants from "./ApiContants";

const httpLink = createHttpLink({
  uri: ApiContants.graphqlEndpoint,
});

const authLink = setContext((_, { headers }) => {
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
  link: authLink.concat(httpLink),
});

export default graphqlClient;
