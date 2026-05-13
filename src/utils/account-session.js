const CURRENT_ACCOUNT_STORAGE_KEY = 'travel-current-account-id-v1'

function normalizeAccountId(value) {
  return String(value || '').trim().toLowerCase()
}

export function setCurrentAccountId(accountId) {
  const normalized = normalizeAccountId(accountId)
  if (!normalized) return ''
  uni.setStorageSync(CURRENT_ACCOUNT_STORAGE_KEY, normalized)
  return normalized
}

export function getCurrentAccountId() {
  const raw = uni.getStorageSync(CURRENT_ACCOUNT_STORAGE_KEY)
  const normalized = normalizeAccountId(raw)
  return normalized || 'guest'
}

export function getAccountScopedKey(baseKey, accountId = getCurrentAccountId()) {
  return `${baseKey}:${accountId}`
}
