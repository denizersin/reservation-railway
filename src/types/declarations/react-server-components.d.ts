import React from 'react'

declare module 'react' {
  interface ReactElement {
    $$typeof: symbol
    type: any
    props: any
    key: string | null
  }
}