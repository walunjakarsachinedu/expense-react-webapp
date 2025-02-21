import { Subject } from "rxjs";

class Timer {
  private _debounceTime: number;
  private _thresholdTime: number;
  private _debounceTimer?: NodeJS.Timeout;
  private _thresholdTimer?: NodeJS.Timeout;

  /** emits stop event */
  stopEvent = new Subject<void>();

  /** emits start event */
  startEvent = new Subject<void>();

  constructor({
    debounceTime,
    thresholdTime,
    timeoutOnWindowBlur = false,
  }: {
    debounceTime: number;
    thresholdTime: number;
    timeoutOnWindowBlur?: boolean;
  }) {
    this._debounceTime = debounceTime;
    this._thresholdTime = thresholdTime;
    if (timeoutOnWindowBlur) {
      window.addEventListener("beforeunload", this._handleWindowCloseEvent);
      window.addEventListener("blur", this.timeout);
    }
  }

  start = () => {
    this._restartDebounce();
    this._restartThreshold();
  };

  delay = () => {
    this._restartDebounce();
  };

  /**
   * delays debounce timer & starts threshold timer if not started.
   */
  startOrDelay = () => {
    this._restartDebounce();
    if (!this._thresholdTimer) {
      this.startEvent.next();
      this._restartThreshold();
    }
  };

  isRunning = (): boolean => {
    return !!this._debounceTimer || !!this._thresholdTimer;
  };

  timeout = () => {
    if (!this.isRunning()) return;

    this._stopDebounce();
    this._stopThreshold();

    this.stopEvent.next();
  };

  private _restartDebounce = () => {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(this.timeout, this._debounceTime);
  };

  private _restartThreshold = () => {
    clearTimeout(this._thresholdTimer);
    this._thresholdTimer = setTimeout(this.timeout, this._thresholdTime);
  };

  private _stopDebounce = () => {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = undefined;
  };

  private _stopThreshold = () => {
    clearTimeout(this._thresholdTimer);
    this._thresholdTimer = undefined;
  };

  private _handleWindowCloseEvent = (event: BeforeUnloadEvent) => {
    if (!this.isRunning()) return;
    this.timeout();

    // stop browser from closing page
    event.preventDefault();
    const message = "You have unsaved changes. Are you sure you want to leave?";
    event.returnValue = message;
    return message;
  };
}

export default Timer;
