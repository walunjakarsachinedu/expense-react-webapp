type StoreValueSetter<State> = {
  (
    partial:
      | State
      | Partial<State>
      | ((state: State) => State | Partial<State>),
    replace?: false
  ): void;
  (state: State | ((state: State) => State), replace: true): void;
};

type Middleware<State> = (
  action: string,
  set: StoreValueSetter<State>,
  get: () => State
) => void;

export default Middleware;
