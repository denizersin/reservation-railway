import React, { PropsWithChildren, useEffect, useState } from 'react'

type Props = {}

export const ClientComponent = ({ children }: PropsWithChildren) => {

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null

    return (
        <>{children}</>
  )
}