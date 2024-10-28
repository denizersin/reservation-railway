type NullToUndefined<T> = {
    [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
};

type TEnumKey<T> = keyof T;