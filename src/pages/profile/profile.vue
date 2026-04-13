<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y>
      <!-- 顶部资料卡 -->
      <view class="hero-card">
        <view class="hero-top">
          <view class="hero-left">
            <view class="avatar-wrap">
              <view class="avatar-inner" />
            </view>
            <view class="hero-texts">
              <text class="hero-name">{{ displayName }}</text>
              <view class="level-pill">
                <image class="level-trophy" :src="assets.levelTrophy" mode="aspectFit" />
                <text class="level-text">等级 {{ level }}</text>
              </view>
            </view>
          </view>
          <view class="settings-btn" @click="onSettings">
            <view class="settings-gear">
              <image class="gear-part" :src="assets.gearOuter" mode="aspectFit" />
              <image class="gear-part gear-inner" :src="assets.gearInner" mode="aspectFit" />
            </view>
          </view>
        </view>

        <view class="progress-block">
          <view class="progress-row">
            <text class="progress-label">升级进度</text>
            <text class="progress-pct">{{ upgradePercent }}%</text>
          </view>
          <view class="progress-track">
            <view class="progress-fill" :style="{ width: upgradePercent + '%' }" />
          </view>
        </view>

        <view class="stats-row">
          <view class="stat-col">
            <view class="stat-top">
              <image class="stat-ico" :src="assets.coinIcon" mode="aspectFit" />
              <text class="stat-num">{{ travelCoins }}</text>
            </view>
            <text class="stat-cap">旅行币</text>
          </view>
          <view class="stat-col">
            <view class="stat-top">
              <image class="stat-ico" :src="assets.footprintIcon" mode="aspectFit" />
              <text class="stat-num">{{ footprintText }}</text>
            </view>
            <text class="stat-cap">足迹</text>
          </view>
          <view class="stat-col">
            <view class="stat-top">
              <image class="stat-ico" :src="assets.photoIcon" mode="aspectFit" />
              <text class="stat-num">{{ photoCount }}</text>
            </view>
            <text class="stat-cap">照片</text>
          </view>
        </view>
      </view>

      <!-- 我的成就 -->
      <view class="section">
        <view class="section-title">
          <image class="section-title-icon" :src="assets.achievementMedal" mode="aspectFit" />
          <text class="section-title-text">我的成就</text>
        </view>
        <view class="ach-grid">
          <view
            v-for="item in achievements"
            :key="item.id"
            class="ach-card"
            :class="item.unlocked ? 'ach-unlocked' : 'ach-locked'"
          >
            <text class="ach-emoji" :class="{ 'ach-emoji-dim': !item.unlocked }">{{ item.emoji }}</text>
            <text class="ach-name" :class="{ 'ach-name-muted': !item.unlocked }">{{ item.title }}</text>
            <view v-if="item.unlocked" class="ach-badge">
              <text class="ach-badge-text">已解锁</text>
            </view>
            <text v-else class="ach-progress">{{ item.progress }}</text>
          </view>
        </view>
      </view>

      <!-- 最近活动 -->
      <view class="section">
        <view class="section-title">
          <image class="section-title-icon" :src="assets.activityChevron" mode="aspectFit" />
          <text class="section-title-text">最近活动</text>
        </view>
        <view class="activity-card">
          <view
            v-for="(act, idx) in activities"
            :key="act.id"
            class="activity-row"
            :class="{ 'activity-row-last': idx === activities.length - 1 }"
          >
            <view class="activity-left">
              <view class="activity-icon-wrap" :style="{ backgroundColor: act.iconBg }">
                <image class="activity-icon" :src="act.icon" mode="aspectFit" />
              </view>
              <view class="activity-texts">
                <text class="activity-title">{{ act.title }}</text>
                <text class="activity-date">{{ act.date }}</text>
              </view>
            </view>
            <view class="activity-reward">
              <text class="activity-reward-text">{{ act.reward }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷功能 -->
      <view class="section section-last">
        <text class="shortcut-heading">快捷功能</text>
        <view
          v-for="s in shortcuts"
          :key="s.id"
          class="shortcut-card"
          @click="onShortcut(s)"
        >
          <view class="shortcut-row">
            <view class="shortcut-icon-wrap" :style="{ backgroundColor: s.iconBg }">
              <image class="shortcut-icon" :src="s.icon" mode="aspectFit" />
            </view>
            <text class="shortcut-label" :class="{ 'shortcut-logout': s.danger }">{{ s.label }}</text>
          </view>
          <image class="shortcut-chevron" :src="assets.chevronDown" mode="aspectFit" />
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
          :class="{ 'tab-icon-lg': currentTab === tab.id && tab.id === 'profile' }"
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
  levelTrophy: 'https://www.figma.com/api/mcp/asset/d8cc12ff-fd66-4fcc-a2b5-05041fe8e753',
  gearOuter: 'https://www.figma.com/api/mcp/asset/445b6bec-52ed-42eb-a590-774f7d9bf386',
  gearInner: 'https://www.figma.com/api/mcp/asset/2fdb5a7b-f69d-4e35-aee0-7036bd4593a9',
  coinIcon: 'https://www.figma.com/api/mcp/asset/c8118cb2-25bf-427e-b4cc-8ce8157fcb3a',
  footprintIcon: 'https://www.figma.com/api/mcp/asset/fb34428d-9b04-446c-b80e-97ce5af9e25c',
  photoIcon: 'https://www.figma.com/api/mcp/asset/24bc1fe4-5201-44e7-ba98-830ab6fbca01',
  achievementMedal: 'https://www.figma.com/api/mcp/asset/4be709a2-732b-4082-9276-f39274c700a0',
  activityChevron: 'https://www.figma.com/api/mcp/asset/3055b393-249d-4c60-88d7-2d7572f954ca',
  activityCheckin: 'https://www.figma.com/api/mcp/asset/b4220707-7a34-4c64-b951-aa740f2625c5',
  activityPhoto: 'https://www.figma.com/api/mcp/asset/a2813830-cfef-4850-a03a-7436a944f446',
  shortcutRank: 'https://www.figma.com/api/mcp/asset/82521109-2152-4fea-be8e-e0dcd3990cc0',
  shortcutShop: 'https://www.figma.com/api/mcp/asset/7514170c-a4ca-4487-9648-65b00b58167a',
  shortcutSettings: 'https://www.figma.com/api/mcp/asset/f5367888-10cb-420c-af46-163cae623a38',
  shortcutLogout: 'https://www.figma.com/api/mcp/asset/c1f732a6-b1ab-40d8-8cf0-b4c5932b2b31',
  chevronDown: 'https://www.figma.com/api/mcp/asset/be55b968-07dd-4b96-8396-2e8f5f094c06',
}

export default {
  data() {
    return {
      currentTab: 'profile',
      displayName: '旅行爱好者',
      level: 8,
      upgradePercent: 65,
      travelCoins: 370,
      footprintCurrent: 3,
      footprintTotal: 10,
      photoCount: 12,
      assets: ASSETS,
      achievements: [
        { id: '1', emoji: '🎯', title: '首次打卡', unlocked: true },
        { id: '2', emoji: '🌏', title: '环游中国', unlocked: false, progress: '3/10' },
        { id: '3', emoji: '📷', title: '摄影大师', unlocked: true },
        { id: '4', emoji: '💬', title: '社交达人', unlocked: false, progress: '5/20' },
        { id: '5', emoji: '🏠', title: 'AR探索者', unlocked: true },
        { id: '6', emoji: '💰', title: '财富自由', unlocked: false, progress: '370/1000' },
      ],
      activities: [
        {
          id: 'a1',
          title: '打卡 · 广东',
          date: '2026-03-25',
          reward: '+120',
          iconBg: '#dbeafe',
          icon: ASSETS.activityCheckin,
        },
        {
          id: 'a2',
          title: '上传照片 · 上海',
          date: '2026-03-20',
          reward: '+50',
          iconBg: '#f3e8ff',
          icon: ASSETS.activityPhoto,
        },
        {
          id: 'a3',
          title: '打卡 · 北京',
          date: '2026-03-15',
          reward: '+100',
          iconBg: '#dbeafe',
          icon: ASSETS.activityCheckin,
        },
      ],
      shortcuts: [
        { id: 's1', label: '排行榜', iconBg: '#dbeafe', icon: ASSETS.shortcutRank, action: 'rank' },
        { id: 's2', label: '旅行币商城', iconBg: '#f3e8ff', icon: ASSETS.shortcutShop, action: 'shop' },
        { id: 's3', label: '设置', iconBg: '#dcfce7', icon: ASSETS.shortcutSettings, action: 'settings' },
        { id: 's4', label: '退出登录', iconBg: '#ffe2e2', icon: ASSETS.shortcutLogout, action: 'logout', danger: true },
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
    footprintText() {
      return `${this.footprintCurrent}/${this.footprintTotal}`
    },
  },
  methods: {
    onSettings() {
      uni.showToast({ title: '设置', icon: 'none' })
    },
    onShortcut(s) {
      if (s.action === 'logout') {
        uni.showModal({
          title: '退出登录',
          content: '确定要退出当前账号吗？',
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({ url: '/pages/index/index' })
            }
          },
        })
        return
      }
      const titles = { rank: '排行榜', shop: '旅行币商城', settings: '设置' }
      uni.showToast({ title: `${titles[s.action] || s.label}开发中`, icon: 'none' })
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
  background: linear-gradient(117deg, #eff6ff 0%, #faf5ff 100%);
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

.hero-card {
  border-radius: 28rpx;
  padding: 48rpx 48rpx 40rpx;
  background: linear-gradient(90deg, #2b7fff 0%, #ad46ff 100%);
  margin-bottom: 32rpx;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 32rpx;
  flex: 1;
  min-width: 0;
}

.avatar-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 9999rpx;
  border: 7rpx solid #ffffff;
  padding: 7rpx;
  box-sizing: border-box;
  flex-shrink: 0;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 9999rpx;
  background: rgba(255, 255, 255, 0.35);
}

.hero-texts {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-top: 20rpx;
}

.hero-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 64rpx;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  height: 40rpx;
  padding: 0 16rpx 0 12rpx;
  background: #f0b100;
  border-radius: 16rpx;
  align-self: flex-start;
}

.level-trophy {
  width: 24rpx;
  height: 24rpx;
}

.level-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.settings-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-gear {
  position: relative;
  width: 48rpx;
  height: 48rpx;
}

.gear-part {
  position: absolute;
  left: 0;
  top: 0;
  width: 48rpx;
  height: 48rpx;
}

.gear-inner {
  transform: scale(0.45);
  left: 50%;
  top: 50%;
  margin-left: -24rpx;
  margin-top: -24rpx;
}

.progress-block {
  margin-bottom: 48rpx;
}

.progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-label,
.progress-pct {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 40rpx;
}

.progress-track {
  height: 16rpx;
  border-radius: 9999rpx;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999rpx;
  background: #030213;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.stat-ico {
  width: 40rpx;
  height: 40rpx;
}

.stat-num {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 64rpx;
}

.stat-cap {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 32rpx;
  text-align: center;
  width: 100%;
}

.section {
  margin-bottom: 32rpx;
}

.section-last {
  margin-bottom: 16rpx;
}

.section-title {
  position: relative;
  min-height: 56rpx;
  margin-bottom: 32rpx;
}

.section-title-icon {
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 40rpx;
  height: 40rpx;
}

.section-title-text {
  padding-left: 56rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 56rpx;
}

.ach-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx 17rpx;
}

.ach-card {
  width: calc((100% - 34rpx) / 3);
  box-sizing: border-box;
  min-height: 354rpx;
  border-radius: 28rpx;
  padding: 34rpx 24rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ach-unlocked {
  border: 1.5rpx solid #ffdf20;
  background: linear-gradient(121deg, #fefce8 0%, #fff7ed 100%);
}

.ach-locked {
  border: 1.5rpx solid #e5e7eb;
  background: #f3f4f6;
}

.ach-emoji {
  font-size: 72rpx;
  line-height: 80rpx;
  margin-bottom: 32rpx;
  text-align: center;
}

.ach-emoji-dim {
  opacity: 0.5;
}

.ach-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 40rpx;
  text-align: center;
  margin-bottom: auto;
}

.ach-name-muted {
  color: #6a7282;
}

.ach-badge {
  margin-top: 24rpx;
  padding: 4rpx 16rpx;
  background: #00c950;
  border-radius: 16rpx;
}

.ach-badge-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.ach-progress {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #6a7282;
  line-height: 32rpx;
  text-align: center;
}

.shortcut-heading {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 56rpx;
  margin-bottom: 32rpx;
}

.activity-card {
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  overflow: hidden;
}

.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1.5rpx solid rgba(0, 0, 0, 0.1);
}

.activity-row-last {
  border-bottom: none;
}

.activity-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
  min-width: 0;
}

.activity-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon {
  width: 40rpx;
  height: 40rpx;
}

.activity-texts {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.activity-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 48rpx;
}

.activity-date {
  font-size: 28rpx;
  color: #6a7282;
  line-height: 40rpx;
}

.activity-reward {
  padding: 4rpx 16rpx;
  background: #f0b100;
  border-radius: 16rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.activity-reward-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.shortcut-card {
  background: #ffffff;
  border: 1.5rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  padding: 34rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.shortcut-card:active {
  opacity: 0.92;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.shortcut-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-icon {
  width: 40rpx;
  height: 40rpx;
}

.shortcut-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 48rpx;
}

.shortcut-logout {
  color: #e7000b;
}

.shortcut-chevron {
  width: 40rpx;
  height: 40rpx;
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
