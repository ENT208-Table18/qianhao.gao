<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y>
      <!-- Header -->
      <view class="header">
        <view class="title-row">
          <image class="title-icon" :src="assets.titleIcon" mode="aspectFit" />
          <text class="title-text">虚拟房产</text>
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
          <text class="stat-label">我的房产</text>
          <text class="stat-value">{{ stats.owned }}</text>
        </view>
        <view class="stat-card stat-blue">
          <image class="stat-icon" :src="assets.statPeople" mode="aspectFit" />
          <text class="stat-label">总访客</text>
          <text class="stat-value">{{ stats.visitors }}</text>
        </view>
        <view class="stat-card stat-green">
          <image class="stat-icon" :src="assets.statChart" mode="aspectFit" />
          <text class="stat-label">总收益</text>
          <text class="stat-value">{{ stats.earnings }}</text>
        </view>
      </view>

      <!-- Progress -->
      <view class="progress-card">
        <view class="progress-top">
          <view class="progress-texts">
            <text class="progress-label">收集进度</text>
            <text class="progress-value">{{ unlockedCount }} / {{ totalSlots }}</text>
          </view>
          <image class="progress-star" :src="assets.starIcon" mode="aspectFit" />
        </view>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>
      </view>

      <!-- Info -->
      <view class="info-card">
        <view class="info-inner">
          <image class="info-icon" :src="assets.infoIcon" mode="aspectFit" />
          <view class="info-body">
            <text class="info-title">虚拟房产说明</text>
            <text class="info-line">• 使用旅行币解锁各省份的代表建筑</text>
            <view class="info-line-wrap">
              <text class="info-line">• 当其他用户访问你拥有房产的省份时，你将获得 </text>
              <text class="info-highlight">5 旅行币</text>
            </view>
            <text class="info-line">• 越早解锁，获得的访客收益越多</text>
            <text class="info-line">• 每个省份只有一个房产名额，先到先得！</text>
          </view>
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
              v-if="!item.owned"
              class="prop-lock"
              :src="assets.lockIcon"
              mode="aspectFit"
            />
            <text class="prop-emoji" :class="{ 'prop-emoji-owned': item.owned }">{{ item.emoji }}</text>
          </view>
          <view class="prop-footer">
            <text class="prop-name">{{ item.name }}</text>
            <view class="prop-region">
              <image class="prop-pin" :src="assets.pinIcon" mode="aspectFit" />
              <text class="prop-region-text">{{ item.region }}</text>
            </view>
            <view
              v-if="item.owned"
              class="unlock-btn unlock-btn-owned"
            >
              <text class="unlock-text">已解锁</text>
            </view>
            <view
              v-else
              class="unlock-btn"
              :class="{ disabled: travelCoins < item.price }"
              @click="onUnlock(item)"
            >
              <image class="unlock-coin" :src="assets.btnCoin" mode="aspectFit" />
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
            <text class="tips-title">如何获得更多旅行币？</text>
            <text class="tips-line">• 打卡新城市可获得 70-250 旅行币</text>
            <text class="tips-line">• 发布旅行动态可获得 30 旅行币</text>
            <text class="tips-line">• 评论和互动可获得 10 旅行币</text>
            <text class="tips-line tips-line-multiline">• 拥有虚拟房产后，每当有用户访问该省份，你都会获得 5 旅行币</text>
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
          :class="{ 'tab-icon-lg': currentTab === tab.id && tab.id === 'property' }"
          :src="currentTab === tab.id ? tab.activeIcon : tab.icon"
          mode="aspectFit"
        />
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
const ASSETS = {
  titleIcon: 'https://www.figma.com/api/mcp/asset/d1e65dc2-922c-4b0a-98a3-b2e5cee21e55',
  coinSmall: 'https://www.figma.com/api/mcp/asset/0ec8eab1-51b5-4cf5-885d-4bcd50cf0ecb',
  statHouse: 'https://www.figma.com/api/mcp/asset/26dba8cd-db0f-4451-a63b-9d3b2698936f',
  statPeople: 'https://www.figma.com/api/mcp/asset/bd693acd-b455-40bc-b31f-d5d1b506a96a',
  statChart: 'https://www.figma.com/api/mcp/asset/d60b3475-3fbc-4558-8a79-29d29fb392c6',
  starIcon: 'https://www.figma.com/api/mcp/asset/24fe32ab-5bca-4d36-85c9-ec153be5e34c',
  infoIcon: 'https://www.figma.com/api/mcp/asset/d37c42eb-b28c-4006-ae4c-28b2fe0774ac',
  pinIcon: 'https://www.figma.com/api/mcp/asset/dcbf0086-0421-435d-a34c-df98a5824f21',
  btnCoin: 'https://www.figma.com/api/mcp/asset/e8ee9672-870b-42cd-8b37-642aff13f636',
  lockIcon: 'https://www.figma.com/api/mcp/asset/b1b7d3a0-0ae2-48aa-b625-7fe5ffa6f466',
  tipsIcon: 'https://www.figma.com/api/mcp/asset/5590dedc-431d-469f-88e4-14fbc3d8e9cf',
}

export default {
  data() {
    return {
      currentTab: 'property',
      travelCoins: 370,
      totalSlots: 8,
      assets: ASSETS,
      stats: {
        owned: 0,
        visitors: 0,
        earnings: 0,
      },
      properties: [
        { id: '1', name: '故宫', region: '北京', emoji: '🏯', price: 300, owned: false },
        { id: '2', name: '东方明珠', region: '上海', emoji: '🗼', price: 250, owned: false },
        { id: '3', name: '苏州园林', region: '江苏', emoji: '🏛️', price: 280, owned: false },
        { id: '4', name: '雷峰塔', region: '浙江', emoji: '🕌', price: 260, owned: false },
        { id: '5', name: '广州塔', region: '广东', emoji: '🌆', price: 270, owned: false },
        { id: '6', name: '成都茶馆', region: '四川', emoji: '🏘️', price: 220, owned: false },
        { id: '7', name: '布达拉宫', region: '西藏', emoji: '⛩️', price: 500, owned: false },
        { id: '8', name: '丽江古城', region: '云南', emoji: '🏰', price: 240, owned: false },
      ],
      tabs: [
        { id: 'map', label: '地图', icon: 'https://www.figma.com/api/mcp/asset/99405741-5df3-4013-ae02-37e51264b359', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: '图片', icon: 'https://www.figma.com/api/mcp/asset/c95ac2ae-bd48-4f62-8c67-15de20f4e572', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: '动态', icon: 'https://www.figma.com/api/mcp/asset/9553672f-78f7-46b0-bcd6-9cf4050a1c49', activeIcon: 'https://www.figma.com/api/mcp/asset/6eee770c-e5a4-487f-8619-9af2c97c34da' },
        { id: 'property', label: '房产', icon: 'https://www.figma.com/api/mcp/asset/fb48a21e-d845-482d-a974-3978d2320c92', activeIcon: 'https://www.figma.com/api/mcp/asset/fb48a21e-d845-482d-a974-3978d2320c92' },
        { id: 'profile', label: '我的', icon: 'https://www.figma.com/api/mcp/asset/81c39444-5194-4ea0-901d-7548534095ab', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' },
      ],
    }
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
    unlockButtonLabel(item) {
      if (item.owned) return '已解锁'
      if (this.travelCoins >= item.price) {
        return `解锁 ${item.price}币`
      }
      const short = item.price - this.travelCoins
      return `缺 ${short}币`
    },
    onUnlock(item) {
      if (item.owned) return
      if (this.travelCoins < item.price) {
        uni.showToast({ title: `旅行币不足，还差 ${item.price - this.travelCoins} 币`, icon: 'none' })
        return
      }
      this.travelCoins -= item.price
      item.owned = true
      this.stats.owned += 1
      uni.showToast({ title: `已解锁 ${item.name}`, icon: 'success' })
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
        uni.showToast({ title: `${tab.label}功能开发中...`, icon: 'none' })
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
  margin-bottom: 32rpx;
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
  font-size: 48rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 64rpx;
}

.coin-badge {
  height: 64rpx;
  min-width: 146rpx;
  padding: 0 24rpx 0 20rpx;
  background: #f0b100;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.coin-badge-icon {
  width: 24rpx;
  height: 24rpx;
}

.coin-badge-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.stats-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  flex: 1;
  height: 192rpx;
  border-radius: 28rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
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
  width: 40rpx;
  height: 40rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 32rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 56rpx;
}

.progress-card {
  background: #ffffff;
  border: 3rpx solid #e9d4ff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.progress-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.progress-label {
  font-size: 28rpx;
  color: #4a5565;
  line-height: 40rpx;
}

.progress-value {
  display: block;
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 56rpx;
}

.progress-star {
  width: 48rpx;
  height: 48rpx;
}

.progress-track {
  height: 16rpx;
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

.info-card {
  background: linear-gradient(90deg, #eff6ff 0%, #faf5ff 100%);
  border: 1rpx solid #bedbff;
  border-radius: 28rpx;
  padding: 34rpx;
  margin-bottom: 32rpx;
}

.info-inner {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
}

.info-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.info-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 48rpx;
}

.info-line {
  font-size: 28rpx;
  color: #4a5565;
  line-height: 40rpx;
}

.info-line-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.info-highlight {
  font-size: 28rpx;
  font-weight: 700;
  color: #00a63e;
  line-height: 40rpx;
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
