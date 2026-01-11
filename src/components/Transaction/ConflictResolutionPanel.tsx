import { Accordion, AccordionTab } from "primereact/accordion";
import { ConflictPerson, TxType } from "../../models/type";
import CenteredContent from "../common/CenteredContent";
import useExpenseStore from "../../store/usePersonStore";
import PersonTxs from "./PersonTxs";
import utils from "../../utils/utils";

type Props = {
  type: TxType;
  conflictPersons?: ConflictPerson[];
};

function ConflictResolutionPanel({ type, conflictPersons }: Props) {
  const conflicts = useExpenseStore((store) => store.conflicts);
  const personIds = useExpenseStore((store) => store.personIds);

  const personList = personIds
    .filter((person) =>
      conflicts?.find((conflict) => conflict._id === person.id)
    )
    .filter((person) => person.type == type)
    .map((person) => (
      <PersonTxs key={person.id} id={person.id} conflictMode={true}></PersonTxs>
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
              <div className="font-bold	">{utils.getTypeDisplayName(type)}</div>
            </div>
          }
          style={{ backgroundColor: "var(--surface-ground) !important" }}
        >
          <div className="m-0 pt-2 pb-2">{personList}</div>
        </AccordionTab>
      </Accordion>
    </CenteredContent>
  );
}

export default ConflictResolutionPanel;
