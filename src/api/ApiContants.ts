import { gql } from "@apollo/client";

export default class ApiContants {
  static readonly graphqlEndpoint: string = "http://localhost:8888/v1/graphql";

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
        added {
          _id {
            tmpId
            storedId
          }
          txs {
            tmpId
            storedId
          }
        }
        updated {
          _id
          txs {
            tmpId
            storedId
          }
          deletedTxs
        }
        deleted
      }
    }
  `;
}
