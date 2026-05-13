import { getAccountScopedKey } from './account-session'

const STORAGE_KEY = 'travel-coins-v1'
export const DEFAULT_TRAVEL_COINS = 1000
export const REWARD_FOR_POST = 30
export const CITY_REWARD_MIN = 70
export const CITY_REWARD_MAX = 250

function normalizeCoinValue(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_TRAVEL_COINS
  return Math.max(0, Math.floor(parsed))
}

export function getTravelCoins() {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  const raw = uni.getStorageSync(scopedKey)
  let coins = DEFAULT_TRAVEL_COINS
  if (raw !== '' && raw !== undefined && raw !== null) {
    coins = normalizeCoinValue(raw)
  } else {
    uni.setStorageSync(scopedKey, coins)
  }
  return coins
}

export function setTravelCoins(value) {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  const coins = normalizeCoinValue(value)
  uni.setStorageSync(scopedKey, coins)
  return coins
}

export function addTravelCoins(delta) {
  const next = getTravelCoins() + normalizeCoinValue(delta)
  return setTravelCoins(next)
}

export function spendTravelCoins(delta) {
  const spend = normalizeCoinValue(delta)
  const current = getTravelCoins()
  if (current < spend) return { ok: false, balance: current }
  const balance = setTravelCoins(current - spend)
  return { ok: true, balance }
}

export function rewardForPost() {
  const reward = REWARD_FOR_POST
  const balance = addTravelCoins(reward)
  return { reward, balance }
}

export function rewardForCityLight() {
  const reward = Math.floor(Math.random() * (CITY_REWARD_MAX - CITY_REWARD_MIN + 1)) + CITY_REWARD_MIN
  const balance = addTravelCoins(reward)
  return { reward, balance }
}
