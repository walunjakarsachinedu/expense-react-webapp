import { gql } from "@apollo/client";
import config from "../config";

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
      signup(name: $name, email: $email, password: $password) {
        _id
        email
        name
      }
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

  static readonly personOfMonthQuery = gql`
    query PersonsOfMonth($month: String!) {
      personsOfMonth(month: $month) {
        _id
        version
      }
    }
  `;

  static readonly personsByIdsQuery = gql`
    query PersonsByIds($ids: [String]) {
      persons(ids: $ids) {
        _id
        index
        month
        name
        txs {
          _id
          index
          money
          tag
        }
        type
        version
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
}
