import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



type ObjectType = Record<string, any>;

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    console.log('arr', a, b)
    return a.length === b.length && a.every((v, i) => isEqual(v, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return keysA.length === keysB.length && keysA.every(key => isEqual(a[key], b[key]));
  }
  return false;
}

export function getChangedFields<T extends ObjectType>(newData: T, originalData: T): Partial<T> {
  const changedFields: Partial<T> = {};

  Object.keys(newData).forEach((key) => {
    const newValue = newData[key];
    const originalValue = originalData[key];

    if (newValue !== undefined && newValue !== null) {
      if (Array.isArray(newValue) && Array.isArray(originalValue)) {
        if (newValue.length !== originalValue.length) {
          (changedFields as any)[key] = newValue;
          return;
        }
        const changedArrayFields = newValue.filter((item, index) =>
          item !== undefined && item !== null &&
          (index >= originalValue.length || !isEqual(item, originalValue[index]))
        );
        if (changedArrayFields.length > 0) {
          (changedFields as any)[key] = newValue;
        }
      } else if (typeof newValue === 'object' && typeof originalValue === 'object') {
        const nestedChanges = getChangedFields(newValue, originalValue);
        if (Object.keys(nestedChanges).length > 0) {
          (changedFields as any)[key] = nestedChanges;
        }
      } else if (!isEqual(newValue, originalValue)) {
        (changedFields as any)[key] = newValue;
      }
    }
  });

  return changedFields;
}





export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  return array.reduce(
    (result, currentValue) => {
      const groupKey = currentValue[key] as unknown as string;
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentValue);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

export function groupByWithKeyFn<T, K>(
  array: T[],
  keyFn: (item: T) => K
): Record<string, T[]> {
  return array.reduce(
    (result, currentValue) => {
      const groupKey = keyFn(currentValue) as unknown as string;
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentValue);
      return result;
    },
    {} as Record<string, T[]>
  );
}