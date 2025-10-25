import { TxType } from "../models/type";
import useExpenseStore from "../store/usePersonStore";
import personUtils from "../utils/personUtils";

const useTxTotal = (type: TxType) => {
  const persons = useExpenseStore((store) => store.persons);
  const filter = useExpenseStore(store => store.filter);


  const total = Object.values(persons)
    .filter((person) => person.type == type)
    .reduce(
      (total, person) =>
        total +
        Object.values(person.txs)
        .filter((tx) => personUtils.isTxSatisfyFilter(tx._id, filter))
        .reduce(
          (total, tx) => total + (tx.money ?? 0),
          0
        ),
      0
    );
  return total;
};

export default useTxTotal;
