export function last<T>(source: ReadonlyArray<T>): T | undefined {
  return source[source.length - 1];
}

export function takeLast<T>(source: ReadonlyArray<T>, take: number): ReadonlyArray<T> {
  return source.slice(Math.max(source.length - take, 0));
}
