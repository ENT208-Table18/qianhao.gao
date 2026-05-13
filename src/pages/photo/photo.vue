<template>
  <view class="page">
    <scroll-view class="albums-section" scroll-y>
      <view class="content-wrap">
        <view class="header">
          <view class="title-row">
            <image class="title-icon" :src="assets.cameraIcon" mode="aspectFit"></image>
            <text class="title-text">My Photos</text>
          </view>

          <view class="stats-row">
            <view class="stat-card stat-card-blue">
              <image class="stat-icon" :src="assets.photoIcon" mode="aspectFit"></image>
              <text class="stat-label">Total Photos</text>
              <text class="stat-value">{{ stats.totalPhotos }}</text>
            </view>
            <view class="stat-card stat-card-purple">
              <image class="stat-icon" :src="assets.cityIcon" mode="aspectFit"></image>
              <text class="stat-label">Cities</text>
              <text class="stat-value">{{ stats.cities }}</text>
            </view>
            <view class="stat-card stat-card-green">
              <image class="stat-icon" :src="assets.videoIcon" mode="aspectFit"></image>
              <text class="stat-label">Videos</text>
              <text class="stat-value">{{ stats.videos }}</text>
            </view>
          </view>
        </view>

        <view class="albums-list">
          <view v-for="album in albums" :key="album.id" class="album-card">
            <view class="album-top">
              <view class="album-info">
                <view class="album-title-row">
                  <image class="album-icon" :src="assets.locationIcon" mode="aspectFit"></image>
                  <text class="album-title">{{ displayCityName(album.city) }}</text>
                </view>
                <text class="album-count">{{ album.photos.length }} photos</text>
              </view>

              <view class="album-actions">
                <view class="action-btn post-btn" @click="onPostFeed(album)">
                  <image class="action-icon" :src="assets.feedIcon" mode="aspectFit"></image>
                  <text class="post-text">Post Feed</text>
                </view>
                <view class="action-btn add-btn" @click="onAddPhoto(album)">
                  <image class="action-icon" :src="assets.addIcon" mode="aspectFit"></image>
                  <text class="add-text">Add Photo</text>
                </view>
              </view>
            </view>

            <view class="album-content">
              <view v-if="album.photos.length > 0" class="photo-grid" :class="{ single: album.photos.length === 1 }">
                <view
                  v-for="photo in album.photos"
                  :key="photo.id"
                  class="photo-item"
                  @click="onPhotoClick(album, photo)"
                >
                  <image class="photo-image" :src="photo.url" mode="aspectFill"></image>
                </view>
              </view>
              <view v-else class="empty-state">
                <image class="empty-icon" :src="assets.emptyIcon" mode="aspectFit"></image>
                <text class="empty-text">No photos yet. Tap “Add Photo” to upload</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="showPublishPopup" class="publish-mask" @click="closePublishPopup">
      <view class="publish-dialog" @click.stop>
        <view class="publish-header">
          <text class="publish-title">Publish Post</text>
          <text class="publish-close" @click="closePublishPopup">Close</text>
        </view>
        <text class="publish-city">Post to {{ displayCityName(publishCity) }}</text>

        <text class="publish-label">Select a photo in this city</text>
        <scroll-view class="publish-photo-scroll" scroll-x>
          <view class="publish-photo-list">
            <view
              v-for="photo in publishPhotoOptions"
              :key="`publish-${photo.id}`"
              class="publish-photo-item"
              :class="{ active: selectedPublishPhotoId === photo.id }"
              @click="onSelectPublishPhoto(photo)"
            >
              <image class="publish-photo-image" :src="photo.url" mode="aspectFill"></image>
            </view>
          </view>
        </scroll-view>

        <text class="publish-label">Post Content</text>
        <textarea
          class="publish-textarea"
          v-model="publishText"
          maxlength="200"
          placeholder="Share your travel story..."
          placeholder-class="publish-placeholder"
        />

        <view class="publish-actions">
          <view class="publish-btn cancel" @click="closePublishPopup">
            <text class="publish-btn-text cancel-text">Cancel</text>
          </view>
          <view class="publish-btn confirm" @click="onConfirmPublish">
            <text class="publish-btn-text">Publish</text>
          </view>
        </view>
      </view>
    </view>

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
import { addUserPost } from '../../utils/feed-posts'
import { getCityProgress } from '../../utils/city-progress'
import { rewardForPost } from '../../utils/travel-coins'
import { addPhotosToCity, buildAlbumsByCities } from '../../utils/photo-albums'

const MAP_CITY_KEYS = ['北京', '上海', '苏州', '杭州', '广州', '成都', '拉萨', '丽江']
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

function normalizeCityName(name) {
  return String(name || '').trim().replace(/市$/, '')
}

export default {
  data() {
    return {
      currentTab: 'photo',
      stats: {
        totalPhotos: 0,
        cities: 2,
        videos: 0
      },
      showPublishPopup: false,
      activePublishAlbumId: null,
      selectedPublishPhotoId: null,
      publishText: '',
      assets: {
        cameraIcon: 'https://www.figma.com/api/mcp/asset/be69ce9a-6262-4736-82cc-5816e68bb4a2',
        photoIcon: 'https://www.figma.com/api/mcp/asset/864fc1d6-d466-4619-9349-d7c59d0d7eed',
        cityIcon: 'https://www.figma.com/api/mcp/asset/205e7c6a-edba-4b10-b373-482a7ff7ecf2',
        videoIcon: 'https://www.figma.com/api/mcp/asset/b1e29a79-0a60-486e-aa1c-8b81073051a7',
        locationIcon: 'https://www.figma.com/api/mcp/asset/71da8e78-4d27-44ad-9f01-4b5fd3b42c72',
        addIcon: 'https://www.figma.com/api/mcp/asset/846e059a-e93c-407e-96d8-ed523736247b',
        feedIcon: 'https://www.figma.com/api/mcp/asset/07e4c92c-fa5a-4cea-9f04-f22964a378f5',
        emptyIcon: 'https://www.figma.com/api/mcp/asset/c8b381f7-6d4f-4962-baaa-c0bdc554e801'
      },
      tabs: [
        { id: 'map', label: 'Map', icon: 'https://www.figma.com/api/mcp/asset/b6776cbe-770c-4921-871a-9fc88025e932', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: 'Photos', icon: 'https://www.figma.com/api/mcp/asset/d663b127-26cb-4190-a71c-54168849ec98', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: 'Feed', icon: 'https://www.figma.com/api/mcp/asset/73f0bb2c-6f9a-4de8-bc03-48fdcf00937e', activeIcon: 'https://www.figma.com/api/mcp/asset/6eee770c-e5a4-487f-8619-9af2c97c34da' },
        { id: 'property', label: 'Property', icon: 'https://www.figma.com/api/mcp/asset/a8e6a9b4-d139-42a3-8a43-9896a6ec8d01', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: 'Me', icon: 'https://www.figma.com/api/mcp/asset/08f7f439-9c4e-48ce-b5e3-3f9e21583ad6', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' }
      ],
      albums: []
    }
  },
  computed: {
    activePublishAlbum() {
      return this.albums.find((album) => album.id === this.activePublishAlbumId) || null
    },
    publishPhotoOptions() {
      return (this.activePublishAlbum && this.activePublishAlbum.photos) || []
    },
    publishCity() {
      return (this.activePublishAlbum && this.activePublishAlbum.city) || ''
    }
  },
  mounted() {
    this.syncAlbumsAndStats()
  },
  onShow() {
    this.syncAlbumsAndStats()
  },
  methods: {
    displayCityName(name) {
      return CITY_NAME_MAP[name] || name
    },
    syncAlbumsAndStats() {
      const { litCities } = getCityProgress()
      const mapCitySet = new Set(MAP_CITY_KEYS.map((city) => normalizeCityName(city)))
      const filteredLitCities = litCities.filter((city) => mapCitySet.has(normalizeCityName(city)))
      this.albums = buildAlbumsByCities(filteredLitCities)
      if (this.activePublishAlbumId && !this.albums.some((album) => album.id === this.activePublishAlbumId)) {
        this.closePublishPopup()
      }
      this.recalculateStats()
    },
    recalculateStats() {
      const totalPhotos = this.albums.reduce((sum, album) => sum + album.photos.length, 0)
      this.stats.totalPhotos = totalPhotos
      this.stats.cities = this.albums.length
    },
    onPostFeed(album) {
      if (!album.photos.length) {
        uni.showToast({
          title: `No publishable photos in ${this.displayCityName(album.city)}`,
          icon: 'none'
        })
        return
      }
      this.activePublishAlbumId = album.id
      this.selectedPublishPhotoId = album.photos[0].id
      this.publishText = ''
      this.showPublishPopup = true
    },
    closePublishPopup() {
      this.showPublishPopup = false
      this.activePublishAlbumId = null
      this.selectedPublishPhotoId = null
      this.publishText = ''
    },
    onSelectPublishPhoto(photo) {
      this.selectedPublishPhotoId = photo.id
    },
    onConfirmPublish() {
      const content = this.publishText.trim()
      if (!content) {
        uni.showToast({
          title: 'Please enter post content',
          icon: 'none'
        })
        return
      }
      if (!this.activePublishAlbum) {
        uni.showToast({
          title: 'Album not found',
          icon: 'none'
        })
        return
      }
      const selectedPhoto = this.activePublishAlbum.photos.find((photo) => photo.id === this.selectedPublishPhotoId)
      if (!selectedPhoto) {
        uni.showToast({
          title: 'Please select a photo first',
          icon: 'none'
        })
        return
      }

      addUserPost({
        id: `self-${Date.now()}`,
        authorName: 'Me',
        authorEmoji: '🧑',
        authorAvatarBg: 'linear-gradient(135deg, #51a2ff 0%, #c27aff 100%)',
        city: this.activePublishAlbum.city,
        content,
        imageUrl: selectedPhoto.url,
        reward: 30,
        likes: 0,
        comments: 0,
        createdAt: Date.now(),
        source: 'self'
      })

      const rewardResult = rewardForPost()
      this.closePublishPopup()
      uni.showToast({
        title: `Published +${rewardResult.reward} coins`,
        icon: 'none'
      })
    },
    onAddPhoto(album) {
      uni.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const selectedPaths = res.tempFilePaths || []
          const selectedFiles = res.tempFiles || []
          if (!selectedPaths.length) return

          const now = Date.now()
          const newPhotos = selectedPaths.map((url, index) => ({
            id: now + index,
            url,
            name: (selectedFiles[index] && selectedFiles[index].name) || `Photo ${album.photos.length + index + 1}`
          }))

          addPhotosToCity(album.cityKey, newPhotos)
          this.syncAlbumsAndStats()
          uni.showToast({
            title: `Added ${newPhotos.length} photos`,
            icon: 'none'
          })
        },
        fail: (err) => {
          // User cancel choose image should not be treated as an error.
          const errMsg = (err && err.errMsg) || ''
          if (errMsg.includes('cancel')) return
          uni.showToast({
            title: 'Failed to add photos, try again',
            icon: 'none'
          })
        }
      })
    },
    onPhotoClick(album, photo) {
      uni.previewImage({
        current: photo.url,
        urls: album.photos.map((p) => p.url)
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
  background: #f3f4fa;
}

.content-wrap {
  width: 100%;
  max-width: 720rpx;
  margin: 0 auto;
  padding: 28rpx 16rpx 40rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 16rpx;
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
  color: #1f2937;
  line-height: 64rpx;
}

.stats-row {
  display: flex;
  gap: 24rpx;
}

.stat-card {
  flex: 1;
  height: 192rpx;
  border-radius: 28rpx;
  padding: 24rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.stat-card-blue {
  background: linear-gradient(148deg, #2a7dff 0%, #17b6e9 100%);
}

.stat-card-purple {
  background: linear-gradient(148deg, #8b45ff 0%, #f43f9f 100%);
}

.stat-card-green {
  background: linear-gradient(148deg, #00c350 0%, #0db8a6 100%);
}

.stat-icon {
  width: 40rpx;
  height: 40rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.92);
  line-height: 30rpx;
  white-space: nowrap;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 56rpx;
}

.albums-section {
  flex: 1;
}

.albums-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding: 0;
}

.album-card {
  border-radius: 26rpx;
  overflow: hidden;
  background: #f4f2fd;
  border: 1rpx solid rgba(136, 148, 180, 0.18);
  box-shadow: 0 14rpx 30rpx rgba(17, 24, 39, 0.08);
}

.album-top {
  padding: 24rpx 24rpx 18rpx;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.album-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.album-icon {
  width: 32rpx;
  height: 32rpx;
}

.album-title {
  font-size: 46rpx;
  font-weight: 700;
  color: #1f2937;
  line-height: 56rpx;
}

.album-count {
  font-size: 30rpx;
  color: #6b7280;
  line-height: 38rpx;
}

.album-actions {
  margin-top: 14rpx;
  display: flex;
  gap: 14rpx;
}

.action-btn {
  flex: 1;
  height: 58rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.action-icon {
  width: 24rpx;
  height: 24rpx;
}

.post-btn {
  background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
}

.post-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 34rpx;
}

.add-btn {
  background: #f3f4f6;
  border: 1rpx solid #d1d5db;
}

.add-text {
  font-size: 28rpx;
  color: #111827;
  line-height: 34rpx;
}

.album-content {
  background: #ffffff;
  padding: 24rpx;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-grid.single {
  justify-content: center;
}

.photo-item {
  width: 170rpx;
  height: 170rpx;
  border-radius: 18rpx;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.empty-state {
  min-height: 170rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.empty-icon {
  width: 84rpx;
  height: 84rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 34rpx;
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
  line-height: 30rpx;
}

.tab-item.active .tab-label {
  color: #155dfc;
}

.publish-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  box-sizing: border-box;
}

.publish-dialog {
  width: 100%;
  max-width: 680rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.publish-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2937;
  line-height: 44rpx;
}

.publish-close {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 34rpx;
}

.publish-city {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #4b5563;
  line-height: 34rpx;
}

.publish-label {
  margin-top: 18rpx;
  margin-bottom: 8rpx;
  font-size: 26rpx;
  color: #1f2937;
  line-height: 34rpx;
  font-weight: 600;
}

.publish-photo-scroll {
  width: 100%;
}

.publish-photo-list {
  display: flex;
  gap: 12rpx;
  padding-bottom: 4rpx;
}

.publish-photo-item {
  width: 130rpx;
  height: 130rpx;
  border-radius: 14rpx;
  overflow: hidden;
  border: 2rpx solid transparent;
  flex-shrink: 0;
}

.publish-photo-item.active {
  border-color: #2b7fff;
  box-shadow: 0 0 0 4rpx rgba(43, 127, 255, 0.12);
}

.publish-photo-image {
  width: 100%;
  height: 100%;
}

.publish-textarea {
  width: 100%;
  height: 180rpx;
  border-radius: 14rpx;
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  padding: 14rpx 16rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1f2937;
  line-height: 38rpx;
}

.publish-placeholder {
  color: #9ca3af;
}

.publish-actions {
  margin-top: 20rpx;
  display: flex;
  gap: 12rpx;
}

.publish-btn {
  flex: 1;
  height: 70rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.publish-btn.cancel {
  background: #f3f4f6;
  border: 1rpx solid #d1d5db;
}

.publish-btn.confirm {
  background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
}

.publish-btn-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 36rpx;
  font-weight: 600;
}

.cancel-text {
  color: #374151;
}
</style>
