<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y>
      <!-- Header -->
      <view class="header">
        <view class="title-row">
          <image class="title-icon" :src="assets.titleIcon" mode="aspectFit" />
          <text class="title-text">Virtual Property</text>
        </view>
        <view class="coin-badge">
          <image class="coin-badge-icon" :src="assets.coinSmall" mode="aspectFit" />
          <text class="coin-badge-text">{{ travelCoins }}</text>
        </view>
      </view>

      <!-- Stats -->
      <view class="stats-row">
        <view class="stat-card stat-purple">
          <image class="stat-icon" :src="assets.statHouse" mode="aspectFit" />
          <text class="stat-label">My Properties</text>
          <text class="stat-value">{{ stats.owned }}</text>
        </view>
        <view class="stat-card stat-blue">
          <image class="stat-icon" :src="assets.statPeople" mode="aspectFit" />
          <text class="stat-label">Total Visitors</text>
          <text class="stat-value">{{ stats.visitors }}</text>
        </view>
        <view class="stat-card stat-green">
          <image class="stat-icon" :src="assets.statChart" mode="aspectFit" />
          <text class="stat-label">Total Earnings</text>
          <text class="stat-value">{{ stats.earnings }}</text>
        </view>
      </view>

      <!-- Progress -->
      <view class="progress-card">
        <view class="progress-top">
          <view class="progress-texts">
            <text class="progress-label">Collection Progress</text>
            <text class="progress-value">{{ unlockedCount }} / {{ totalSlots }}</text>
          </view>
          <image class="progress-star" :src="assets.starIcon" mode="aspectFit" />
        </view>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>
      </view>

      <!-- Property grid -->
      <view class="grid">
        <view
          v-for="item in properties"
          :key="item.id"
          class="prop-card"
        >
          <view class="prop-visual">
            <image
              v-if="!item.owned && canUnlockCity(item)"
              class="prop-lock"
              :src="assets.lockIcon"
              mode="aspectFit"
            />
            <view v-if="!item.owned && !canUnlockCity(item)" class="prop-lock-tag">
              <text class="prop-lock-tag-icon">🧭</text>
              <text class="prop-lock-tag-text">Not Lit</text>
            </view>
            <text class="prop-emoji" :class="{ 'prop-emoji-owned': item.owned }">{{ item.emoji }}</text>
          </view>
          <view class="prop-footer">
            <text class="prop-name">{{ item.name }}</text>
            <view class="prop-region">
              <image class="prop-pin" :src="assets.pinIcon" mode="aspectFit" />
              <text class="prop-region-text">{{ item.region }}</text>
            </view>
            <text v-if="!item.owned && !canUnlockCity(item)" class="prop-hint-text">
              Light up {{ displayCityName(item.requiredCity) }} on the map first
            </text>
            <view
              v-if="item.owned"
              class="unlock-btn unlock-btn-owned"
            >
              <text class="unlock-text">Unlocked</text>
            </view>
            <view
              v-else
              class="unlock-btn"
              :class="{ disabled: travelCoins < item.price || !canUnlockCity(item), 'unlock-btn-unavailable': !canUnlockCity(item) }"
              @click="onUnlock(item)"
            >
              <image v-if="canUnlockCity(item)" class="unlock-coin" :src="assets.btnCoin" mode="aspectFit" />
              <text v-else class="unlock-ban-icon">🚫</text>
              <text class="unlock-text">{{ unlockButtonLabel(item) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Tips -->
      <view class="tips-card">
        <view class="tips-inner">
          <image class="tips-icon" :src="assets.tipsIcon" mode="aspectFit" />
          <view class="tips-body">
            <text class="tips-title">How to earn more travel coins?</text>
            <text class="tips-line">• Check in to a new city: +70 to +250 coins</text>
            <text class="tips-line">• Publish a travel post: +30 coins</text>
            <text class="tips-line">• Comment and interact: +10 coins</text>
            <text class="tips-line tips-line-multiline">• Own properties: +5 coins when users visit that region</text>
          </view>
        </view>
      </view>

      <view class="scroll-bottom" />
    </scroll-view>

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
        />
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getLitCities, isCityLit } from '../../utils/city-progress'
import { getTravelCoins, spendTravelCoins } from '../../utils/travel-coins'

const ASSETS = {
  titleIcon: 'https://www.figma.com/api/mcp/asset/28f8deb7-0b13-4480-b50b-dd535b2f2b66',
  coinSmall: 'https://www.figma.com/api/mcp/asset/3f9ec72d-71d7-4fcd-ae33-671550586502',
  statHouse: 'https://www.figma.com/api/mcp/asset/6e36dd63-30c2-4ff1-b09c-9d3a0ac9bb7e',
  statPeople: 'https://www.figma.com/api/mcp/asset/ddf14635-5fc2-4893-8509-64fe4993f14f',
  statChart: 'https://www.figma.com/api/mcp/asset/9073be0c-2b8f-493d-b13c-c002f621be19',
  starIcon: 'https://www.figma.com/api/mcp/asset/83a03f08-a115-4a84-b4e5-46cc35d7cdc5',
  pinIcon: 'https://www.figma.com/api/mcp/asset/dcbf0086-0421-435d-a34c-df98a5824f21',
  btnCoin: 'https://www.figma.com/api/mcp/asset/e8ee9672-870b-42cd-8b37-642aff13f636',
  lockIcon: 'https://www.figma.com/api/mcp/asset/b1b7d3a0-0ae2-48aa-b625-7fe5ffa6f466',
  tipsIcon: 'https://www.figma.com/api/mcp/asset/5590dedc-431d-469f-88e4-14fbc3d8e9cf',
}
const CITY_NAME_MAP = {
  北京: 'Beijing',
  上海: 'Shanghai',
  苏州: 'Suzhou',
  杭州: 'Hangzhou',
  广州: 'Guangzhou',
  成都: 'Chengdu',
  拉萨: 'Lhasa',
  丽江: 'Lijiang'
}

export default {
  data() {
    return {
      currentTab: 'property',
      travelCoins: 0,
      totalSlots: 8,
      assets: ASSETS,
      stats: {
        owned: 0,
        visitors: 0,
        earnings: 0,
      },
      properties: [
        { id: '1', name: 'Forbidden City', region: 'Beijing', requiredCity: '北京', emoji: '🏯', price: 300, owned: false },
        { id: '2', name: 'Oriental Pearl', region: 'Shanghai', requiredCity: '上海', emoji: '🗼', price: 250, owned: false },
        { id: '3', name: 'Suzhou Gardens', region: 'Jiangsu', requiredCity: '苏州', emoji: '🏛️', price: 280, owned: false },
        { id: '4', name: 'Leifeng Pagoda', region: 'Zhejiang', requiredCity: '杭州', emoji: '🕌', price: 260, owned: false },
        { id: '5', name: 'Canton Tower', region: 'Guangdong', requiredCity: '广州', emoji: '🌆', price: 270, owned: false },
        { id: '6', name: 'Chengdu Teahouse', region: 'Sichuan', requiredCity: '成都', emoji: '🏘️', price: 220, owned: false },
        { id: '7', name: 'Potala Palace', region: 'Tibet', requiredCity: '拉萨', emoji: '⛩️', price: 500, owned: false },
        { id: '8', name: 'Lijiang Old Town', region: 'Yunnan', requiredCity: '丽江', emoji: '🏰', price: 240, owned: false },
      ],
      litCities: [],
      tabs: [
        { id: 'map', label: 'Map', icon: 'https://www.figma.com/api/mcp/asset/b6776cbe-770c-4921-871a-9fc88025e932', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: 'Photos', icon: 'https://www.figma.com/api/mcp/asset/d663b127-26cb-4190-a71c-54168849ec98', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: 'Feed', icon: 'https://www.figma.com/api/mcp/asset/73f0bb2c-6f9a-4de8-bc03-48fdcf00937e', activeIcon: 'https://www.figma.com/api/mcp/asset/6eee770c-e5a4-487f-8619-9af2c97c34da' },
        { id: 'property', label: 'Property', icon: 'https://www.figma.com/api/mcp/asset/a8e6a9b4-d139-42a3-8a43-9896a6ec8d01', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: 'Me', icon: 'https://www.figma.com/api/mcp/asset/08f7f439-9c4e-48ce-b5e3-3f9e21583ad6', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' },
      ],
    }
  },
  mounted() {
    this.syncTravelCoins()
    this.syncLitCities()
  },
  onShow() {
    this.syncTravelCoins()
    this.syncLitCities()
  },
  computed: {
    unlockedCount() {
      return this.properties.filter((p) => p.owned).length
    },
    progressPercent() {
      if (this.totalSlots <= 0) return 0
      return Math.round((this.unlockedCount / this.totalSlots) * 100)
    },
  },
  methods: {
    displayCityName(cityName) {
      return CITY_NAME_MAP[cityName] || cityName
    },
    syncTravelCoins() {
      this.travelCoins = getTravelCoins()
    },
    syncLitCities() {
      this.litCities = getLitCities()
    },
    canUnlockCity(item) {
      return isCityLit(item.requiredCity, this.litCities)
    },
    unlockButtonLabel(item) {
      if (item.owned) return 'Unlocked'
      if (!this.canUnlockCity(item)) return `Not lit: ${this.displayCityName(item.requiredCity)}`
      if (this.travelCoins >= item.price) {
        return `Unlock ${item.price} coins`
      }
      const short = item.price - this.travelCoins
      return `Need ${short} more`
    },
    onUnlock(item) {
      if (item.owned) return
      if (!this.canUnlockCity(item)) {
        uni.showToast({ title: `Please light up ${this.displayCityName(item.requiredCity)} first`, icon: 'none' })
        return
      }
      if (this.travelCoins < item.price) {
        uni.showToast({ title: `Insufficient coins, need ${item.price - this.travelCoins} more`, icon: 'none' })
        return
      }
      const result = spendTravelCoins(item.price)
      if (!result.ok) {
        this.syncTravelCoins()
        uni.showToast({ title: 'Insufficient travel coins', icon: 'none' })
        return
      }
      this.travelCoins = result.balance
      item.owned = true
      this.stats.owned += 1
      uni.showToast({ title: `Unlocked ${item.name}`, icon: 'success' })
    },
    onTabClick(tab) {
      if (this.currentTab === tab.id) return
      const routes = {
        map: '/pages/map/map',
        photo: '/pages/photo/photo',
        feed: '/pages/feed/feed',
        property: '/pages/property/property',
        profile: '/pages/profile/profile',
      }
      if (routes[tab.id]) {
        uni.redirectTo({ url: routes[tab.id] })
      } else {
        uni.showToast({ title: `${tab.label} is under development...`, icon: 'none' })
      }
    },
  },
}
</script>

<style>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(117deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%);
}

.scroll {
  flex: 1;
  height: 0;
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
}

.scroll-bottom {
  height: 24rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.title-icon {
  width: 46rpx;
  height: 46rpx;
}

.title-text {
  font-size: 46rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 58rpx;
}

.coin-badge {
  height: 62rpx;
  min-width: 140rpx;
  padding: 0 18rpx;
  background: #f0b100;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.coin-badge-icon {
  width: 22rpx;
  height: 22rpx;
}

.coin-badge-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.stats-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.stat-card {
  flex: 1;
  height: 184rpx;
  border-radius: 28rpx;
  padding: 18rpx 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.stat-purple {
  background: linear-gradient(138deg, #ad46ff 0%, #f6339a 100%);
}

.stat-blue {
  background: linear-gradient(138deg, #2b7fff 0%, #00b8db 100%);
}

.stat-green {
  background: linear-gradient(138deg, #00c950 0%, #00bba7 100%);
}

.stat-icon {
  width: 38rpx;
  height: 38rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 32rpx;
}

.stat-value {
  font-size: 42rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 52rpx;
}

.progress-card {
  background: #ffffff;
  border: 3rpx solid #e9d4ff;
  border-radius: 28rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.progress-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-label {
  font-size: 28rpx;
  color: #4a5565;
  line-height: 40rpx;
}

.progress-value {
  display: block;
  margin-top: 4rpx;
  font-size: 42rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 52rpx;
}

.progress-star {
  width: 42rpx;
  height: 42rpx;
}

.progress-track {
  height: 14rpx;
  background: rgba(3, 2, 19, 0.2);
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #030213;
  border-radius: 999rpx;
  transition: width 280ms ease;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24rpx 16rpx;
  margin-bottom: 32rpx;
}

.prop-card {
  width: calc(50% - 12rpx);
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  overflow: hidden;
  opacity: 0.95;
}

.prop-visual {
  position: relative;
  height: 320rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.prop-lock {
  position: absolute;
  left: 16rpx;
  top: 16rpx;
  width: 48rpx;
  height: 48rpx;
}

.prop-lock-tag {
  position: absolute;
  left: 16rpx;
  top: 16rpx;
  height: 42rpx;
  border-radius: 999rpx;
  padding: 0 14rpx 0 10rpx;
  background: rgba(30, 41, 57, 0.82);
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.prop-lock-tag-icon {
  font-size: 22rpx;
  line-height: 28rpx;
}

.prop-lock-tag-text {
  font-size: 20rpx;
  line-height: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.prop-emoji {
  font-size: 120rpx;
  opacity: 0.4;
  line-height: 1;
}

.prop-emoji-owned {
  opacity: 1;
}

.prop-footer {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.prop-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 40rpx;
}

.prop-region {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.prop-pin {
  width: 24rpx;
  height: 24rpx;
}

.prop-region-text {
  font-size: 24rpx;
  color: #4a5565;
  line-height: 32rpx;
}

.prop-hint-text {
  font-size: 22rpx;
  line-height: 32rpx;
  color: #8a4b12;
  background: #fff8e6;
  border-radius: 10rpx;
  padding: 8rpx 10rpx;
}

.unlock-btn {
  height: 64rpx;
  border-radius: 16rpx;
  background: linear-gradient(90deg, #2b7fff 0%, #ad46ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.unlock-btn:active {
  opacity: 0.92;
  transform: scale(0.98);
}

.unlock-btn.disabled {
  opacity: 0.85;
}

.unlock-btn-unavailable {
  background: linear-gradient(90deg, #9ca3af 0%, #6b7280 100%);
}

.unlock-btn-owned {
  background: #e5e7eb;
}

.unlock-coin {
  width: 32rpx;
  height: 32rpx;
}

.unlock-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.unlock-ban-icon {
  font-size: 24rpx;
  line-height: 32rpx;
}

.unlock-btn-owned .unlock-text {
  color: #6a7282;
}

.tips-card {
  background: linear-gradient(90deg, #fefce8 0%, #fff7ed 100%);
  border: 1rpx solid #fff085;
  border-radius: 28rpx;
  padding: 34rpx;
  margin-bottom: 16rpx;
}

.tips-inner {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
}

.tips-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.tips-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tips-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 48rpx;
}

.tips-line {
  font-size: 28rpx;
  color: #4a5565;
  line-height: 40rpx;
}

.tips-line-multiline {
  line-height: 44rpx;
}

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
