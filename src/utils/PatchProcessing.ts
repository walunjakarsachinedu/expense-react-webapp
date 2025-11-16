import { MonthData, MonthDiff } from "../models/type";
import useExpenseStore from "../store/usePersonStore";
import Constants from "./constants";
import { isPageUnloaded } from "./is-page-unloaded";
import personUtils from "./personUtils";
import TrackedPromise from "./TrackPromise";
import utils from "./utils";

/** Manages sequential patch processing.  */
class PatchProcessing {
  prevState?: MonthData;
  private action?: (patch: MonthDiff) => Promise<void>;
  private currentActionStatus?: TrackedPromise<void>;
  private isPatchInQueue: boolean = false;

  private scheduledAction?: () => void;

  /**
   * Algorithm:
   * - Sanitize nextState
   * - If no prevState, store nextState as prevState & skip processing.
   * - Calculate patch.
   * - If offline, store patch & schedule to run once online.
   * - If processing, store patch.
   * - If not processing, process patch.
   * - Process pending patches if any.
   */
  processPatch(
    nextState: MonthData,
    action: (patch: MonthDiff) => Promise<void>
  ) {
    /// - Sanitize nextState
    nextState = utils.sanitizeMonthData(nextState);

    /// - If no prevState, store nextState as prevState & skip processing.
    this.action = action;
    if (!this.prevState) {
      this.prevState = nextState;
      return;
    }

    /// - Calculate patch.
    const patch = personUtils.monthDiff({
      updatedData: nextState,
      oldData: this.prevState,
    });



    /// - If offline, store patch & schedule to run once online.
    if (!navigator.onLine) {
      this._storePatch(patch);
      this._runOnceOnline(action);
      this.isPatchInQueue = true;
      useExpenseStore.getState().setSyncState("syncError");
      return;
    }

    const isPatchInProcess =
      this.currentActionStatus && !this.currentActionStatus.getIsResolved();

    /// - If processing, store patch.
    if (isPatchInProcess) {
      this._storePatch(patch);
      this.isPatchInQueue = true;
    }

    /// - If not processing, process patch.
    if (!isPatchInProcess) {
      this._deletePatch();
      this.prevState = nextState;
      this.isPatchInQueue = false;
      useExpenseStore.getState().setSyncState("syncing");
      this.currentActionStatus = new TrackedPromise(
        this.action(patch).finally(() => {
          if(this.isPatchInQueue) {
            // 6. Process pending patches if any.
            const nextState = useExpenseStore.getState().getMonthData();
            this.processPatch(nextState, action);
          }
          useExpenseStore.getState().setSyncState("synced");
        })
      );
    }
  }

  setCurrentActionStatus(trackedPromise: TrackedPromise<void>) {
    if(!this.currentActionStatus) this.currentActionStatus = trackedPromise;
  }

  setPrevState(prevState: MonthData) {
    /// Sanitize prevState
    this.prevState = utils.sanitizeMonthData(prevState);
  }

  getPatchAndDeleteFromStorage(): MonthDiff | undefined {
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

  private _storePatch(patch: MonthDiff) {
    localStorage.setItem(Constants.pendingPatchKey, JSON.stringify(patch));
    localStorage.setItem(Constants.pendingPatchTimeStampKey, `${Date.now()}`);
  }

  private _deletePatch() {
    localStorage.removeItem(Constants.pendingPatchKey);
    localStorage.removeItem(Constants.pendingPatchTimeStampKey);
  }

  /** schedule action to run once when online. */
  private _runOnceOnline(action: (patch: MonthDiff) => Promise<void>) {
    if (this.scheduledAction) {
      window.removeEventListener("online", this.scheduledAction);
    }
    const processPatch = () => {
      const nextState = useExpenseStore.getState().getMonthData();
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
