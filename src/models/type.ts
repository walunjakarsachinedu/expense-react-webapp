import { ErrorCodes } from "../api/constants/ErrorContants";

/** define transaction type */
export enum TxType {
  Expense = "Expense",
  Income = "Income",
}

/** Sturcture of person for client use.  */
export interface PersonData {
  _id: string;
  /** format: MM-yyyy */
  month: string;
  type: TxType;
  index: number;
  name: string;
  // map of tx._id -> tx
  txs: Record<string, Tx>;
  txIds: string[];
  version: string;
}

/** Structure of person for backend interaction. */
export interface PersonTx {
  _id: string;
  /** format: MM-yyyy */
  month: string;
  type: TxType;
  index: number;
  name: string;
  txs: Tx[];
  version: string;
}

/** Represents a single transaction. */
export interface Tx {
  _id: string;
  index: number;
  money?: number;
  tag?: string;
}

export type PersonVersionId = {
  _id: string;
  version: string;
};

export type ChangedPersons = {
  addedPersons: PersonTx[];
  updatedPersons: PersonTx[];
  deletedPersons: string[];
};

export type PersonDiff = {
  added?: PersonTx[];
  updated?: PersonPatch[];
  deleted?: string[];
};

export type PersonPatch = {
  _id: string;
  index?: number;
  name?: string;
  txDiff?: TxDiff;
  /** required field, use for caching purpose on client */
  version: string;
};

export type TxDiff = {
  added?: Tx[];
  updated?: TxPatch[];
  deleted?: string[];
};

export type TxPatch = {
  _id: string;
  index?: number;
  money?: number;
  tag?: string;
};

export type Conflicts = {
  conflictPersons?: ConflictPerson[];
};

export type ConflictPerson = {
  _id: string;
  /** If true, person is deleted from backend */
  isDeleted: boolean;
  /** If true, delete locally; false saves to backend */
  toDelete?: boolean;
  txs?: {
    _id: string;
    /** If true, transaction is deleted from backend */
    isDeleted: boolean;
    /** If true, delete locally; false saves to backend */
    toDelete?: boolean;
  }[];
};

export type GraphqlResponse<T> = {
  data?: T;
  error?: { code?: ErrorCodes; message?: string };
};
export type ResponseData<ResponseType> = Promise<GraphqlResponse<ResponseType>>;

export type ChangePasswordInput = {
  resetCode: string;
  email: string;
  nonce: string;
  newPassword: string;
};

export type VerifyResetCodeInput = {
  resetCode: string;
  email: string;
  nonce: string;
};
