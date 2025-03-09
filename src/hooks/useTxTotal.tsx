import { TxType } from "../models/type";
import useExpenseStore from "../store/usePersonStore";

const useTxTotal = (type: TxType) => {
  const persons = useExpenseStore((store) => store.persons);

  const total = Object.values(persons)
    .filter((person) => person.type == type)
    .reduce(
      (total, person) =>
        total +
        Object.values(person.txs).reduce(
          (total, tx) => total + (tx.money ?? 0),
          0
        ),
      0
    );
  return total;
};

export default useTxTotal;
