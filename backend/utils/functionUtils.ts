export function negate<T>(predicate: (value: T) => boolean): (value: T) => boolean {
  return (value: T) => !predicate(value);
}