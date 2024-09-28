import { createContext, ReactNode, useReducer } from "react";
import PersonExpenseService from "../services/implemenation/PersonExpenseService";
import { PersonTx } from "../types/Transaction";
import TxTagService from "../services/implemenation/TxTagService";


function toPromise<T>(value: T) : Promise<T> {
  return new Promise((resolve) => {
    resolve(value);
  });
}

function PersonProvider({children, id}: {children: ReactNode | undefined, id: string}) {
  const initialState: PersonTx = PersonExpenseService.provider.get(id);
  const [person, dispatch] = useReducer(personReducer, toPromise(initialState));

  return <PersonContext.Provider value={person}>
    <PersonDispatchContext.Provider value={dispatch}>
      {children}
    </PersonDispatchContext.Provider>
  </PersonContext.Provider>
}

async function personReducer(person: Promise<PersonTx>, action: PersonReducerAction) : Promise<PersonTx> {
  const personData = await person;

  switch(action.type) {
    case "addExpense":
      await TxTagService.provider.add(personData._id);
      break;
    case "removeExpense":
      await TxTagService.provider.delete(action._id, personData._id);
      break;
    default:
      return person;
  }

  return PersonExpenseService.provider.get(personData._id);
}



const PersonContext = createContext<Promise<PersonTx>|undefined>(undefined);
const PersonDispatchContext = createContext<((person: PersonReducerAction) => void)|undefined>(undefined);


type PersonReducerAddExpense = {
  type: "addExpense";
}

type PersonReducerRemoveExpense = {
  type: "removeExpense";
  _id: string;
}

type PersonReducerAction = PersonReducerAddExpense|PersonReducerRemoveExpense;



export default PersonProvider;

export {
  PersonContext, PersonDispatchContext
};

export type {
  PersonReducerAction
};