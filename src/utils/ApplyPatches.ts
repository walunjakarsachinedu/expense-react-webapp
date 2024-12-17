import { applyOperation, Operation } from "fast-json-patch";
import { Person } from "../models/Person";

// converting old state to new updated state by applying patch of changes
export default class ApplyPatches {
  applyPatches(
    changes: Operation[],
    persons: Record<string, Person>
  ): Record<string, Person> {
    changes.forEach((change) => applyOperation(persons, change, false));
    return persons;
  }
}
