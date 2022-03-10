function mapping2keys<T extends Record<string, unknown>>(
  v: T,
): {
  keys: (keyof T)[];
  keyMapping: Record<keyof T, keyof T>;
} {
  const keys = Object.keys(v) as Array<keyof T>;

  const keyMapping = keys.reduce((r, key) => {
    // eslint-disable-next-line no-param-reassign
    r[key] = key;
    return r;
  }, {} as unknown as Record<keyof T, keyof T>);

  return {
    keys,
    keyMapping,
  };
}

export default mapping2keys;
