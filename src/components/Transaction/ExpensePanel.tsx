import { Button } from "primereact/button";
import useExpenseStore from "../../store/usePersonStore";
import PersonTxs from "./PersonTxs";
import { TxType } from "../../models/type";
import useTxTotal from "../../hooks/useTxTotal";
import utils from "../../utils/utils";
import CenteredContent from "../common/CenteredContent";
import { Accordion, AccordionTab } from "primereact/accordion";

type Props = {
  type: TxType;
};

const ExpensePanel = ({ type }: Props) => {
  const personIds = useExpenseStore((store) => store.personIds).filter(
    (person) => person.type == type
  );
  const addPerson = useExpenseStore((store) => store.addPerson);

  const personList = personIds.map((person) => (
    <PersonTxs key={person.id} id={person.id}></PersonTxs>
  ));

  return (
    <CenteredContent>
      <Accordion
        activeIndex={0}
        style={{ backgroundColor: "var(--surface-ground) !important" }}
      >
        <AccordionTab
          header={
            <div className="flex justify-content-between align-items-center">
              <div className="font-bold">
                {type == TxType.Expense ? "Expense" : "Income"} History{" "}
              </div>
              <div className="flex align-items-center">
                {/* <div className="pi pi-cog"></div> */}
                <div className="mx-3"></div>
                <ExpenseTotal type={type}></ExpenseTotal>
              </div>
            </div>
          }
          style={{ backgroundColor: "var(--surface-ground) !important" }}
        >
          <div className="m-0 pt-2 pb-2">{personList}</div>
          <Button
            className="m-4 ml-0 mb-2 mt-0"
            outlined
            size="small"
            onClick={() => addPerson(type)}
          >
            Add Person
          </Button>
        </AccordionTab>
      </Accordion>
    </CenteredContent>
  );
};

const ExpenseTotal = ({ type }: Props) => {
  const total = useTxTotal(type);

  return (
    <div className="mr-1 font-normal">
      <span className="text-500">Total : &nbsp;</span>
      {utils.formatNumber(total)}
      <span className="text-500"> /-</span>
    </div>
  );
};

export default ExpensePanel;
