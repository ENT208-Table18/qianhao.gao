<template>
  <view class="page">
    <!-- Header Section -->
    <view class="header">
      <view class="header-content">
        <!-- Title -->
        <view class="title-row">
          <image class="title-icon" :src="assets.titleIcon" mode="aspectFit"></image>
          <text class="title-text">旅行大富翁</text>
        </view>

        <!-- Stats Cards -->
        <view class="stats-row">
          <view class="stat-card stat-card-gold">
            <image class="stat-icon" :src="assets.coinIcon" mode="aspectFit"></image>
            <view class="stat-info">
              <text class="stat-label">旅行币</text>
              <text class="stat-value">{{ stats.coins }}</text>
            </view>
          </view>
          <view class="stat-card stat-card-blue">
            <image class="stat-icon" :src="assets.locationIcon" mode="aspectFit"></image>
            <view class="stat-info">
              <text class="stat-label">已点亮</text>
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
            placeholder="搜索城市，如：太仓、苏州、南京..."
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
            <text class="map-hint-text">中国旅行地图 · 点击省份名称查看城市</text>
          </view>

          <!-- China Map -->
          <view class="china-map">
            <image 
              class="map-image" 
              :src="assets.chinaMap" 
              mode="aspectFit"
              @click="onMapClick"
            ></image>
            
            <!-- Province Labels (clickable) -->
            <view class="province-labels">
              <text 
                v-for="province in provinces" 
                :key="province.name"
                class="province-label"
                :class="{ 'visited': province.visited, 'capital': province.isCapital }"
                :style="{ left: province.x + '%', top: province.y + '%' }"
                @click="onProvinceClick(province)"
              >
                {{ province.isCapital ? '★' : '' }}{{ province.name }}
              </text>
            </view>

            <!-- Visited Markers -->
            <view 
              v-for="marker in visitedMarkers" 
              :key="marker.id"
              class="visited-marker"
              :style="{ left: marker.x + '%', top: marker.y + '%' }"
            >
              <view class="marker-dot"></view>
            </view>
          </view>
        </view>

        <!-- Map Tips -->
        <text class="map-tips">点击省份放大查看城市 · 使用搜索栏快速找到城市</text>
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
        <image class="tab-icon" :src="currentTab === tab.id ? tab.activeIcon : tab.icon" mode="aspectFit"></image>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      currentTab: 'map',
      stats: {
        coins: 390,
        visited: 3,
        total: 61
      },
      assets: {
        titleIcon: 'https://www.figma.com/api/mcp/asset/9666c00b-6837-49f1-84da-88eeacc2d281',
        coinIcon: 'https://www.figma.com/api/mcp/asset/b346be48-98a4-417d-9806-57626fa9a5d0',
        locationIcon: 'https://www.figma.com/api/mcp/asset/19864533-9fe8-4451-ab0a-6149fa41d0b1',
        searchIcon: 'https://www.figma.com/api/mcp/asset/97b1daf1-b97a-4cd6-951b-94a5b39ecb6c',
        chinaMap: 'https://www.figma.com/api/mcp/asset/163cd160-85f1-4d4b-ae65-916653b7c19f',
        mapIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6',
        mapIconActive: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6',
        photoIcon: 'https://www.figma.com/api/mcp/asset/63033fb7-192d-4406-82cc-16ff6a42af2b',
        feedIcon: 'https://www.figma.com/api/mcp/asset/07e4c92c-fa5a-4cea-9f04-f22964a378f5',
        propertyIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1',
        profileIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca'
      },
      tabs: [
        { id: 'map', label: '地图', icon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: '图片', icon: 'https://www.figma.com/api/mcp/asset/63033fb7-192d-4406-82cc-16ff6a42af2b', activeIcon: 'https://www.figma.com/api/mcp/asset/63033fb7-192d-4406-82cc-16ff6a42af2b' },
        { id: 'feed', label: '动态', icon: 'https://www.figma.com/api/mcp/asset/07e4c92c-fa5a-4cea-9f04-f22964a378f5', activeIcon: 'https://www.figma.com/api/mcp/asset/07e4c92c-fa5a-4cea-9f04-f22964a378f5' },
        { id: 'property', label: '房产', icon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: '我的', icon: 'https://www.figma.com/api/mcp/asset/81c39444-5194-4ea0-901d-7548534095ab', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' }
      ],
      provinces: [
        { name: '黑龙江', x: 84, y: 12, visited: false },
        { name: '吉林', x: 82, y: 20, visited: false },
        { name: '辽宁', x: 78, y: 28, visited: false },
        { name: '内蒙古', x: 48, y: 18, visited: false },
        { name: '北京', x: 68, y: 30, visited: true, isCapital: true },
        { name: '天津', x: 74, y: 32, visited: false },
        { name: '河北', x: 70, y: 36, visited: false },
        { name: '山西', x: 62, y: 34, visited: false },
        { name: '新疆', x: 18, y: 26, visited: false },
        { name: '甘肃', x: 38, y: 36, visited: false },
        { name: '宁夏', x: 50, y: 36, visited: false },
        { name: '西藏', x: 22, y: 50, visited: false },
        { name: '青海', x: 36, y: 42, visited: false },
        { name: '山东', x: 77, y: 40, visited: false },
        { name: '江苏', x: 78, y: 50, visited: true },
        { name: '上海', x: 84, y: 55, visited: true },
        { name: '安徽', x: 72, y: 53, visited: false },
        { name: '浙江', x: 80, y: 61, visited: false },
        { name: '陕西', x: 54, y: 42, visited: false },
        { name: '河南', x: 64, y: 46, visited: false },
        { name: '湖北', x: 62, y: 56, visited: false },
        { name: '湖南', x: 64, y: 66, visited: false },
        { name: '江西', x: 74, y: 65, visited: false },
        { name: '福建', x: 80, y: 71, visited: false },
        { name: '四川', x: 44, y: 54, visited: false },
        { name: '重庆', x: 54, y: 59, visited: false },
        { name: '贵州', x: 50, y: 68, visited: false },
        { name: '云南', x: 36, y: 66, visited: false },
        { name: '广西', x: 54, y: 77, visited: false },
        { name: '广东', x: 68, y: 79, visited: false },
        { name: '海南', x: 66, y: 91, visited: false },
        { name: '台湾', x: 86, y: 73, visited: false },
        { name: '香港', x: 76, y: 82, visited: false },
        { name: '澳门', x: 74, y: 85, visited: false }
      ],
      visitedMarkers: [
        { id: 1, x: 68, y: 30 },
        { id: 2, x: 78, y: 50 },
        { id: 3, x: 84, y: 55 }
      ]
    }
  },
  methods: {
    onSearchClick() {
      // Focus search input
    },
    onSearch() {
      if (!this.searchText.trim()) return
      uni.showToast({ 
        title: `搜索: ${this.searchText}`, 
        icon: 'none' 
      })
    },
    onMapClick(e) {
      uni.showToast({ 
        title: '点击省份名称查看详情', 
        icon: 'none' 
      })
    },
    onProvinceClick(province) {
      uni.showToast({ 
        title: `${province.name}${province.visited ? ' (已点亮)' : ''}`, 
        icon: 'none' 
      })
    },
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
          title: `${tab.label}功能开发中...`, 
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

.china-map {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
}

.map-image {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.province-labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.province-label {
  position: absolute;
  font-size: 18rpx;
  font-weight: 700;
  color: #01579b;
  opacity: 0.9;
  white-space: nowrap;
  pointer-events: auto;
  transform: translate(-50%, -50%);
}

.province-label.visited {
  color: #0277bd;
}

.province-label.capital {
  color: #d32f2f;
}

.visited-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.marker-dot {
  width: 16rpx;
  height: 16rpx;
  background: linear-gradient(135deg, #51a2ff 0%, #2b7fff 100%);
  border-radius: 50%;
  box-shadow: 0 0 8rpx rgba(43, 127, 255, 0.5);
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

.tab-label {
  font-size: 24rpx;
  color: #6a7282;
  line-height: 32rpx;
}

.tab-item.active .tab-label {
  color: #155dfc;
}
</style>
