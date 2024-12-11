import { useQuery } from "@tanstack/react-query";
import MonthExpenseApi from "../api/MonthExpenseApi";
import { Person } from "../models/Person";
import useExpenseStore from "../store/usePersonStore";
import { utils } from "../utils/Utility";
import hash from "object-hash";

const useMonthExpense = (monthYear: string) => {
  const setMonthData = useExpenseStore((store) => store.setMonthData);

  const getMonthExpense = async (): Promise<Person[]> => {
    const fetchIdHashes =
      await MonthExpenseApi.provider.getMonthExpenseIdHash();
    /** person data found in local storage. */
    const storedPersons: Person[] = fetchIdHashes
      .map((personIdHash) => utils.getPerson(personIdHash))
      .filter((person) => person != undefined);

    /** person hash not found in local storage. */
    const notFoundIdHashes = fetchIdHashes.filter(
      (fetchedPerson) =>
        !storedPersons.some(
          (storedPerson) =>
            storedPerson._id == fetchedPerson._id &&
            storedPerson.hash == fetchedPerson.hash
        )
    );

    /** person data fetched from backend. */
    const fetchedPerson = await MonthExpenseApi.provider
      .getMonthExpenseByIds(notFoundIdHashes.map((person) => person._id))
      .then((persons) => persons.map<Person>(utils.personTxToPerson));

    /** caching fetched data */
    fetchedPerson.forEach((person) => utils.storePerson(person));

    return [...storedPersons, ...fetchedPerson].map((person) => ({
      ...person,
      txIds: person.txIds.sort(),
    }));
  };
  return useQuery<Person[]>({
    queryKey: ["monthExpense"],
    queryFn: () => getMonthExpense(),
    onSuccess: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
