// No login yet (see TB-5). The customer ID is typed in once and remembered.
const KEY = 'shopfront.customerId'
export const DEFAULT_CUSTOMER_ID = 'web-customer'

export function getCustomerId(): string {
  try {
    return localStorage.getItem(KEY) || DEFAULT_CUSTOMER_ID
  } catch {
    return DEFAULT_CUSTOMER_ID
  }
}

export function setCustomerId(id: string): void {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // private mode etc. Not worth bothering the user about.
  }
}
