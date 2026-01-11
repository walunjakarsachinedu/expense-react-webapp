import { Accordion, AccordionTab } from "primereact/accordion";
import useTxTotal from "../../hooks/useTxTotal";
import { TxType } from "../../models/type";
import utils from "../../utils/utils";
import CenteredContent from "../common/CenteredContent";

// TODO: to show only when we have at least on tx enty in both income & expense
const TxSummary = () => {
  const expenseTotal = useTxTotal(TxType.Expense);
  const incomeTotal = useTxTotal(TxType.Income);

  return (
    <CenteredContent>
      <Accordion
        activeIndex={0}
        style={{ backgroundColor: "var(--surface-ground) !important" }}
      >
        <AccordionTab
          header="Summary"
          style={{ backgroundColor: "var(--surface-ground) !important" }}
        >
          <div className="flex justify-content-center flex-wrap row-gap-4 gap-3 md:gap-5 p-4">
            <LabeledNumber label="Income" number={incomeTotal}></LabeledNumber>
            <div className="flex justify-content-center gap-3">
              <div className="text-2xl text-500">-</div>
              <LabeledNumber
                label="Expense"
                number={expenseTotal}
              ></LabeledNumber>
            </div>
            <div className="flex justify-content-center gap-3">
              <div className="text-2xl text-500">=</div>
              <LabeledNumber
                label="Remaining"
                number={incomeTotal - expenseTotal}
              ></LabeledNumber>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </CenteredContent>
  );
};

type Props = {
  label: string;
  number: number;
};
const LabeledNumber = ({ label, number }: Props) => {
  return (
    <div className="flex flex-column gap-1">
      <div className="text-sm text-500">{label}</div>
      <div className="flex align-items-center">
        <div className="text-2xl text-900">{utils.formatNumber(number)}</div>
        <div className="pl-1 text-500">/-</div>
      </div>
    </div>
  );
};

export default TxSummary;
