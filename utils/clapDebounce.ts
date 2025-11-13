/**
 * Debounce utility for clap actions
 * Accumulates clap clicks and makes a single API call with the total count
 */

type ClapCallback = (count: number) => void | Promise<void>;
type ClapCallbackGetter = () => ClapCallback;

interface ClapDebounceOptions {
  delay?: number; // Delay in milliseconds (default: 1500ms)
  maxClaps?: number; // Maximum claps per debounce cycle
}

class ClapDebouncer {
  private timeoutId: NodeJS.Timeout | null = null;
  private clapCount: number = 0;
  private callback: ClapCallback | ClapCallbackGetter;
  private delay: number;
  private maxClaps: number;

  constructor(
    callback: ClapCallback | ClapCallbackGetter,
    options: ClapDebounceOptions = {}
  ) {
    this.callback = callback;
    this.delay = options.delay || 1500; // Default 1.5 seconds
    this.maxClaps = options.maxClaps || 50; // Default max 50 claps
  }

  /**
   * Get the current callback function
   */
  private getCallback(): ClapCallback | null {
    if (typeof this.callback === "function" && this.callback.length === 0) {
      // It's a getter function (ref pattern)
      const callback = (this.callback as ClapCallbackGetter)();
      return callback || null;
    }
    return this.callback as ClapCallback;
  }

  /**
   * Add a clap to the debounce queue
   * @param count Number of claps to add (default: 1)
   */
  addClap(count: number = 1): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Add to clap count (cap at maxClaps)
    this.clapCount = Math.min(this.clapCount + count, this.maxClaps);

    // Set new timeout
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  /**
   * Immediately flush pending claps
   */
  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.clapCount > 0) {
      const count = this.clapCount;
      this.clapCount = 0;
      const callback = this.getCallback();
      if (callback) {
        callback(count);
      }
    }
  }

  /**
   * Cancel pending claps
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.clapCount = 0;
  }

  /**
   * Get current pending clap count
   */
  getPendingCount(): number {
    return this.clapCount;
  }

  /**
   * Check if there are pending claps
   */
  hasPending(): boolean {
    return this.clapCount > 0;
  }
}

/**
 * Create a debounced clap handler
 * @param callback Function to call with the total clap count, or a getter function that returns the callback
 * @param options Debounce options
 * @returns ClapDebouncer instance
 */
export function createClapDebouncer(
  callback: ClapCallback | ClapCallbackGetter,
  options: ClapDebounceOptions = {}
): ClapDebouncer {
  return new ClapDebouncer(callback, options);
}
