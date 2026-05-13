<template>
  <view class="page">
    <scroll-view class="content-section" scroll-y>
      <view class="content-wrap">
        <view class="header">
          <view class="title-row">
            <image class="title-icon" :src="assets.feedIcon" mode="aspectFit"></image>
            <text class="title-text">Following Feed</text>
          </view>
          <view class="subtitle-row">
            <text class="subtitle-text">Following </text>
            <text class="subtitle-count">{{ followingCount }}</text>
            <text class="subtitle-text"> travelers</text>
          </view>
          <view class="search-wrap">
            <view class="search-bar">
              <image class="search-icon" :src="assets.searchIcon" mode="aspectFit"></image>
              <input
                class="search-input"
                v-model="searchText"
                placeholder="Search users..."
                placeholder-class="search-placeholder"
                confirm-type="search"
                @confirm="onSearch"
              />
            </view>
            <view v-if="showSearchDropdown" class="search-dropdown">
              <view v-if="searchMatchedUsers.length" class="search-result-list">
                <view v-for="user in searchMatchedUsers" :key="`search-${user.id}`" class="search-result-item">
                  <view class="search-result-info">
                    <view class="search-result-avatar" :style="{ background: user.avatarBg }">
                      <text class="avatar-emoji">{{ user.emoji }}</text>
                    </view>
                    <view class="search-result-meta">
                      <text class="search-result-name">{{ displayUserName(user.name) }}</text>
                      <text class="search-result-bio">{{ user.bio }}</text>
                    </view>
                  </view>
                  <view class="follow-btn search-follow-btn" :class="{ followed: user.isFollowed }" @click="onFollowClick(user)">
                    <image class="follow-icon" :src="assets.addUserIcon" mode="aspectFit"></image>
                    <text class="follow-text">{{ user.isFollowed ? 'Following' : 'Follow' }}</text>
                  </view>
                </view>
              </view>
              <view v-else class="search-empty">
                <text class="search-empty-text">No registered users found</text>
              </view>
            </view>
          </view>
        </view>

        <view class="recommend-card">
          <view class="card-header">
            <image class="card-icon" :src="assets.recommendIcon" mode="aspectFit"></image>
            <text class="card-title">Recommended</text>
          </view>

          <view class="user-list">
            <view v-for="user in recommendedUsers" :key="user.id" class="user-item">
              <view class="user-info">
                <view class="user-avatar" :style="{ background: user.avatarBg }">
                  <text class="avatar-emoji">{{ user.emoji }}</text>
                </view>
                <view class="user-details">
                  <text class="user-name">{{ displayUserName(user.name) }}</text>
                  <text class="user-bio">{{ user.bio }}</text>
                </view>
              </view>
              <view class="follow-btn" :class="{ followed: user.isFollowed }" @click="onFollowClick(user)">
                <image class="follow-icon" :src="assets.addUserIcon" mode="aspectFit"></image>
                <text class="follow-text">{{ user.isFollowed ? 'Following' : 'Follow' }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-for="post in visibleFeedPosts" :key="post.id" class="post-card">
          <view class="post-header">
            <view class="post-user">
              <view class="post-avatar" :style="{ background: post.authorAvatarBg }">
                <text class="avatar-emoji">{{ post.authorEmoji }}</text>
              </view>
              <view class="post-user-info">
                <text class="post-name">{{ displayUserName(post.authorName) }}</text>
                <view class="post-meta">
                  <image class="meta-icon" :src="assets.locationIcon" mode="aspectFit"></image>
                  <text class="meta-text">{{ displayCityName(post.city) }}</text>
                  <text class="meta-dot">·</text>
                  <text class="meta-text">{{ formatPostDate(post.createdAt) }}</text>
                </view>
              </view>
            </view>
            <view class="coin-badge">
              <image class="coin-icon" :src="assets.coinIcon" mode="aspectFit"></image>
              <text class="coin-text">+30</text>
            </view>
          </view>

          <text class="post-content">{{ post.content }}</text>
          <image v-if="post.imageUrl" class="post-image" :src="post.imageUrl" mode="aspectFill"></image>

          <view class="post-actions">
            <view class="left-actions">
              <view class="action-item">
                <image class="action-icon" :src="assets.likeIcon" mode="aspectFit"></image>
                <text class="action-count">{{ post.likes }}</text>
              </view>
              <view class="action-item">
                <image class="action-icon" :src="assets.commentIcon" mode="aspectFit"></image>
                <text class="action-count">{{ post.comments }}</text>
              </view>
            </view>
            <text class="detail-link">View details →</text>
          </view>
        </view>

        <view class="follow-card">
          <view class="card-header">
            <image class="card-icon" :src="assets.myFollowIcon" mode="aspectFit"></image>
            <text class="card-title">Following ({{ followingCount }})</text>
          </view>
          <view v-if="followingUsers.length" class="following-list">
            <view v-for="user in followingUsers" :key="user.id" class="following-tag">
              <view class="tag-avatar">
                <text class="avatar-emoji">{{ user.emoji }}</text>
              </view>
              <text class="tag-name">{{ displayUserName(user.name) }}</text>
            </view>
          </view>
          <view v-else class="following-empty">
            <text class="following-empty-text">No follows yet, tap “Follow” above</text>
          </view>
        </view>
      </view>
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
        ></image>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { formatFeedDate, getAllFeedPosts } from '../../utils/feed-posts'
import { getCityProgress } from '../../utils/city-progress'
import { getAccountScopedKey } from '../../utils/account-session'

const FOLLOWED_USERS_STORAGE_KEY = 'travel-followed-users-v1'
const USER_NAME_MAP = {
  北京老张: 'Lao Zhang (Beijing)',
  魔都小李: 'Xiao Li (Shanghai)',
  游客小王: 'Xiao Wang (Traveler)',
  我: 'Me'
}
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
      currentTab: 'feed',
      searchText: '',
      feedPosts: [],
      assets: {
        feedIcon: 'https://www.figma.com/api/mcp/asset/f16b6af4-14ba-40a7-b3e7-36e6b9b3ca63',
        searchIcon: 'https://www.figma.com/api/mcp/asset/45867933-3b25-41c6-bda2-9e2a2de32d40',
        recommendIcon: 'https://www.figma.com/api/mcp/asset/efc21452-c28e-436f-bd98-63c1f54b72e8',
        addUserIcon: 'https://www.figma.com/api/mcp/asset/135f4638-a3c5-45a3-b317-1eee08909c2d',
        locationIcon: 'https://www.figma.com/api/mcp/asset/f09b051e-c058-4d34-95b1-d0b08a137b86',
        coinIcon: 'https://www.figma.com/api/mcp/asset/59874c00-3a5e-4dc7-9a78-8887d7f4fb71',
        likeIcon: 'https://www.figma.com/api/mcp/asset/f3ec4770-17aa-4db6-915e-b6727f12e0cd',
        commentIcon: 'https://www.figma.com/api/mcp/asset/3723f11a-cbff-4bdb-b5f6-417013138ef6',
        myFollowIcon: 'https://www.figma.com/api/mcp/asset/9e14f0b1-3f45-4668-b420-a206be19fcf0'
      },
      tabs: [
        { id: 'map', label: 'Map', icon: 'https://www.figma.com/api/mcp/asset/b6776cbe-770c-4921-871a-9fc88025e932', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: 'Photos', icon: 'https://www.figma.com/api/mcp/asset/d663b127-26cb-4190-a71c-54168849ec98', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: 'Feed', icon: 'https://www.figma.com/api/mcp/asset/73f0bb2c-6f9a-4de8-bc03-48fdcf00937e', activeIcon: 'https://www.figma.com/api/mcp/asset/6eee770c-e5a4-487f-8619-9af2c97c34da' },
        { id: 'property', label: 'Property', icon: 'https://www.figma.com/api/mcp/asset/a8e6a9b4-d139-42a3-8a43-9896a6ec8d01', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: 'Me', icon: 'https://www.figma.com/api/mcp/asset/08f7f439-9c4e-48ce-b5e3-3f9e21583ad6', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' }
      ],
      recommendedUsers: [
        {
          id: 1,
          name: '北京老张',
          bio: 'Beijing local who loves travel',
          emoji: '🧑',
          avatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
          isFollowed: false
        },
        {
          id: 2,
          name: '魔都小李',
          bio: 'Shanghai food explorer',
          emoji: '👨',
          avatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
          isFollowed: false
        },
        {
          id: 3,
          name: '游客小王',
          bio: 'Backpacker traveling across China',
          emoji: '🙋',
          avatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
          isFollowed: false
        }
      ]
    }
  },
  onShow() {
    this.syncFollowState()
    this.loadFeedPosts()
  },
  computed: {
    followingCount() {
      return this.recommendedUsers.filter((u) => u.isFollowed).length
    },
    searchMatchedUsers() {
      const keyword = this.searchText.trim()
      if (!keyword) return []
      const normalizedKeyword = keyword.toLowerCase()
      return this.recommendedUsers.filter((u) => {
        const displayName = this.displayUserName(u.name).toLowerCase()
        return (
          u.name.includes(keyword) ||
          displayName.includes(normalizedKeyword) ||
          u.bio.toLowerCase().includes(normalizedKeyword)
        )
      })
    },
    showSearchDropdown() {
      return this.searchText.trim().length > 0
    },
    followingUsers() {
      return this.recommendedUsers.filter((u) => u.isFollowed)
    },
    visibleFeedPosts() {
      const followedAuthorNames = new Set(this.followingUsers.map((user) => user.name))
      const { litCities } = getCityProgress()
      const litCitySet = new Set(litCities.map((city) => normalizeCityName(city)))
      return this.feedPosts.filter((post) => {
        if (post.source === 'self') return true
        if (followedAuthorNames.has(post.authorName)) return true
        return litCitySet.has(normalizeCityName(post.city))
      })
    }
  },
  methods: {
    displayUserName(name) {
      return USER_NAME_MAP[name] || name
    },
    displayCityName(name) {
      return CITY_NAME_MAP[name] || name
    },
    syncFollowState() {
      const scopedKey = getAccountScopedKey(FOLLOWED_USERS_STORAGE_KEY)
      const raw = uni.getStorageSync(scopedKey)
      let followedIds = []
      if (Array.isArray(raw)) {
        followedIds = raw
      } else if (raw) {
        try {
          const parsed = JSON.parse(raw)
          followedIds = Array.isArray(parsed) ? parsed : []
        } catch (error) {
          followedIds = []
        }
      }
      const followedSet = new Set(followedIds.map((id) => Number(id)))
      this.recommendedUsers = this.recommendedUsers.map((user) => ({
        ...user,
        isFollowed: followedSet.has(Number(user.id))
      }))
    },
    saveFollowState() {
      const scopedKey = getAccountScopedKey(FOLLOWED_USERS_STORAGE_KEY)
      const followedIds = this.recommendedUsers.filter((u) => u.isFollowed).map((u) => u.id)
      uni.setStorageSync(scopedKey, JSON.stringify(followedIds))
    },
    loadFeedPosts() {
      this.feedPosts = getAllFeedPosts()
    },
    formatPostDate(timestamp) {
      return formatFeedDate(timestamp)
    },
    onSearch() {
      if (!this.searchMatchedUsers.length) {
        uni.showToast({
          title: 'No matching users found',
          icon: 'none'
        })
      }
    },
    onFollowClick(user) {
      user.isFollowed = !user.isFollowed
      this.saveFollowState()
      uni.showToast({ 
        title: user.isFollowed
          ? `Following ${this.displayUserName(user.name)}`
          : `Unfollowed ${this.displayUserName(user.name)}`, 
        icon: 'none' 
      })
    },
    onTabClick(tab) {
      if (this.currentTab === tab.id) return
      
      if (tab.id === 'map') {
        uni.redirectTo({ url: '/pages/map/map' })
      } else if (tab.id === 'photo') {
        uni.redirectTo({ url: '/pages/photo/photo' })
      } else if (tab.id === 'property') {
        uni.redirectTo({ url: '/pages/property/property' })
      } else if (tab.id === 'profile') {
        uni.redirectTo({ url: '/pages/profile/profile' })
      } else if (tab.id === 'feed') {
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
  background: linear-gradient(116deg, #eff6ff 0%, #faf5ff 100%);
}

.content-section {
  flex: 1;
}

.content-wrap {
  width: 100%;
  max-width: 720rpx;
  margin: 0 auto;
  padding: 30rpx 16rpx 40rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-icon {
  width: 40rpx;
  height: 40rpx;
}

.title-text {
  font-size: 56rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 64rpx;
}

.subtitle-row {
  display: flex;
  align-items: center;
}

.subtitle-text {
  font-size: 30rpx;
  color: #4a5565;
  line-height: 42rpx;
}

.subtitle-count {
  font-size: 30rpx;
  font-weight: 700;
  color: #155dfc;
  line-height: 42rpx;
}

.search-bar {
  height: 72rpx;
  border-radius: 16rpx;
  background: #f3f3f5;
  display: flex;
  align-items: center;
  padding: 0 18rpx;
  margin-top: 8rpx;
}

.search-wrap {
  margin-top: 8rpx;
  position: relative;
}

.search-wrap .search-bar {
  margin-top: 0;
}

.search-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
  color: #364153;
}

.search-placeholder {
  color: #717182;
}

.search-dropdown {
  margin-top: 8rpx;
  background: #ffffff;
  border-radius: 18rpx;
  border: 1rpx solid #dbeafe;
  box-shadow: 0 12rpx 24rpx rgba(15, 23, 42, 0.1);
  overflow: hidden;
  transform-origin: top center;
  animation: dropdown-curtain 180ms ease-out;
}

.search-result-list {
  display: flex;
  flex-direction: column;
}

.search-result-item {
  min-height: 88rpx;
  padding: 14rpx 16rpx;
  border-bottom: 1rpx solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.search-result-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-result-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.search-result-name {
  font-size: 28rpx;
  line-height: 36rpx;
  color: #1e2939;
  font-weight: 600;
}

.search-result-bio {
  font-size: 22rpx;
  line-height: 30rpx;
  color: #6a7282;
}

.search-follow-btn {
  min-width: 120rpx;
  height: 52rpx;
  border-radius: 14rpx;
}

.search-empty {
  padding: 24rpx 16rpx;
  display: flex;
  justify-content: center;
}

.search-empty-text {
  font-size: 24rpx;
  line-height: 32rpx;
  color: #6a7282;
}

@keyframes dropdown-curtain {
  from {
    opacity: 0;
    transform: scaleY(0.1);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.recommend-card {
  background: #ffffff;
  border: 2rpx solid #dbeafe;
  border-radius: 28rpx;
  padding: 28rpx 26rpx;
  margin-bottom: 24rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.card-icon {
  width: 34rpx;
  height: 34rpx;
}

.card-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 50rpx;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 38rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 3rpx;
}

.user-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 38rpx;
}

.user-bio {
  font-size: 24rpx;
  color: #6a7282;
  line-height: 32rpx;
}

.follow-btn {
  height: 56rpx;
  min-width: 130rpx;
  padding: 0 14rpx;
  background: #2b7fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.follow-btn.followed {
  background: #e5e7eb;
}

.follow-icon {
  width: 24rpx;
  height: 24rpx;
}

.follow-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 30rpx;
}

.follow-btn.followed .follow-text {
  color: #6a7282;
}

.post-card {
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  padding: 24rpx 26rpx 18rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  box-shadow: 0 20rpx 28rpx rgba(17, 24, 39, 0.1);
  margin-bottom: 24rpx;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.post-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #51a2ff 0%, #c27aff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-user-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.post-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 38rpx;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon {
  width: 20rpx;
  height: 20rpx;
}

.meta-text,
.meta-dot {
  font-size: 24rpx;
  color: #6a7282;
  line-height: 30rpx;
}

.coin-badge {
  min-width: 96rpx;
  height: 36rpx;
  padding: 0 12rpx;
  border-radius: 16rpx;
  background: #fdc700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.coin-icon {
  width: 18rpx;
  height: 18rpx;
}

.coin-text {
  font-size: 24rpx;
  color: #ffffff;
  line-height: 30rpx;
  font-weight: 600;
}

.post-content {
  font-size: 34rpx;
  line-height: 50rpx;
  color: #364153;
}

.post-image {
  width: 100%;
  height: 300rpx;
  border-radius: 16rpx;
}

.post-actions {
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
  padding-top: 14rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 26rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.action-icon {
  width: 30rpx;
  height: 30rpx;
}

.action-count {
  font-size: 30rpx;
  color: #4a5565;
  line-height: 36rpx;
}

.detail-link {
  font-size: 24rpx;
  color: #2b7fff;
  line-height: 30rpx;
}

.follow-card {
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  padding: 26rpx;
  margin-bottom: 16rpx;
}

.following-tag {
  width: calc((100% - 12rpx) / 2);
  height: 88rpx;
  border-radius: 20rpx;
  padding: 0 20rpx 0 14rpx;
  background: #f9fafb;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-sizing: border-box;
}

.tag-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #c27aff 0%, #fb64b6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-name {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 36rpx;
  color: #1e2939;
}

.following-list {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.following-empty {
  margin-top: 16rpx;
  height: 88rpx;
  border-radius: 20rpx;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.following-empty-text {
  font-size: 26rpx;
  color: #6a7282;
  line-height: 32rpx;
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
