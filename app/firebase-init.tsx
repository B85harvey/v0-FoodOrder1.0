"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/firebase"

export default function FirebaseInit() {
  useEffect(() => {
    // Initialize Firebase Analytics
    const init = async () => {
      await initializeAnalytics()
    }

    init()
  }, [])

  return null
}
