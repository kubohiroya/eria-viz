import pako from 'pako';

export function createNumberArray(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export type GroupByParams<T, K extends keyof T> = {
  source: T[];
  key: K;
};

export function groupBy<T, K extends keyof T>(
  params: GroupByParams<T, K>,
): Map<T[K], T[]> {
  const { source, key } = params;
  const result = new Map<T[K], T[]>();

  for (const item of source) {
    const mapKey = item[key];
    if (!result.has(mapKey)) {
      result.set(mapKey, []);
    }
    result.get(mapKey)!.push(item);
  }

  return result;
}

export function encodeBooleanArray(matrix: boolean[][]): { encoded: string, rowLengths: number[] } {
  const flattened = matrix.flat().map(value => value ? 1 : 0);
  const byteArray = new Uint8Array(flattened);

  const compressed = pako.deflate(byteArray);

  // Convert to Base64URL string without using Buffer
  const base64String = btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const rowLengths = matrix.map(row => row.length);

  return { encoded: base64String, rowLengths };
}

export function decodeBooleanArray(encoded: string, rowLengths: number[]): boolean[][] {
  // Convert from Base64URL to Base64
  const base64 = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(encoded.length + (4 - (encoded.length % 4)) % 4, '=');

  const compressed = new Uint8Array([...atob(base64)].map(char => char.charCodeAt(0)));
  const byteArray = pako.inflate(compressed);
  const booleanArray = Array.from(byteArray).map(value => value === 1);

  const result: boolean[][] = [];
  let index = 0;
  for (const length of rowLengths) {
    result.push(booleanArray.slice(index, index + length));
    index += length;
  }

  return result;
}

export function getRowLengths(matrix: boolean[][]): number[] {
  return matrix.map(row => row.length);
}