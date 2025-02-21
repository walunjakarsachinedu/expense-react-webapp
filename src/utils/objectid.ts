// Unique sequence for the current process (initialized on first use)
let PROCESS_UNIQUE: Uint8Array | null = null;

/** ObjectId hexString cache @internal */
const __idCache = new WeakMap(); // TODO(NODE-6549): convert this to #__id private field when target updated to ES2022

/**
 * A class representation of the BSON ObjectId type.
 * @public
 * @category BSONType
 */
export class ObjectId {
  /** @internal */
  private static index = Math.floor(Math.random() * 0xffffff);

  static cacheHexString: boolean;

  /** ObjectId Bytes @internal */
  private buffer!: Uint8Array;

  /**
   * The ObjectId bytes
   * @readonly
   */
  get id(): Uint8Array {
    return this.buffer;
  }

  set id(value: Uint8Array) {
    this.buffer = value;
    if (ObjectId.cacheHexString) {
      __idCache.set(this, ObjectId.toHex(value));
    }
  }

  constructor() {
    this.buffer = ObjectId.generate();
  }

  // custom code start

  static getId() {
    return new ObjectId().toHexString();
  }

  private static toHex(uint8array: Uint8Array): string {
    return Array.from(uint8array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  // custom code end

  /** Returns the ObjectId id as a 24 lowercase character hex string representation */
  toHexString(): string {
    if (ObjectId.cacheHexString) {
      const __id = __idCache.get(this);
      if (__id) return __id;
    }

    const hexString = ObjectId.toHex(this.id);

    if (ObjectId.cacheHexString) {
      __idCache.set(this, hexString);
    }

    return hexString;
  }

  /**
   * Update the ObjectId index
   * @internal
   */
  private static getInc(): number {
    return (ObjectId.index = (ObjectId.index + 1) % 0xffffff);
  }

  // custom code start

  /** Create empty space of size, use pooled memory when available */
  private static allocateUnsafe(size: number): Uint8Array {
    if (typeof size !== "number") {
      throw new TypeError(
        `The "size" argument must be of type number. Received ${String(size)}`
      );
    }
    return new Uint8Array(size);
  }

  /** Writes a big-endian 32-bit integer to destination, can be signed or unsigned */
  private static setInt32BE(
    destination: Uint8Array,
    offset: number,
    value: number
  ): 4 {
    destination[offset + 3] = value;
    value >>>= 8;
    destination[offset + 2] = value;
    value >>>= 8;
    destination[offset + 1] = value;
    value >>>= 8;
    destination[offset] = value;
    return 4;
  }

  /** @internal */
  private static webRandomBytes: (byteLength: number) => Uint8Array = (() => {
    const { crypto } = globalThis as {
      crypto?: { getRandomValues?: (space: Uint8Array) => Uint8Array };
    };
    if (crypto != null && typeof crypto.getRandomValues === "function") {
      return (byteLength: number) => {
        // @ts-expect-error: crypto.getRandomValues cannot actually be null here
        // You cannot separate getRandomValues from crypto (need to have this === crypto)
        return crypto.getRandomValues(new Uint8Array(byteLength));
      };
    } else {
      return (byteLength: number) => {
        if (byteLength < 0) {
          throw new RangeError(
            `The argument 'byteLength' is invalid. Received ${byteLength}`
          );
        }
        return Uint8Array.from(
          Array.from({ length: byteLength }, () =>
            Math.floor(Math.random() * 256)
          )
        );
      };
    }
  })();

  // custom code end

  /**
   * Generate a 12 byte id buffer used in ObjectId's
   *
   * @param time - pass in a second based timestamp.
   */
  static generate(): Uint8Array {
    const time = Math.floor(Date.now() / 1000);

    const inc = ObjectId.getInc();
    const buffer = ObjectId.allocateUnsafe(12);

    // 4-byte timestamp
    ObjectId.setInt32BE(buffer, 0, time);

    // set PROCESS_UNIQUE if yet not initialized
    if (PROCESS_UNIQUE === null) {
      PROCESS_UNIQUE = ObjectId.webRandomBytes(5);
    }

    // 5-byte process unique
    buffer[4] = PROCESS_UNIQUE[0];
    buffer[5] = PROCESS_UNIQUE[1];
    buffer[6] = PROCESS_UNIQUE[2];
    buffer[7] = PROCESS_UNIQUE[3];
    buffer[8] = PROCESS_UNIQUE[4];

    // 3-byte counter
    buffer[11] = inc & 0xff;
    buffer[10] = (inc >> 8) & 0xff;
    buffer[9] = (inc >> 16) & 0xff;

    return buffer;
  }
}
