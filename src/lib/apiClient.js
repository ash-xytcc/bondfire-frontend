export async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export function getErrorMessage(data, fallback) {
  return (
    data?.errorInfo?.message ||
    data?.error ||
    fallback
  )
}

export function requireOk(data, res, fallback) {
  if (!res.ok || !data?.ok) {
    const error = new Error(getErrorMessage(data, fallback))
    error.status = res.status
    error.info = data?.errorInfo || null
    throw error
  }
  return data
}
