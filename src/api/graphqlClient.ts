import { ApolloClient, InMemoryCache } from "@apollo/client";

const graphqlClient = new ApolloClient({
  uri: "http://localhost:8888/v1/graphql",
  cache: new InMemoryCache(),
});

export default graphqlClient;
