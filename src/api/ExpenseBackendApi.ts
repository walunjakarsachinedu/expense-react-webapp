import {
  ChangedPersons,
  ChangePasswordInput,
  Conflicts,
  GraphqlResponse,
  PersonDiff,
  PersonVersionId,
  VerifyResetCodeInput,
} from "../models/type";
import utils from "../utils/utils";
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

  async sendResetCode(
    email: string,
    nonce: string
  ): Promise<GraphqlResponse<string>> {
    const result = await graphqlClient
      .mutate({
        mutation: ApiContants.sendResetCode,
        variables: { email, nonce },
      })
      .then((result) => ({ data: result.data.sendPasswordResetCode as string }))
      .catch((err: unknown) => ({
        error: { message: utils.extractGraphqlError(err)! },
      }));
    return result;
  }

  async verifyResetCode({
    resetCode,
    email,
    nonce,
  }: VerifyResetCodeInput): Promise<GraphqlResponse<string>> {
    const result = await graphqlClient
      .mutate({
        mutation: ApiContants.verifyResetCode,
        variables: { resetCode, email, nonce },
      })
      .then((result) => ({ data: result.data.verifyResetCode as string }))
      .catch((err: unknown) => ({
        error: { message: utils.extractGraphqlError(err)! },
      }));
    return result;
  }

  async changePassword({
    resetCode,
    email,
    nonce,
    newPassword,
  }: ChangePasswordInput): Promise<GraphqlResponse<string>> {
    const result = await graphqlClient
      .mutate({
        mutation: ApiContants.changePassword,
        variables: {
          passwordResetInput: { resetCode, email, nonce, newPassword },
        },
      })
      .then((result) => ({ data: result.data.changePassword as string }))
      .catch((err: unknown) => ({
        error: { message: utils.extractGraphqlError(err)! },
      }));
    return result;
  }
}
