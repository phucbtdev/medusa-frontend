"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { decodeToken } from "react-jwt"
import { sdk } from "@lib/config"

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()
  // for other than Next.js
  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return Object.fromEntries(searchParams.entries())
  }, [])

  const sendCallback = async () => {
    let token = ""
    console.log("✅queryParams", queryParams)

    try {
      token = await sdk.auth.callback("customer", "google", queryParams)
      console.log("✅ token", token)
    } catch (error) {
      alert("Authentication Failed")

      throw error
    }

    return token
  }

  const createCustomer = async () => {
    // create customer
    await sdk.store.customer.create({
      email: "example@medusajs.com",
    })
  }

  const refreshToken = async () => {
    // refresh the token
    const result = await sdk.auth.refresh()
  }

  const validateCallback = async () => {
    const token = await sendCallback()

    const isValid = decodeToken(token)
    console.log("✅Decoded Token:", isValid)

    const shouldCreateCustomer =
      (decodeToken(token) as { actor_id: string }).actor_id === ""

    if (shouldCreateCustomer) {
      await createCustomer()

      await refreshToken()
    }

    // all subsequent requests are authenticated
    const { customer: customerData } = await sdk.store.customer.retrieve()

    setCustomer(customerData)
    setLoading(false)
  }

  useEffect(() => {
    if (!loading) {
      return
    }

    validateCallback()
  }, [loading])

  return (
    <div>
      {loading && <span>Loading...</span>}
      {customer && <span>Created customer {customer.email} with Google.</span>}
    </div>
  )
}
