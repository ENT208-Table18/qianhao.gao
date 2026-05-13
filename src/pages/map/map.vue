<template>
  <view class="page">
    <!-- Header Section -->
    <view class="header">
      <view class="header-content">
        <!-- Title -->
        <view class="title-row">
          <image class="title-icon" :src="assets.titleIcon" mode="aspectFit"></image>
          <text class="title-text">Travel Tycoon</text>
        </view>

        <!-- Stats Cards -->
        <view class="stats-row">
          <view class="stat-card stat-card-gold">
            <image class="stat-icon" :src="assets.coinIcon" mode="aspectFit"></image>
            <view class="stat-info">
              <text class="stat-label">Travel Coins</text>
              <text class="stat-value">{{ stats.coins }}</text>
            </view>
          </view>
          <view class="stat-card stat-card-blue">
            <image class="stat-icon" :src="assets.locationIcon" mode="aspectFit"></image>
            <view class="stat-info">
              <text class="stat-label">Lit</text>
              <text class="stat-value">{{ stats.visited }}/{{ stats.total }}</text>
            </view>
          </view>
        </view>

        <!-- Search Bar -->
        <view class="search-bar" @click="onSearchClick">
          <image class="search-icon" :src="assets.searchIcon" mode="aspectFit"></image>
          <input
            class="search-input"
            type="text"
            v-model="searchText"
            placeholder="Search city, e.g. Suzhou, Shanghai..."
            placeholder-class="search-placeholder"
            @confirm="onSearch"
          />
        </view>
      </view>
    </view>

    <!-- Map Section -->
    <view class="map-section">
      <view class="map-container">
        <!-- Map Card -->
        <view class="map-card">
          <!-- Map Hint -->
          <view class="map-hint">
            <text class="map-hint-text">China Travel Map · Tap markers to view cities</text>
          </view>

          <!-- AMap Web / Native Map -->
          <view class="native-map-wrap">
            <!-- #ifdef H5 -->
            <view v-show="amapReady" id="amap-web-container" class="amap-web-map"></view>
            <view v-if="!amapReady" class="map-fallback">
              <view class="map-fallback-grid"></view>
              <view
                v-for="city in localPreviewPoints"
                :key="city.id"
                class="fallback-city"
                :class="{ active: city.visited }"
                :style="{ left: city.previewLeft, top: city.previewTop }"
                @click.stop="onCityTap(city)"
              >
                <view class="fallback-dot"></view>
                <text class="fallback-label">{{ displayCityName(city.name) }}</text>
              </view>
              <view class="map-fallback-notice">
                <text class="map-fallback-title">Loading AMap</text>
                <text class="map-fallback-desc">Fallback preview appears when network fails</text>
              </view>
            </view>
            <!-- #endif -->

            <!-- #ifndef H5 -->
            <map
              class="native-map"
              :latitude="mapCenter.latitude"
              :longitude="mapCenter.longitude"
              :scale="mapScale"
              :markers="markers"
              :include-points="includePoints"
              :show-location="false"
              @tap="onMapClick"
              @markertap="onMarkerTap"
            ></map>
            <!-- #endif -->
          </view>
        </view>

        <!-- Map Tips -->
        <text class="map-tips">Tap a city to light it up · progress syncs to Photos and Profile</text>
      </view>
    </view>

    <!-- Bottom Navigation -->
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ active: currentTab === tab.id }"
        @click="onTabClick(tab)"
      >
        <image
          class="tab-icon"
          :class="{ 'tab-icon-lg': currentTab === tab.id }"
          :src="currentTab === tab.id ? tab.activeIcon : tab.icon"
          mode="aspectFit"
        ></image>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { addLitCity, getCityProgress, isCityLit, TOTAL_CITY_COUNT } from '../../utils/city-progress'
import { getTravelCoins, rewardForCityLight } from '../../utils/travel-coins'

const DEFAULT_MAP_CENTER = {
  latitude: 31.2646,
  longitude: 121.0295
}

const LOCAL_TRAVEL_POINTS = [
  { id: 1, name: '苏州', latitude: 31.2989, longitude: 120.5853, visited: true, previewLeft: '33%', previewTop: '53%' },
  { id: 2, name: '上海', latitude: 31.2304, longitude: 121.4737, visited: true, previewLeft: '63%', previewTop: '55%' },
  { id: 3, name: '北京', latitude: 39.9042, longitude: 116.4074, visited: false, previewLeft: '12%', previewTop: '15%' },
  { id: 4, name: '杭州', latitude: 30.2741, longitude: 120.1551, visited: false, previewLeft: '42%', previewTop: '75%' },
  { id: 5, name: '广州', latitude: 23.1291, longitude: 113.2644, visited: false, previewLeft: '26%', previewTop: '82%' },
  { id: 6, name: '成都', latitude: 30.5728, longitude: 104.0668, visited: false, previewLeft: '10%', previewTop: '58%' },
  { id: 7, name: '拉萨', latitude: 29.6520, longitude: 91.1721, visited: false, previewLeft: '6%', previewTop: '50%' },
  { id: 8, name: '丽江', latitude: 26.8721, longitude: 100.2260, visited: false, previewLeft: '14%', previewTop: '69%' }
]

const AMAP_SCRIPT_ID = 'amap-web-js-sdk'
const AMAP_WEB_KEY = 'ad7835edbe8777983595de2d7e7bd92a'
const CITY_NAME_MAP = {
  北京: 'Beijing',
  北京市: 'Beijing',
  上海: 'Shanghai',
  上海市: 'Shanghai',
  苏州: 'Suzhou',
  苏州市: 'Suzhou',
  杭州: 'Hangzhou',
  杭州市: 'Hangzhou',
  广州: 'Guangzhou',
  广州市: 'Guangzhou',
  成都: 'Chengdu',
  成都市: 'Chengdu',
  拉萨: 'Lhasa',
  拉萨市: 'Lhasa',
  丽江: 'Lijiang',
  丽江市: 'Lijiang'
}
const CITY_RADIUS_KM = {
  苏州: 45,
  上海: 55,
  北京: 65,
  杭州: 45,
  广州: 55,
  成都: 55,
  拉萨: 60,
  丽江: 50
}

export default {
  data() {
    return {
      searchText: '',
      currentTab: 'map',
      stats: {
        coins: 0,
        visited: 2,
        total: TOTAL_CITY_COUNT
      },
      mapCenter: { ...DEFAULT_MAP_CENTER },
      mapScale: 8,
      travelPoints: LOCAL_TRAVEL_POINTS,
      amapReady: false,
      amapInstance: null,
      amapMarkers: [],
      lightingInProgress: false,
      assets: {
        titleIcon: 'https://www.figma.com/api/mcp/asset/9666c00b-6837-49f1-84da-88eeacc2d281',
        coinIcon: 'https://www.figma.com/api/mcp/asset/b346be48-98a4-417d-9806-57626fa9a5d0',
        locationIcon: 'https://www.figma.com/api/mcp/asset/19864533-9fe8-4451-ab0a-6149fa41d0b1',
        searchIcon: 'https://www.figma.com/api/mcp/asset/97b1daf1-b97a-4cd6-951b-94a5b39ecb6c',
        mapIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6',
        mapIconActive: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6',
        photoIcon: 'https://www.figma.com/api/mcp/asset/63033fb7-192d-4406-82cc-16ff6a42af2b',
        feedIcon: 'https://www.figma.com/api/mcp/asset/07e4c92c-fa5a-4cea-9f04-f22964a378f5',
        propertyIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1',
        profileIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca'
      },
      tabs: [
        { id: 'map', label: 'Map', icon: 'https://www.figma.com/api/mcp/asset/b6776cbe-770c-4921-871a-9fc88025e932', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: 'Photos', icon: 'https://www.figma.com/api/mcp/asset/d663b127-26cb-4190-a71c-54168849ec98', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: 'Feed', icon: 'https://www.figma.com/api/mcp/asset/73f0bb2c-6f9a-4de8-bc03-48fdcf00937e', activeIcon: 'https://www.figma.com/api/mcp/asset/6eee770c-e5a4-487f-8619-9af2c97c34da' },
        { id: 'property', label: 'Property', icon: 'https://www.figma.com/api/mcp/asset/a8e6a9b4-d139-42a3-8a43-9896a6ec8d01', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: 'Me', icon: 'https://www.figma.com/api/mcp/asset/08f7f439-9c4e-48ce-b5e3-3f9e21583ad6', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' }
      ]
    }
  },
  computed: {
    markers() {
      return this.travelPoints
        .filter((city) => city.visited)
        .map((city) => ({
          id: city.id,
          title: this.displayCityName(city.name),
          latitude: city.latitude,
          longitude: city.longitude,
          width: 32,
          height: 32,
          callout: {
            content: `${this.displayCityName(city.name)} lit`,
            color: '#155dfc',
            fontSize: 13,
            borderRadius: 8,
            bgColor: '#ffffff',
            padding: 8,
            display: 'ALWAYS'
          }
        }))
    },
    includePoints() {
      return this.markers.map((marker) => ({
        latitude: marker.latitude,
        longitude: marker.longitude
      }))
    },
    localPreviewPoints() {
      return this.travelPoints.map((city) => ({
        ...city,
        previewLeft: city.previewLeft || '50%',
        previewTop: city.previewTop || '50%'
      }))
    }
  },
  mounted() {
    this.syncTravelCoins()
    this.syncCityProgress()
    this.loadTravelPoints()
    // #ifdef H5
    this.$nextTick(() => {
      this.initAmap()
    })
    // #endif
  },
  onShow() {
    this.syncTravelCoins()
    this.syncCityProgress()
  },
  beforeUnmount() {
    // #ifdef H5
    if (this.amapInstance && this.amapInstance.destroy) {
      this.amapInstance.destroy()
    }
    // #endif
  },
  methods: {
    displayCityName(name) {
      return CITY_NAME_MAP[name] || name
    },
    async loadTravelPoints() {
      try {
        if (typeof uniCloud === 'undefined') {
          this.syncCityProgress()
          return
        }

        const res = await uniCloud.callFunction({
          name: 'travel-map',
          data: {
            action: 'getTravelPoints'
          }
        })
        const points = res.result && res.result.data && res.result.data.points
        if (!Array.isArray(points) || !points.length) return

        const { litCities } = getCityProgress()
        this.travelPoints = points.map((point) => ({
          ...point,
          visited: isCityLit(point.name, litCities)
        }))
        this.refreshStats()
        // #ifdef H5
        this.renderAmapMarkers()
        // #endif
      } catch (error) {
        this.syncCityProgress()
      }
    },
    syncCityProgress() {
      const progress = getCityProgress()
      this.travelPoints = this.travelPoints.map((city) => ({
        ...city,
        visited: isCityLit(city.name, progress.litCities)
      }))
      this.stats.visited = progress.litCount
      this.stats.total = progress.totalCount
      // #ifdef H5
      this.renderAmapMarkers()
      // #endif
    },
    syncTravelCoins() {
      this.stats.coins = getTravelCoins()
    },
    refreshStats() {
      this.syncCityProgress()
    },
    onSearchClick() {
      // Focus search input
    },
    onSearch() {
      const keyword = this.searchText.trim()
      if (!keyword) return

      const city = this.travelPoints.find((item) => {
        const cityNameEn = this.displayCityName(item.name).toLowerCase()
        const cityNameZh = String(item.name || '')
        const normalizedKeyword = keyword.toLowerCase()
        return cityNameZh.includes(keyword) || keyword.includes(cityNameZh) || cityNameEn.includes(normalizedKeyword)
      })
      if (!city) {
        uni.showToast({
          title: `Not found: ${keyword}`,
          icon: 'none'
        })
        return
      }

      this.mapCenter = {
        latitude: city.latitude,
        longitude: city.longitude
      }
      this.mapScale = city.visited ? 11 : 6
      // #ifdef H5
      if (this.amapInstance) {
        this.amapInstance.setZoomAndCenter(city.visited ? 10 : 6, [city.longitude, city.latitude])
      }
      // #endif
      uni.showToast({ 
        title: `${this.displayCityName(city.name)} ${city.visited ? 'is lit' : 'not lit yet'}`,
        icon: 'none' 
      })
    },
    onMapClick() {
      uni.showToast({ 
        title: 'Suzhou and Shanghai are lit by default',
        icon: 'none' 
      })
    },
    onMarkerTap(e) {
      const markerId = (e.detail && e.detail.markerId) || e.markerId
      const marker = this.markers.find((item) => item.id === markerId)
      uni.showToast({ 
        title: marker ? `${this.displayCityName(marker.title)} is lit` : 'City is lit',
        icon: 'none' 
      })
    },
    normalizeCityName(name) {
      return String(name || '').trim().replace(/市$/, '')
    },
    getDistanceKm(from, to) {
      const toRad = (deg) => (deg * Math.PI) / 180
      const earthRadius = 6371
      const lat1 = toRad(Number(from.latitude))
      const lng1 = toRad(Number(from.longitude))
      const lat2 = toRad(Number(to.latitude))
      const lng2 = toRad(Number(to.longitude))
      const dLat = lat2 - lat1
      const dLng = lng2 - lng1
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return earthRadius * c
    },
    getCurrentLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            resolve({
              latitude: Number(res.latitude),
              longitude: Number(res.longitude)
            })
          },
          fail: reject
        })
      })
    },
    async verifyUserInCity(city) {
      try {
        const current = await this.getCurrentLocation()
        const radiusKm = CITY_RADIUS_KM[this.normalizeCityName(city.name)] || 50
        const distanceKm = this.getDistanceKm(current, city)
        if (distanceKm <= radiusKm) {
          return { ok: true, distanceKm, radiusKm }
        }
        return { ok: false, distanceKm, radiusKm }
      } catch (error) {
        return { ok: false, reason: 'location-failed' }
      }
    },
    async onCityTap(city) {
      const wasVisited = city.visited
      let cityReward = null
      if (!wasVisited && this.lightingInProgress) return
      if (!wasVisited) {
        this.lightingInProgress = true
        try {
          const verifyResult = await this.verifyUserInCity(city)
          if (!verifyResult.ok) {
            uni.showToast({
              title: verifyResult.reason === 'location-failed'
                ? 'Enable location permission before lighting a city'
                : `You need to be inside ${this.displayCityName(city.name)} to light it`,
              icon: 'none'
            })
            return
          }
          addLitCity(city.name)
          cityReward = rewardForCityLight()
          this.syncCityProgress()
          this.syncTravelCoins()
        } finally {
          this.lightingInProgress = false
        }
      }
      this.mapCenter = {
        latitude: city.latitude,
        longitude: city.longitude
      }
      uni.showToast({
        title: wasVisited
          ? `${this.displayCityName(city.name)} is already lit`
          : `${this.displayCityName(city.name)} lit successfully +${cityReward.reward} coins`,
        icon: 'none'
      })
    },
    // #ifdef H5
    getAmapKey() {
      return AMAP_WEB_KEY || (import.meta.env && import.meta.env.VITE_AMAP_WEB_KEY) || ''
    },
    loadAmapScript(key) {
      if (window.AMap) return Promise.resolve()

      const existingScript = document.getElementById(AMAP_SCRIPT_ID)
      if (existingScript) {
        return new Promise((resolve, reject) => {
          existingScript.addEventListener('load', resolve, { once: true })
          existingScript.addEventListener('error', reject, { once: true })
        })
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.id = AMAP_SCRIPT_ID
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    },
    async initAmap() {
      const key = this.getAmapKey()
      if (!key) return

      try {
        await this.loadAmapScript(key)
        this.amapInstance = new window.AMap.Map('amap-web-container', {
          zoom: this.mapScale,
          center: [this.mapCenter.longitude, this.mapCenter.latitude],
          viewMode: '2D'
        })
        this.amapReady = true
        this.$nextTick(() => {
          this.renderAmapMarkers()
        })
      } catch (error) {
        this.amapReady = false
      }
    },
    renderAmapMarkers() {
      if (!this.amapInstance || !window.AMap) return

      this.amapInstance.remove(this.amapMarkers)
      this.amapMarkers = this.travelPoints.map((city) => {
        const marker = new window.AMap.Marker({
          position: [city.longitude, city.latitude],
          title: this.displayCityName(city.name),
          label: {
            direction: 'top',
            content: `<div class="amap-city-label ${city.visited ? 'active' : ''}">${this.displayCityName(city.name)} ${city.visited ? 'lit' : 'not lit'}</div>`
          },
          icon: new window.AMap.Icon({
            image: city.visited
              ? 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
              : 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
            size: new window.AMap.Size(25, 34),
            imageSize: new window.AMap.Size(25, 34)
          })
        })
        marker.on('click', () => this.onCityTap(city))
        return marker
      })
      this.amapInstance.add(this.amapMarkers)
      this.amapInstance.setFitView(this.amapMarkers.filter((marker, index) => this.travelPoints[index].visited))
    },
    // #endif
    onTabClick(tab) {
      if (this.currentTab === tab.id) return
      
      if (tab.id === 'photo') {
        uni.redirectTo({ url: '/pages/photo/photo' })
      } else if (tab.id === 'feed') {
        uni.redirectTo({ url: '/pages/feed/feed' })
      } else if (tab.id === 'property') {
        uni.redirectTo({ url: '/pages/property/property' })
      } else if (tab.id === 'profile') {
        uni.redirectTo({ url: '/pages/profile/profile' })
      } else if (tab.id === 'map') {
        return
      } else {
        uni.showToast({ 
          title: `${tab.label} is under development...`, 
          icon: 'none' 
        })
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(117deg, #eff6ff 0%, #faf5ff 100%);
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.9);
  padding: 32rpx;
  box-shadow: 0 8rpx 12rpx rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.title-icon {
  width: 48rpx;
  height: 48rpx;
}

.title-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 56rpx;
}

/* Stats Cards */
.stats-row {
  display: flex;
  gap: 32rpx;
}

.stat-card {
  flex: 1;
  height: 136rpx;
  border-radius: 28rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.stat-card-gold {
  background: linear-gradient(90deg, #fdc700 0%, #f0b100 100%);
}

.stat-card-blue {
  background: linear-gradient(90deg, #51a2ff 0%, #2b7fff 100%);
}

.stat-icon {
  width: 40rpx;
  height: 40rpx;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 32rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 56rpx;
}

/* Search Bar */
.search-bar {
  height: 72rpx;
  background: #f3f3f5;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
  color: #1e2939;
  background: transparent;
}

.search-placeholder {
  color: #717182;
}

/* Map Section */
.map-section {
  flex: 1;
  padding: 32rpx;
  background: linear-gradient(117deg, #dbeafe 0%, #f3e8ff 50%, #fce7f3 100%);
  overflow: hidden;
}

.map-container {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.map-card {
  background: rgba(255, 255, 255, 0.5);
  border: 7rpx solid #ffffff;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 40rpx 50rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.map-hint {
  position: absolute;
  top: 32rpx;
  left: 32rpx;
  background: rgba(255, 255, 255, 0.8);
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.map-hint-text {
  font-size: 28rpx;
  color: #4a5565;
  line-height: 40rpx;
}

.native-map-wrap {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  background: linear-gradient(145deg, #eff6ff 0%, #ffffff 50%, #e0f2fe 100%);
}

.native-map {
  width: 100%;
  height: 100%;
}

.amap-web-map,
.map-fallback {
  width: 100%;
  height: 100%;
}

.map-fallback {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.18), transparent 30%),
    radial-gradient(circle at 68% 62%, rgba(16, 185, 129, 0.18), transparent 28%),
    linear-gradient(145deg, #eff6ff 0%, #ffffff 48%, #dbeafe 100%);
}

.map-fallback-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.08) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1rpx, transparent 1rpx);
  background-size: 80rpx 80rpx;
}

.fallback-city {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 2rpx solid rgba(148, 163, 184, 0.4);
  color: #64748b;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.1);
}

.fallback-city.active {
  border-color: rgba(37, 99, 235, 0.42);
  color: #155dfc;
  box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.2);
}

.fallback-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #94a3b8;
}

.fallback-city.active .fallback-dot {
  background: #2563eb;
  box-shadow: 0 0 0 10rpx rgba(37, 99, 235, 0.16);
}

.fallback-label {
  font-size: 24rpx;
  line-height: 32rpx;
  white-space: nowrap;
}

.map-fallback-notice {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.12);
}

.map-fallback-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 40rpx;
}

.map-fallback-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 34rpx;
}

.amap-city-label {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #64748b;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
}

.amap-city-label.active {
  color: #155dfc;
  font-weight: 700;
}

.map-tips {
  font-size: 28rpx;
  color: #4a5565;
  text-align: center;
  line-height: 40rpx;
}

/* Tab Bar */
.tab-bar {
  height: 130rpx;
  background: #ffffff;
  border-top: 1rpx solid #e5e7eb;
  display: flex;
  box-shadow: 0 -20rpx 30rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
}

.tab-icon-lg {
  width: 52rpx;
  height: 52rpx;
}

.tab-label {
  font-size: 24rpx;
  color: #6a7282;
  line-height: 32rpx;
}

.tab-item.active .tab-label {
  color: #155dfc;
}
</style>
