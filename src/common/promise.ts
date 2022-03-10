function defer<T>(): {
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (err: Error) => void;
  promise: Promise<T>;
} {
  let resolve: any;
  let reject: any;
  const promise = new Promise<T>((re, rj) => {
    resolve = re;
    reject = rj;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

async function each<T>(arr: T[], fn: (v: T) => Promise<void> | void) {
  for (const item of arr) {
    await fn(item);
  }
}

async function mapSeries<T, U>(
  arr: T[],
  fn: (v: T, index: number, full: T[]) => Promise<U>,
) {
  const results: U[] = new Array(arr.length);

  for (let i = 0; i < arr.length; ++i) {
    results[i] = await fn(arr[i]!, i, arr);
  }

  return results;
}

export { defer, each, mapSeries };
