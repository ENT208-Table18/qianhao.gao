<template>
  <view class="page">
    <!-- Header Section -->
    <view class="header">
      <!-- Title -->
      <view class="title-row">
        <image class="title-icon" :src="assets.feedIcon" mode="aspectFit"></image>
        <text class="title-text">关注动态</text>
      </view>
      <!-- Subtitle -->
      <view class="subtitle-row">
        <text class="subtitle-text">关注了 </text>
        <text class="subtitle-count">{{ followingCount }}</text>
        <text class="subtitle-text"> 位旅行者</text>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view class="content-section" scroll-y>
      <!-- Recommended Users Card -->
      <view class="recommend-card">
        <view class="card-header">
          <image class="card-icon" :src="assets.recommendIcon" mode="aspectFit"></image>
          <text class="card-title">推荐关注</text>
        </view>
        
        <view class="user-list">
          <view 
            v-for="user in recommendedUsers" 
            :key="user.id" 
            class="user-item"
          >
            <view class="user-info">
              <view class="user-avatar" :style="{ background: user.avatarBg }">
                <text class="avatar-emoji">{{ user.emoji }}</text>
              </view>
              <view class="user-details">
                <text class="user-name">{{ user.name }}</text>
                <text class="user-bio">{{ user.bio }}</text>
              </view>
            </view>
            <view 
              class="follow-btn" 
              :class="{ followed: user.isFollowed }"
              @click="onFollowClick(user)"
            >
              <image class="follow-icon" :src="assets.addUserIcon" mode="aspectFit"></image>
              <text class="follow-text">{{ user.isFollowed ? '已关注' : '关注' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty Feed State -->
      <view class="empty-card">
        <image class="empty-icon" :src="assets.emptyFeedIcon" mode="aspectFit"></image>
        <text class="empty-title">还没有关注的用户动态</text>
        <text class="empty-subtitle">去发现更多有趣的旅行者吧！</text>
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
      currentTab: 'feed',
      followingCount: 0,
      assets: {
        feedIcon: 'https://www.figma.com/api/mcp/asset/d1ffc6fe-ed23-43f3-9055-5d86bed18bb4',
        recommendIcon: 'https://www.figma.com/api/mcp/asset/5a7e696e-5f3c-4bae-a08c-12deb45b0b64',
        addUserIcon: 'https://www.figma.com/api/mcp/asset/e4683a8f-af91-4f73-8299-0424ac108159',
        emptyFeedIcon: 'https://www.figma.com/api/mcp/asset/f190ca43-9406-4578-a076-6795e79ec62e'
      },
      tabs: [
        { id: 'map', label: '地图', icon: 'https://www.figma.com/api/mcp/asset/c0ba9051-9003-4ebb-9a24-95b116947621', activeIcon: 'https://www.figma.com/api/mcp/asset/eab82d14-92c7-4689-a0c8-204923ce01c6' },
        { id: 'photo', label: '图片', icon: 'https://www.figma.com/api/mcp/asset/3a354cd4-6dd2-42fa-822d-4581ac046f49', activeIcon: 'https://www.figma.com/api/mcp/asset/8c5cd331-777d-4779-8ff4-d547aabee299' },
        { id: 'feed', label: '动态', icon: 'https://www.figma.com/api/mcp/asset/b237b892-2ed2-438c-a246-6e41b0f6ccf3', activeIcon: 'https://www.figma.com/api/mcp/asset/6eee770c-e5a4-487f-8619-9af2c97c34da' },
        { id: 'property', label: '房产', icon: 'https://www.figma.com/api/mcp/asset/762a9952-4cb4-4eca-bdef-3f6f3c4148d1', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c6c59a-6a48-44ba-89d1-47bbbc683fd1' },
        { id: 'profile', label: '我的', icon: 'https://www.figma.com/api/mcp/asset/ac011946-f219-4ff5-8d4b-dccc091f722e', activeIcon: 'https://www.figma.com/api/mcp/asset/e9c495b7-dbca-4127-88b0-704dfc5fb5ca' }
      ],
      recommendedUsers: [
        {
          id: 1,
          name: '北京老张',
          bio: '热爱旅行的北京土著',
          emoji: '🧑',
          avatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
          isFollowed: false
        },
        {
          id: 2,
          name: '魔都小李',
          bio: '上海美食探索者',
          emoji: '👨',
          avatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
          isFollowed: false
        },
        {
          id: 3,
          name: '江南才子',
          bio: '喜欢江南水乡的文艺青年',
          emoji: '👩',
          avatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
          isFollowed: false
        }
      ]
    }
  },
  computed: {
    followingCount() {
      return this.recommendedUsers.filter(u => u.isFollowed).length
    }
  },
  methods: {
    onFollowClick(user) {
      user.isFollowed = !user.isFollowed
      uni.showToast({ 
        title: user.isFollowed ? `已关注 ${user.name}` : `已取消关注 ${user.name}`, 
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
  gap: 16rpx;
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

.subtitle-row {
  display: flex;
  align-items: center;
}

.subtitle-text {
  font-size: 28rpx;
  color: #4a5565;
  line-height: 40rpx;
}

.subtitle-count {
  font-size: 28rpx;
  font-weight: 700;
  color: #155dfc;
  line-height: 40rpx;
}

/* Content Section */
.content-section {
  flex: 1;
  padding: 0 32rpx;
}

/* Recommend Card */
.recommend-card {
  background: #ffffff;
  border: 3rpx solid #dbeafe;
  border-radius: 28rpx;
  padding: 36rpx;
  margin-bottom: 48rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 48rpx;
}

.card-icon {
  width: 40rpx;
  height: 40rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 54rpx;
}

/* User List */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
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
  font-size: 40rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e2939;
  line-height: 40rpx;
}

.user-bio {
  font-size: 24rpx;
  color: #6a7282;
  line-height: 32rpx;
}

/* Follow Button */
.follow-btn {
  height: 64rpx;
  padding: 0 20rpx;
  background: #2b7fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 200ms ease;
}

.follow-btn:active {
  transform: scale(0.98);
}

.follow-btn.followed {
  background: #e5e7eb;
}

.follow-icon {
  width: 32rpx;
  height: 32rpx;
}

.follow-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 32rpx;
}

.follow-btn.followed .follow-text {
  color: #6a7282;
}

/* Empty Card */
.empty-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 28rpx;
  padding: 64rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.empty-icon {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  color: #6a7282;
  line-height: 48rpx;
  text-align: center;
}

.empty-subtitle {
  font-size: 28rpx;
  color: #99a1af;
  line-height: 40rpx;
  text-align: center;
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
