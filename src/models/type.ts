import { ErrorCodes } from "../api/constants/ErrorContants";

/** define transaction type */
export enum TxType {
  Expense = "Expense",
  Income = "Income",
  UpcomingExpense = "UpcomingExpense"
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
  money?: number|null;
  tag?: string;
  /** represent day in month, when transaction is performed. */
  performedAt?: number;
}



export type VersionId = {
  _id: string;
  version: string;
}

export type CurrentState = {
  personVersionIds: VersionId[]
  monthlyNotesVersionId?: VersionId
}

export type Changes = {
  conflictsPersons: ConflictPerson[];
  changedPersons: ChangedPersons;
  monthlyNotes: MonthlyNotes;
};

export type MonthlyNotes = {
  _id: string;
  version?: string;
  notes: string;
}


export type MonthData = {
  persons: Record<string, PersonData>;
  monthlyNotes?: MonthlyNotes;
}

export type ChangedPersons = {
  addedPersons: PersonTx[];
  updatedPersons: PersonTx[];
  deletedPersons: string[];
};

export type MonthDiff = {
  added?: PersonTx[];
  updated?: PersonPatch[];
  deleted?: string[];
  monthlyNotes?: MonthlyNotes;
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
  money?: number|null;
  tag?: string;
  /** represent day in month, when transaction is performed. */
  performedAt?: number;
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
  txs?: ConflictTx[];
};

export type ConflictTx = {
  _id: string;
  /** If true, transaction is deleted from backend */
  isDeleted: boolean;
  /** If true, delete locally; false saves to backend */
  toDelete?: boolean;
}

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


export type SyncStates = "synced"|"unSync"|"syncing"|"syncError"|"none";

export type Filter = {
  /** day of month. */
  startDay?: number; 
  /** day of month. */
  endDay?: number;
  filteredTxIds?: Set<string>;
  /** Tx to always show by ignoring filter. (to prevent issue if user edit performedAt when filtering is applied) */
  ignoreTxIds?: Set<string>;
}