import { FetchResult } from "@apollo/client";
import cloneDeep from "lodash/cloneDeep";
import {
  ChangedPersons,
  ChangePasswordInput,
  Conflicts,
  PersonDiff,
  PersonVersionId,
  ResponseData,
  VerifyResetCodeInput,
} from "../../models/type";
import graphqlClient from "../client/graphqlClient";
import ApiContants from "../constants/ApiContants";
import { ErrorCodes } from "../constants/ErrorContants";

// returning frozen objects
export class ExpenseBackendApi {
  async performSignup(
    name: string,
    email: string,
    password: string
  ): ResponseData<string> {
    return handleResponse(
      graphqlClient.mutate({
        mutation: ApiContants.signupQuery,
        variables: { name, email, password },
      }),
      "signup"
    );
  }

  async performLogin(email: string, password: string): ResponseData<string> {
    return handleResponse<string>(
      graphqlClient.mutate({
        mutation: ApiContants.loginQuery,
        variables: { email, password },
      }),
      "login"
    );
  }

  async getChangedPersons(
    month: string,
    personVersionIds: PersonVersionId[]
  ): ResponseData<ChangedPersons> {
    return handleResponse<ChangedPersons>(
      graphqlClient.query({
        query: ApiContants.changedPersonsQuery,
        variables: { month, personVersionIds },
        fetchPolicy: "network-only",
      }),
      "changedPersons"
    );
  }

  async applyChanges(diff: PersonDiff): ResponseData<Conflicts> {
    return handleResponse<Conflicts>(
      graphqlClient.mutate({
        mutation: ApiContants.applyPatchQuery,
        variables: { diff },
      }),
      "applyUpdates"
    );
  }

  async sendResetCode(email: string, nonce: string): ResponseData<string> {
    return handleResponse<string>(
      graphqlClient.mutate({
        mutation: ApiContants.sendResetCode,
        variables: { email, nonce },
      }),
      "sendPasswordResetCode"
    );
  }

  async verifyResetCode({
    resetCode,
    email,
    nonce,
  }: VerifyResetCodeInput): ResponseData<string> {
    return handleResponse<string>(
      graphqlClient.mutate({
        mutation: ApiContants.verifyResetCode,
        variables: { resetCode, email, nonce },
      }),
      "verifyResetCode"
    );
  }

  async changePassword({
    resetCode,
    email,
    nonce,
    newPassword,
  }: ChangePasswordInput): ResponseData<string> {
    return handleResponse<string>(
      graphqlClient.mutate({
        mutation: ApiContants.changePassword,
        variables: {
          passwordResetInput: { resetCode, email, nonce, newPassword },
        },
      }),
      "changePassword"
    );
  }
}

function handleResponse<ResponseType>(
  promise: Promise<FetchResult<Record<string, unknown>>>,
  fieldToExtract: string
): ResponseData<ResponseType> {
  return promise
    .then((result) => cloneDeep(result))
    .then((result) => ({ data: result.data?.[fieldToExtract] as ResponseType }))
    .catch((err: unknown) => ({
      error: extractGraphqlError(err),
    }));
}

function extractGraphqlError(error: unknown):
  | {
      code?: ErrorCodes;
      message?: string;
    }
  | undefined {
  const err = error as {
    cause?: { extensions?: { code?: ErrorCodes; message: string } };
  };
  return err.cause?.extensions?.code || err.cause?.extensions?.message
    ? {
        code: err?.cause?.extensions?.code,
        message: err?.cause?.extensions?.message,
      }
    : undefined;
}

export const expenseBackendApi = new ExpenseBackendApi();
