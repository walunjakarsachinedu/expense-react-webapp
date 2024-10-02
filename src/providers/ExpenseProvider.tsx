import { ReactNode, useReducer } from "react";
import { MonthExpenseService } from "../services/implemenation/MonthExpenseService";
import { PersonTx, TableType } from "../types/Transaction";
import { createContext } from "react";


function ExpenseProvider({children, type}: {children: ReactNode|undefined, type: TableType }) {
  const initialState = MonthExpenseService.provider.getExpenseOfType(type);
  const [expense, dispatch] = useReducer(expenseReducer, initialState);
  return <ExpenseContext.Provider value={expense} >
    <ExpenseDispatchContext.Provider value={dispatch} >

    </ExpenseDispatchContext.Provider>
  </ExpenseContext.Provider>
}


function expenseReducer(expense: PersonTx[]|undefined, action: ExpenseReducerAction): PersonTx[]|undefined {
  switch (action.type) {
    default:
      return expense;
  }
}


const ExpenseContext = createContext<PersonTx[]|undefined>(undefined);
const ExpenseDispatchContext = createContext<((person: PersonTx) => void)|undefined>(undefined);

type ExpenseReducerAction = {
  type: string
};



export default ExpenseProvider;

export {
  ExpenseContext, ExpenseDispatchContext
}

export type {
  ExpenseReducerAction
}