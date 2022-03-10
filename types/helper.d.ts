export {};

declare global {
  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

  type Prettify<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

  type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
  ) => void
    ? I
    : never;

  type InjectTypes<T extends Array<() => object>> = T extends Array<() => infer P>
    ? Prettify<UnionToIntersection<P>>
    : never;

  type ArrayInnerType<T extends Array<any>> = T extends Array<infer P> ? P : never;

  type PrettifyDeep<T> = T extends Object
    ? {
        [K in keyof T]: PrettifyDeep<T[K]>;
      }
    : T extends Array<any>
    ? PrettifyDeep<ArrayInnerType<T>>[]
    : T;

  type Parameter<T> = T extends (arg: infer P) => void ? P : never;
}
