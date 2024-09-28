import { Panel } from 'primereact/panel';
import PersonTxsComp from './PersonTxsComp';
import { useEffect, useState } from 'react';
import { MonthExpenseService } from '../../services/implemenation/MonthExpenseService';
import Utility from '../../utils/Utility';
import LocalStorageApi from '../../api/LocalStorageApi';
import { PersonTx } from '../../types/Transaction';
import PersonProvider from '../../providers/PersonProvider';


export default function ExpensePanel() {
  const [monthExpense, setMonthExpense] = useState<PersonTx[]|undefined>();
  const total = Utility.provider.personTotal(monthExpense??[]);

  const loadExpenseData = async () => {
    const date = LocalStorageApi.provider.getSelectedMonthYear();
    await MonthExpenseService.provider.getAndCacheMonthAllTxs(date.month, date.year);
    const monthExpense = MonthExpenseService.provider.getMonthExpense();
    setMonthExpense(monthExpense);
  }

  useEffect(() => {
    loadExpenseData();
  },[]);

  const personList = (monthExpense ?? []).map(e => 
    <div key={e._id.tostring()}> 
      <PersonProvider id={e._id}>
        <PersonTxsComp></PersonTxsComp> 
      </PersonProvider>
    </div>
  )
  return (
    <div>
      <div className="flex justify-content-center align-items-center flex-wrap">
        <div className="col-12 md:col-10" style={{maxWidth: 1000}}>
          <Panel 
            headerTemplate={
            <div className='p-panel-header flex justify-content-between align-items-center'>
              <div> Expense History </div>
              <div className="flex align-items-center">
                <div className="pi pi-cog"></div>
                <div className="mx-3"></div>
                <div> Total: {total}/- </div>
              </div>
            </div>}
          >
            <div className="m-0 p-4">
              { personList }
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
