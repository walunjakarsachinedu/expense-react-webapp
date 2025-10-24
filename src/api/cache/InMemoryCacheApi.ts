export enum InMemoryCacheCategory {
  PersonMonthlyData = "PersonMonthlyData",
}

class InMemoryCache {
  private readonly inMemoryStorage: {
    [category in string]: {
      [key in string]: { data: unknown; timestamp: number };
    };
  } = {};
  private categoryLimits: Record<string, number>;

  constructor(categoryLimits: Record<InMemoryCacheCategory, number>) {
    this.categoryLimits = categoryLimits;
  }

  /** Merge new category limits with existing ones. */
  updateCategoryCacheLimit(categoryLimits: Record<string, number>) {
    this.categoryLimits = { ...this.categoryLimits, ...categoryLimits };
  }

  /** Store data in memory cache under a specific category with eviction policy. */
  setCache<T>(category: string, key: string, data: T) {
    if (!this.inMemoryStorage[category]) {
      this.inMemoryStorage[category] = {};
    }

    const maxEntries = this.categoryLimits[category] ?? 5; // Default max = 5 if not specified

    // If category exceeds limit, evict oldest entry
    if (Object.keys(this.inMemoryStorage[category]).length >= maxEntries) {
      this.evictOldestEntry(category);
    }

    // Store data with timestamp
    this.inMemoryStorage[category][key] = { data, timestamp: Date.now() };
  }

  /** Retrieve cached data by category and key. */
  getCache<T>(category: string, key: string): T | undefined {
    return this.inMemoryStorage[category]?.[key]?.data as T | undefined;
  }

  /** Remove the oldest entry within a category */
  private evictOldestEntry(category: string) {
    const oldestKey = Object.entries(this.inMemoryStorage[category]).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    )[0]?.[0];

    if (oldestKey) {
      delete this.inMemoryStorage[category][oldestKey];
    }
  }

  /** Clear cache. */
  clear() {
    Object.keys(this.inMemoryStorage).forEach(key => delete this.inMemoryStorage[key]);
  }
}

export const inMemoryCache = new InMemoryCache({
  [InMemoryCacheCategory.PersonMonthlyData]: 5,
});
