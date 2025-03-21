import { gql } from "@apollo/client";
import config from "../../config";

console.log("__APP_CONFIG_", config);

export default class ApiContants {
  static readonly graphqlEndpoint: string = config.apiPath;

  // queries

  static readonly loginQuery = gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password)
    }
  `;

  static readonly signupQuery = gql`
    mutation Signup($name: String!, $email: String!, $password: String!) {
      signup(name: $name, email: $email, password: $password)
    }
  `;

  static readonly userInfoQuery = gql`
    query UserInfo {
      user {
        _id
        name
        email
      }
    }
  `;

  static readonly changedPersonsQuery = gql`
    query ChangedPersons(
      $month: String!
      $personVersionIds: [PersonVersionId!]!
    ) {
      changedPersons(month: $month, personVersionIds: $personVersionIds) {
        addedPersons {
          _id
          month
          type
          index
          name
          txs {
            _id
            index
            money
            tag
          }
          version
        }
        deletedPersons
        updatedPersons {
          _id
          month
          type
          index
          name
          txs {
            _id
            index
            money
            tag
          }
          version
        }
      }
    }
  `;

  static readonly applyPatchQuery = gql`
    mutation ApplyUpdates($diff: PersonDiff) {
      applyUpdates(diff: $diff) {
        conflictPersons {
          _id
          isDeleted
          txs {
            _id
            isDeleted
          }
        }
      }
    }
  `;

  static readonly sendResetCode = gql`
    mutation SendPasswordResetCode($nonce: String!, $email: String!) {
      sendPasswordResetCode(nonce: $nonce, email: $email)
    }
  `;

  static readonly verifyResetCode = gql`
    mutation VerifyResetCode(
      $resetCode: String!
      $email: String!
      $nonce: String!
    ) {
      verifyResetCode(resetCode: $resetCode, email: $email, nonce: $nonce)
    }
  `;

  static readonly changePassword = gql`
    mutation ChangePassword($passwordResetInput: PasswordResetInput) {
      changePassword(passwordResetInput: $passwordResetInput)
    }
  `;
}
