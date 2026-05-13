import { getAccountScopedKey } from './account-session'

const STORAGE_KEY = 'travel-lit-cities-v1'

export const TOTAL_CITY_COUNT = 8

export const DEFAULT_LIT_CITIES = ['苏州', '上海']

function normalizeCityName(name) {
  return String(name || '').trim().replace(/市$/, '')
}

function uniqueCities(cities = []) {
  const normalized = cities.map(normalizeCityName).filter(Boolean)
  return [...new Set(normalized)]
}

export function getLitCities() {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  const raw = uni.getStorageSync(scopedKey)
  let stored = []
  if (Array.isArray(raw)) {
    stored = raw
  } else if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        stored = parsed
      }
    } catch (error) {
      stored = []
    }
  }
  const merged = uniqueCities(stored.length ? stored : DEFAULT_LIT_CITIES)
  if (!raw) {
    uni.setStorageSync(scopedKey, JSON.stringify(merged))
  }
  return merged
}

export function setLitCities(cities = []) {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  const merged = uniqueCities(cities)
  uni.setStorageSync(scopedKey, JSON.stringify(merged))
  return merged
}

export function addLitCity(cityName) {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  const cities = getLitCities()
  const normalized = normalizeCityName(cityName)
  if (!normalized) return cities
  if (cities.includes(normalized)) return cities
  const next = [...cities, normalized]
  uni.setStorageSync(scopedKey, JSON.stringify(next))
  return next
}

export function isCityLit(cityName, litCities = getLitCities()) {
  return litCities.includes(normalizeCityName(cityName))
}

export function getCityProgress() {
  const litCities = getLitCities()
  return {
    litCities,
    litCount: litCities.length,
    totalCount: TOTAL_CITY_COUNT
  }
}
