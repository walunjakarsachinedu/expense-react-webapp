import {
  Conflicts,
  GraphqlResponse,
  PersonDiff,
  PersonVersionId,
  PersonTx,
  ChangedPersons,
} from "../models/type";
import ApiContants from "./ApiContants";
import graphqlClient from "./graphqlClient";

// returning frozen objects
export class ExpenseBackendApi {
  static readonly provider = new ExpenseBackendApi();

  async performSignup(
    name: string,
    email: string,
    password: string
  ): Promise<GraphqlResponse<string>> {
    const result = await graphqlClient
      .mutate({
        mutation: ApiContants.signupQuery,
        variables: { name, email, password },
      })
      .then((result) => ({ data: result.data.signup }))
      .catch((err) => ({ error: { message: err.message } }));
    return result as GraphqlResponse<string>;
  }

  async performLogin(
    email: string,
    password: string
  ): Promise<GraphqlResponse<string>> {
    const result = await graphqlClient
      .mutate({
        mutation: ApiContants.loginQuery,
        variables: { email, password },
      })
      .then((result) => ({ data: result.data.login }))
      .catch((err) => ({ error: { message: err.message } }));
    return result as GraphqlResponse<string>;
  }

  async getChangedPersons(
    month: string,
    personVersionIds: PersonVersionId[]
  ): Promise<ChangedPersons> {
    const result = await graphqlClient
      .query({
        query: ApiContants.changedPersonsQuery,
        variables: { month, personVersionIds },
        fetchPolicy: "network-only",
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return (result?.data["changedPersons"] as ChangedPersons) ?? [];
  }

  async applyChanges(diff: PersonDiff): Promise<Conflicts | undefined> {
    const result = await graphqlClient
      .mutate({
        mutation: ApiContants.applyPatchQuery,
        variables: { diff },
      })
      .catch((err) => undefined)
      .then(<T>(result: T) => JSON.parse(JSON.stringify(result)) as T);
    return result?.data["applyUpdates"] as Conflicts;
  }
}
