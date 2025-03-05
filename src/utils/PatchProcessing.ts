import { PersonData, PersonDiff } from "../models/type";
import personUtils from "./personUtils";
import TrackedPromise from "./TrackPromise";
import utils from "./utils";

/**
 * **Handles sequential patch processing.**
 * - when new state and action arrives then store it.
 * - when current patch is processed & new state exists, then
 *    - use next & prev state to calculate patch,
 *    - set prevState=nextState & nextState=null
 *    - process newly calculated patch
 */
export class PatchProcessing {
  static readonly provider = new PatchProcessing();

  private prevState?: Record<string, PersonData>;
  private nextState?: Record<string, PersonData> | null;
  private action?: (patch: PersonDiff) => Promise<void>;
  private currentActionStatus?: TrackedPromise<void>;

  private scheduledAction?: () => void;

  processPatch(
    nextState: Record<string, PersonData>,
    action: (patch: PersonDiff) => Promise<void>
  ) {
    this.nextState = nextState;
    this.action = action;
    if (!this.prevState) {
      this.prevState = this.nextState;
      this.nextState = null;
      return;
    }

    const patch = personUtils.personDiff({
      updatedData: this.nextState,
      oldData: this.prevState,
    });

    if (!navigator.onLine) {
      this._storePatch(patch);
      this._runOnceOnline(action);
      return;
    }

    const isPatchInProcess =
      this.currentActionStatus && !this.currentActionStatus.getIsResolved();

    // store current patch when there is patch already in process
    if (isPatchInProcess) {
      this._storePatch(patch);
    }

    // process patch when there is no patch in process
    if (!isPatchInProcess) {
      this._deletePatch();
      this.prevState = nextState;
      this.nextState = null;
      this.currentActionStatus = new TrackedPromise(
        this.action(patch).finally(() => {
          if (this.nextState) this.processPatch(this.nextState, action);
        })
      );
    }
  }

  setPrevState(prevState: Record<string, PersonData>) {
    this.prevState = prevState;
  }

  /** Processes the pending patch from storage if it is not older than 1 day. */
  async processPatchFromStorage(action: (patch: PersonDiff) => Promise<void>) {
    const patchStr = localStorage.getItem("pendingPatch");
    const pendingPatchTimeStamp =
      utils.parseNumber(localStorage.getItem("pendingPatchTimeStamp")) ?? 0;
    const isPatchValid =
      Date.now() - pendingPatchTimeStamp <= 24 * 60 * 60 * 1000;

    this._deletePatch();

    if (!patchStr || !isPatchValid) return;

    try {
      const patch: PersonDiff = JSON.parse(patchStr);
      await action(patch);
    } catch {
      console.log("invalid patch found in local storage");
    }
  }

  private _storePatch(patch: PersonDiff) {
    localStorage.setItem("pendingPatch", JSON.stringify(patch));
    localStorage.setItem("pendingPatchTimeStamp", `${Date.now()}`);
  }

  private _deletePatch() {
    localStorage.removeItem("pendingPatch");
    localStorage.removeItem("pendingPatchTimeStamp");
  }

  /** schedule action to run once when online. */
  private _runOnceOnline(action: (patch: PersonDiff) => Promise<void>) {
    if (this.scheduledAction) {
      window.removeEventListener("online", this.scheduledAction);
    }
    const processPatch = () => {
      if (this.nextState) this.processPatch(this.nextState, action);
      else this.processPatchFromStorage(action);
    };
    window.addEventListener("online", () => {
      processPatch();
      window.removeEventListener("online", processPatch);
      this.scheduledAction = undefined;
    });
    this.scheduledAction = processPatch;
  }
}
