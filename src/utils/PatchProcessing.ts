import { PersonData, PersonDiff } from "../models/type";
import useExpenseStore from "../store/usePersonStore";
import Constants from "./constants";
import { isPageUnloaded } from "./is-page-unloaded";
import personUtils from "./personUtils";
import TrackedPromise from "./TrackPromise";
import utils from "./utils";

/** Manages sequential patch processing.  */
class PatchProcessing {
  prevState?: Record<string, PersonData>;
  private action?: (patch: PersonDiff) => Promise<void>;
  private currentActionStatus?: TrackedPromise<void>;
  private isPatchInQueue: boolean = false;

  private scheduledAction?: () => void;

  /**
   * Algorithm:
   * 1. If no prevState, store nextState as prevState & skip processing.
   * 2. Calculate patch.
   * 3. If offline, store patch & schedule to run once online.
   * 4. If processing, store patch.
   * 5. If not processing, process patch.
   * 6. Process pending patches if any.
   */
  processPatch(
    nextState: Record<string, PersonData>,
    action: (patch: PersonDiff) => Promise<void>
  ) {
    // 1. If no prevState, store nextState as prevState & skip processing.
    this.action = action;
    if (!this.prevState) {
      this.prevState = nextState;
      return;
    }

    // 2. Calculate patch.
    const patch = personUtils.personDiff({
      updatedData: nextState,
      oldData: this.prevState,
    });

    // 3. If offline, store patch & schedule to run once online.
    if (!navigator.onLine) {
      this._storePatch(patch);
      this._runOnceOnline(action);
      this.isPatchInQueue = true;
      return;
    }

    const isPatchInProcess =
      this.currentActionStatus && !this.currentActionStatus.getIsResolved();

    // 4. If processing, store patch.
    if (isPatchInProcess) {
      this._storePatch(patch);
      this.isPatchInQueue = true;
    }

    // 5. If not processing, process patch.
    if (!isPatchInProcess) {
      this._deletePatch();
      this.prevState = nextState;
      this.isPatchInQueue = false;
      this.currentActionStatus = new TrackedPromise(
        this.action(patch).finally(() => {
          if (!this.isPatchInQueue) return;
          // 6. Process pending patches if any.
          const nextState = useExpenseStore.getState().persons;
          this.processPatch(nextState, action);
        })
      );
    }
  }

  setPrevState(prevState: Record<string, PersonData>) {
    this.prevState = prevState;
  }

  getPatchAndDeleteFromStorage(): PersonDiff | undefined {
    const patchStr = localStorage.getItem(Constants.pendingPatchKey);
    const pendingPatchTimeStamp =
      utils.parseNumber(
        localStorage.getItem(Constants.pendingPatchTimeStampKey)
      ) ?? 0;
    const isPatchValid =
      Date.now() - pendingPatchTimeStamp <= 24 * 60 * 60 * 1000;

    this._deletePatch();
    if (!patchStr || !isPatchValid) return;
    try {
      return JSON.parse(patchStr);
    } catch {
      console.log("invalid patch found in local storage");
    }
  }

  private _storePatch(patch: PersonDiff) {
    localStorage.setItem(Constants.pendingPatchKey, JSON.stringify(patch));
    localStorage.setItem(Constants.pendingPatchTimeStampKey, `${Date.now()}`);
  }

  private _deletePatch() {
    localStorage.removeItem(Constants.pendingPatchKey);
    localStorage.removeItem(Constants.pendingPatchTimeStampKey);
  }

  /** schedule action to run once when online. */
  private _runOnceOnline(action: (patch: PersonDiff) => Promise<void>) {
    if (this.scheduledAction) {
      window.removeEventListener("online", this.scheduledAction);
    }
    const processPatch = () => {
      const nextState = useExpenseStore.getState().persons;
      this.processPatch(nextState, action);
    };
    window.addEventListener("online", () => {
      if (isPageUnloaded()) return;
      processPatch();
      window.removeEventListener("online", processPatch);
      this.scheduledAction = undefined;
    });
    this.scheduledAction = processPatch;
  }
}

export const patchProcessing = new PatchProcessing();
