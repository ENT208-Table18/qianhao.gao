<template>
  <view class="page">
    <!-- Header Section -->
    <view class="header">
      <!-- Title -->
      <view class="title-row">
        <image class="title-icon" :src="assets.cameraIcon" mode="aspectFit"></image>
        <text class="title-text">我的照片</text>
      </view>

      <!-- Stats Cards -->
      <view class="stats-row">
        <view class="stat-card stat-card-blue">
          <image class="stat-icon" :src="assets.photoIcon" mode="aspectFit"></image>
          <text class="stat-label">总照片</text>
          <text class="stat-value">{{ stats.totalPhotos }}</text>
        </view>
        <view class="stat-card stat-card-purple">
          <image class="stat-icon" :src="assets.cityIcon" mode="aspectFit"></image>
          <text class="stat-label">城市</text>
          <text class="stat-value">{{ stats.cities }}</text>
        </view>
        <view class="stat-card stat-card-green">
          <image class="stat-icon" :src="assets.videoIcon" mode="aspectFit"></image>
          <text class="stat-label">视频</text>
          <text class="stat-value">{{ stats.videos }}</text>
        </view>
      </view>
    </view>

    <!-- Photo Albums Section -->
    <scroll-view class="albums-section" scroll-y>
      <view class="albums-list">
        <!-- City Album Card -->
        <view 
          v-for="album in albums" 
          :key="album.id" 
          class="album-card"
        >
          <!-- Album Header -->
          <view class="album-header">
            <view class="album-info">
              <view class="album-title-row">
                <image class="album-icon" :src="assets.locationIcon" mode="aspectFit"></image>
                <text class="album-title">{{ album.city }}</text>
              </view>
              <text class="album-count">{{ album.photos.length }} 张照片</text>
            </view>
            <view class="add-btn" @click="onAddPhoto(album)">
              <image class="add-icon" :src="assets.addIcon" mode="aspectFit"></image>
              <text class="add-text">添加</text>
            </view>
          </view>

          <!-- Album Photos -->
          <view class="album-content">
            <view v-if="album.photos.length > 0" class="photo-grid">
              <view 
                v-for="(photo, index) in album.photos" 
                :key="index" 
                class="photo-item"
                @click="onPhotoClick(album, photo)"
              >
                <image class="photo-image" :src="photo.url" mode="aspectFill"></image>
              </view>
            </view>
            <view v-else class="empty-state">
              <image class="empty-icon" :src="assets.emptyIcon" mode="aspectFit"></image>
              <text class="empty-text">还没有照片，点击上方添加按钮上传</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

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
      currentTab: 'photo',
      stats: {
        totalPhotos: 5,
        cities: 3,
        videos: 0
      },
      assets: {
        cameraIcon: 'https://www.figma.com/api/mcp/asset/ac715f56-04e2-4d01-8070-cc4993f35fed',
        photoIcon: 'https://www.figma.com/api/mcp/asset/923fb0fc-10f8-472d-8267-65c62623658b',
        cityIcon: 'https://www.figma.com/api/mcp/asset/10eb12e0-6293-479b-8074-2410bcc468f2',
        videoIcon: 'https://www.figma.com/api/mcp/asset/b36b4296-88ec-43e8-aa0f-a9f890542a8b',
        locationIcon: 'https://www.figma.com/api/mcp/asset/71da8e78-4d27-44ad-9f01-4b5fd3b42c72',
        addIcon: 'https://www.figma.com/api/mcp/asset/846e059a-e93c-407e-96d8-ed523736247b',
        emptyIcon: 'https://www.figma.com/api/mcp/asset/c8b381f7-6d4f-4962-baaa-c0bdc554e801'
      },
      tabs: [
        { id: 'map', label: '地图', icon: 'https://www.figma.com/api/mcp/asset/812c6655-f7f5-435c-8074-6fd0a3cd36b7', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: '图片', icon: 'https://www.figma.com/api/mcp/asset/63033fb7-192d-4406-82cc-16ff6a42af2b', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: '动态', icon: 'https://www.figma.com/api/mcp/asset/b237b892-2ed2-438c-a246-6e41b0f6ccf3', activeIcon: 'https://www.figma.com/api/mcp/asset/07e4c92c-fa5a-4cea-9f04-f22964a378f5' },
        { id: 'property', label: '房产', icon: 'https://www.figma.com/api/mcp/asset/6205b2eb-4763-46cf-85d1-dbfc5abde70d', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: '我的', icon: 'https://www.figma.com/api/mcp/asset/12206625-665a-4c3c-8d60-c2f138a7c1a5', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' }
      ],
      albums: [
        {
          id: 1,
          city: '北京市',
          photos: [
            { id: 1, url: 'https://www.figma.com/api/mcp/asset/207f7b6f-1b8f-4b15-8fcb-5119202bcca9', name: '长城的壮丽景色' },
            { id: 2, url: 'https://www.figma.com/api/mcp/asset/54a4484e-6d51-47d5-b40b-da70e528aee3', name: '故宫的红墙金瓦' }
          ]
        },
        {
          id: 2,
          city: '上海市',
          photos: [
            { id: 3, url: 'https://www.figma.com/api/mcp/asset/80656d5e-7447-4047-827d-f9a8249ff442', name: '外滩夜景' }
          ]
        },
        {
          id: 3,
          city: '广州',
          photos: []
        }
      ]
    }
  },
  methods: {
    onAddPhoto(album) {
      uni.showToast({ 
        title: `为${album.city}添加照片`, 
        icon: 'none' 
      })
    },
    onPhotoClick(album, photo) {
      uni.previewImage({
        current: photo.url,
        urls: album.photos.map(p => p.url)
      })
    },
    onTabClick(tab) {
      if (this.currentTab === tab.id) return
      
      if (tab.id === 'map') {
        uni.redirectTo({ url: '/pages/map/map' })
      } else if (tab.id === 'feed') {
        uni.redirectTo({ url: '/pages/feed/feed' })
      } else if (tab.id === 'property') {
        uni.redirectTo({ url: '/pages/property/property' })
      } else if (tab.id === 'profile') {
        uni.redirectTo({ url: '/pages/profile/profile' })
      } else if (tab.id === 'photo') {
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
  background: linear-gradient(115deg, #eff6ff 0%, #faf5ff 100%);
}

/* Header */
.header {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
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

/* Stats Cards */
.stats-row {
  display: flex;
  gap: 24rpx;
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

.stat-card-blue {
  background: linear-gradient(138deg, #2b7fff 0%, #00b8db 100%);
}

.stat-card-purple {
  background: linear-gradient(138deg, #ad46ff 0%, #f6339a 100%);
}

.stat-card-green {
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

/* Albums Section */
.albums-section {
  flex: 1;
  padding: 0 32rpx;
}

.albums-list {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  padding-bottom: 32rpx;
}

/* Album Card */
.album-card {
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 30rpx rgba(0, 0, 0, 0.1);
}

.album-header {
  background: linear-gradient(90deg, #eff6ff 0%, #faf5ff 100%);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.album-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.album-icon {
  width: 40rpx;
  height: 40rpx;
}

.album-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 54rpx;
}

.album-count {
  font-size: 24rpx;
  color: #4a5565;
  line-height: 32rpx;
}

.add-btn {
  height: 64rpx;
  padding: 0 20rpx;
  background: #2b7fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.add-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.add-icon {
  width: 32rpx;
  height: 32rpx;
}

.add-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 40rpx;
}

/* Album Content */
.album-content {
  padding: 32rpx;
  min-height: 200rpx;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.photo-item {
  width: 188rpx;
  height: 188rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.photo-item:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.photo-image {
  width: 100%;
  height: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
  gap: 16rpx;
}

.empty-icon {
  width: 96rpx;
  height: 96rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #6a7282;
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

.tab-item.active .tab-icon {
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
