import { Panel } from 'primereact/panel';
import PersonTxsComp from './PersonTxsComp';


export default function AllPersonTxComp({allPersonTxs, onItemAdded, onItemUpdated}: {allPersonTxs: AllPersonTxs} & {onItemAdded: (name: string) => void, onItemUpdated: () => void}) {
  const personTotal = (txs: Tx[]) => txs.reduce((acc, cur) => acc + (cur.money??0), 0);
  const total = allPersonTxs.persons.reduce((acc, cur) => acc + personTotal(cur.txs), 0);
  return (
    <div>
      <div className="flex justify-content-center align-items-center flex-wrap">
        <div className="col-12 md:col-10" style={{maxWidth: 1000}}>
        <Panel 
          headerTemplate={
          <div className='p-panel-header flex justify-content-between'>
            <div> {allPersonTxs.title} </div>
            <div> Total: {total}/- </div>
          </div>}
        >
          <p className="m-0">
            {
              allPersonTxs.persons.map(e => <div>
                <PersonTxsComp {...e} onItemAdd={(name) => onItemAdded(name)} ></PersonTxsComp>
              </div>)
            }
          </p>
        </Panel>
        </div>
      </div>
    </div>
  );
}
