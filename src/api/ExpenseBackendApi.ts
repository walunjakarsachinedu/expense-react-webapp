import { ApolloClient, InMemoryCache } from "@apollo/client";
import {
  PersonDiff,
  PersonDiffResponse,
  PersonMinimal,
  PersonTx,
} from "../models/type";
import ApiContants from "./ApiContants";

// returning frozen objects
export class ExpenseBackendApi {
  static readonly provider = new ExpenseBackendApi();

  private graphqlClient = new ApolloClient({
    uri: ApiContants.graphqlEndpoint,
    cache: new InMemoryCache(),
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2FjaGluIHdhbHVuamFrYXIiLCJlbWFpbCI6InNhY2hpbkBnbWFpbC5jb20iLCJpYXQiOjE3Mzk0MDcxMTQsImV4cCI6MTc0MDAxMTkxNCwic3ViIjoiNjc5ZWZjYTY2NTkwY2IwOGE2OWQyMzA0In0.fMLkjsTTJKLECqTVMDOpTF2vzKFOQ_vuzvM5-unWbck",
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
    const result = await this.graphqlClient
      .query({
        query: ApiContants.personsByIdsQuery,
        variables: { ids },
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return (result?.data["persons"] as PersonTx[]) ?? [];
  }

  async applyChanges(
    diff: PersonDiff
  ): Promise<PersonDiffResponse | undefined> {
    const result = await this.graphqlClient
      .mutate({
        mutation: ApiContants.applyPatchQuery,
        variables: { diff },
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return result?.data["applyUpdates"] as PersonDiffResponse;
  }
}
