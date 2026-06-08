/** Normalizes text for Firebase keys and indexes. */
export function normalizeFirebaseKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
}

/** Normalizes text for Firebase search comparisons. */
export function normalizeFirebaseText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Creates a lowercase keyword list from multiple values. */
export function createFirebaseKeywords(values: string[]): string[] {
    return [...new Set(values.flatMap((value) => getWords(value)))];
}

/** Splits one value into searchable lowercase words. */
function getWords(value: string): string[] {
    return normalizeFirebaseText(value)
        .split(' ')
        .filter((word) => word.length > 1);
}