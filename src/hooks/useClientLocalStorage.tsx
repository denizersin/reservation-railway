"use client"

import { useEffect, useState } from "react"


export default function useClientLocalStorage() {

    if (typeof window === 'undefined') return {} as Storage

    return window.localStorage

}