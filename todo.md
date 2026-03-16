# imp todo
- after panel collapse, the local state (like expand state) of each person component lost.
- personUtils.applyChanges calculating updateDiff two times one for store then for prevState, causing updateDiff to calculate incorrectly for prevState as store is already updated.

# todo
- check all possibilities where we need to clear filter
- rename file usePersonStore.ts to useExpenseStore.ts
- sync state svg are not caching and are fetched with each request
- check for duplicate entry in tx with same id