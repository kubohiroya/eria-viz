export function createNumberArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
}

export type GroupByParams<T, K extends keyof T> = {
    source: T[];
    key: K;
};

export function groupBy<T, K extends keyof T>(params: GroupByParams<T, K>): Map<T[K], T[]> {
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
