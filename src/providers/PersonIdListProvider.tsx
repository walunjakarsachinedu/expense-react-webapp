import { createContext, ReactNode, useReducer } from "react"
import { MonthExpenseService } from "../services/implemenation/MonthExpenseService";
import { TableType } from "../types/Transaction";


function PersonIdListProvider({children, type}: {children: ReactNode|undefined, type: TableType}) {
  const  initialState = MonthExpenseService.provider.getExpenseOfType(type)?.map(person => person._id);
  const [personIdList, dispatch] = useReducer(personIdsReducer, initialState);

  return <PersonIdListContext.Provider value={personIdList} >
      <PersonIdListDispatchContext.Provider value={dispatch}>
        {children}
      </PersonIdListDispatchContext.Provider>
  </PersonIdListContext.Provider>
}


function personIdsReducer(personIdList: PersonIdList, action: PersonIdsReducerActions) : PersonIdList {
  switch(action.type) {
    default:
      return personIdList;
  }
}


const PersonIdListContext = createContext<PersonIdList>(undefined);
const PersonIdListDispatchContext = createContext<((action: PersonIdsReducerActions) => void)|undefined>(undefined);

type PersonIdList = string[]|undefined;

type PersonIdsReducerReorder = {
  type: "reorder",
  newIndex: number 
};

type PersonIdsReducerActions = PersonIdsReducerReorder;



export default PersonIdListProvider;

export {
  PersonIdListContext, PersonIdListDispatchContext, 
};

export type {
  PersonIdsReducerActions, PersonIdsReducerReorder
}
