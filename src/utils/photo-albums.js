import { getAccountScopedKey } from './account-session'

const STORAGE_KEY = 'travel-photo-albums-v1'

function normalizeCityName(name) {
  return String(name || '').trim().replace(/市$/, '')
}

function formatCityName(name) {
  const city = normalizeCityName(name)
  if (!city) return ''
  return city.endsWith('市') ? city : `${city}市`
}

function safeParseStore(raw) {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    return {}
  }
}

function getAlbumStore() {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  return safeParseStore(uni.getStorageSync(scopedKey))
}

function saveAlbumStore(store) {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  uni.setStorageSync(scopedKey, JSON.stringify(store))
}

export function getPhotosByCity(cityName) {
  const key = normalizeCityName(cityName)
  if (!key) return []
  const store = getAlbumStore()
  const photos = store[key]
  return Array.isArray(photos) ? photos : []
}

export function addPhotosToCity(cityName, photos = []) {
  const key = normalizeCityName(cityName)
  if (!key || !Array.isArray(photos) || !photos.length) return getPhotosByCity(cityName)
  const store = getAlbumStore()
  const existingPhotos = Array.isArray(store[key]) ? store[key] : []
  store[key] = [...existingPhotos, ...photos]
  saveAlbumStore(store)
  return store[key]
}

export function buildAlbumsByCities(cities = []) {
  return cities
    .map((cityName) => normalizeCityName(cityName))
    .filter(Boolean)
    .map((cityKey) => ({
      id: cityKey,
      cityKey,
      city: formatCityName(cityKey),
      photos: getPhotosByCity(cityKey)
    }))
}
