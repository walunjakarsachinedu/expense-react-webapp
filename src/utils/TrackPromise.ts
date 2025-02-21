export default class TrackedPromise<T> {
  private isResolved = false;

  constructor(private promise: Promise<T>) {
    this.promise
      .then(() => (this.isResolved = true))
      .catch(() => (this.isResolved = true));
  }

  getIsResolved(): boolean {
    return this.isResolved;
  }

  getPromise(): Promise<T> {
    return this.promise;
  }
}
