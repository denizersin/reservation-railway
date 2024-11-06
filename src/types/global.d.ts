type NullToUndefined<T> = {
    [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
};

type TEnumKey<T> = keyof T;



declare module '*.svg' {
    import { FC, SVGProps } from 'react'
    const content: FC<SVGProps<SVGElement>>
    export default content
  }
  
  declare module '*.svg?url' {
    const content: any
    export default content
  }