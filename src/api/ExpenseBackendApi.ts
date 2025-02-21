import { ApolloClient, InMemoryCache } from "@apollo/client";
import { Conflicts, PersonDiff, PersonMinimal, PersonTx } from "../models/type";
import ApiContants from "./ApiContants";

// returning frozen objects
export class ExpenseBackendApi {
  static readonly provider = new ExpenseBackendApi();

  private graphqlClient = new ApolloClient({
    uri: ApiContants.graphqlEndpoint,
    cache: new InMemoryCache(),
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2FjaGluIHdhbHVuamFrYXIiLCJlbWFpbCI6InNhY2hpbkBnbWFpbC5jb20iLCJpYXQiOjE3NDAwMTI3MjMsImV4cCI6MTc0MDQ0NDcyMywic3ViIjoiNjc5ZWZjYTY2NTkwY2IwOGE2OWQyMzA0In0.G0CJv1LmmlE4A9a7wMGHOqydw4Qi5LomFTU4EmlOZOI",
    },
  });

  async getPersonVersionIds(month: string): Promise<PersonMinimal[]> {
    const result = await this.graphqlClient
      .query({
        query: ApiContants.personOfMonthQuery,
        variables: { month },
        fetchPolicy: "network-only",
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return (result?.data["personsOfMonth"] as PersonMinimal[]) ?? [];
  }

  async getPersonByIds(ids: string[]): Promise<PersonTx[]> {
    // for empty list no need to send api call
    if (ids.length == 0) return [];
    const result = await this.graphqlClient
      .query({
        query: ApiContants.personsByIdsQuery,
        variables: { ids },
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return (result?.data["persons"] as PersonTx[]) ?? [];
  }

  async applyChanges(diff: PersonDiff): Promise<Conflicts | undefined> {
    const result = await this.graphqlClient
      .mutate({
        mutation: ApiContants.applyPatchQuery,
        variables: { diff },
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return result?.data["applyUpdates"] as Conflicts;
  }
}
