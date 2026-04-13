<template>
  <view class="page">
    <!-- Background decorations -->
    <view class="bg-blur bg-blur-1"></view>
    <view class="bg-blur bg-blur-2"></view>
    <view class="bg-blur bg-blur-3"></view>
    
    <!-- Decorative icons -->
    <image class="deco-icon deco-star-1" :src="assets.star1" mode="aspectFit"></image>
    <image class="deco-icon deco-star-2" :src="assets.star2" mode="aspectFit"></image>
    <image class="deco-icon deco-star-3" :src="assets.star3" mode="aspectFit"></image>
    
    <!-- Bottom gradient overlay -->
    <view class="bottom-overlay"></view>

    <!-- Main Card -->
    <view class="auth-card">
      <!-- Header -->
      <view class="header">
        <view class="brand-icon">
          <image class="brand-icon-img" :src="assets.location" mode="aspectFit"></image>
        </view>
        <text class="title">旅行大富翁</text>
        <text class="subtitle">记录你的足迹，点亮世界地图</text>
      </view>

      <!-- Tab Switch -->
      <view class="tab-list">
        <view 
          class="tab" 
          :class="{ active: mode === 'login' }" 
          @click="switchMode('login')"
        >
          <text class="tab-text">登录</text>
        </view>
        <view 
          class="tab" 
          :class="{ active: mode === 'register' }" 
          @click="switchMode('register')"
        >
          <text class="tab-text">注册</text>
        </view>
      </view>

      <!-- Form -->
      <view class="form">
        <!-- Email Field -->
        <view class="field">
          <text class="label">邮箱</text>
          <view class="input-wrap" :class="{ focused: focusedField === 'email' }">
            <image class="input-icon" :src="assets.email" mode="aspectFit"></image>
            <input
              class="input"
              type="text"
              v-model="form.email"
              placeholder="your@email.com"
              placeholder-class="placeholder"
              @focus="focusedField = 'email'"
              @blur="focusedField = ''"
            />
          </view>
        </view>

        <!-- Password Field -->
        <view class="field">
          <text class="label">密码</text>
          <view class="input-wrap" :class="{ focused: focusedField === 'password' }">
            <image class="input-icon" :src="assets.lock" mode="aspectFit"></image>
            <input
              class="input"
              :password="!showPassword"
              v-model="form.password"
              placeholder="••••••••"
              placeholder-class="placeholder"
              @focus="focusedField = 'password'"
              @blur="focusedField = ''"
            />
            <text class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁' }}
            </text>
          </view>
        </view>

        <!-- Confirm Password Field (Register only) -->
        <view class="field confirm-field" :class="{ show: mode === 'register' }">
          <text class="label">确认密码</text>
          <view class="input-wrap" :class="{ focused: focusedField === 'confirm' }">
            <image class="input-icon" :src="assets.lock" mode="aspectFit"></image>
            <input
              class="input"
              :password="!showConfirm"
              v-model="form.confirmPassword"
              placeholder="••••••••"
              placeholder-class="placeholder"
              @focus="focusedField = 'confirm'"
              @blur="focusedField = ''"
            />
            <text class="eye-btn" @click="showConfirm = !showConfirm">
              {{ showConfirm ? '🙈' : '👁' }}
            </text>
          </view>
        </view>

        <!-- Submit Button -->
        <button class="submit-btn" :disabled="loading" @click="submit">
          <text class="submit-text">
            {{ loading ? '处理中...' : mode === 'login' ? '登录' : '注册' }}
          </text>
        </button>

        <!-- Forgot Password -->
        <text class="forgot-link" @click="onForgot">忘记密码？</text>
      </view>

      <!-- Divider -->
      <view class="divider">
        <view class="divider-line"></view>
        <view class="divider-text-wrap">
          <text class="divider-text">或使用第三方登录</text>
        </view>
        <view class="divider-line"></view>
      </view>

      <!-- Social Login -->
      <view class="social-row">
        <view class="social-btn" @click="onSocialLogin('facebook')">
          <image class="social-icon" :src="assets.facebook" mode="aspectFit"></image>
          <text class="social-text">Facebook</text>
        </view>
        <view class="social-btn" @click="onSocialLogin('discord')">
          <image class="social-icon" :src="assets.discord" mode="aspectFit"></image>
          <text class="social-text">Discord</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import designSystem from '@/design-system.json'

export default {
  data() {
    return {
      mode: 'login',
      loading: false,
      focusedField: '',
      showPassword: false,
      showConfirm: false,
      form: {
        email: '',
        password: '',
        confirmPassword: '',
      },
      assets: designSystem.assets.icons,
    }
  },
  onLoad() {
    this.assets = {
      ...designSystem.assets.icons,
      ...designSystem.assets.decorations,
    }
  },
  methods: {
    switchMode(nextMode) {
      if (this.mode === nextMode) return
      this.mode = nextMode
      if (nextMode === 'login') {
        this.form.confirmPassword = ''
      }
    },
    isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    submit() {
      const { email, password, confirmPassword } = this.form
      
      if (!this.isValidEmail(email)) {
        uni.showToast({ title: '请输入正确邮箱', icon: 'none' })
        return
      }
      if (!password || password.length < 6) {
        uni.showToast({ title: '密码至少 6 位', icon: 'none' })
        return
      }
      if (this.mode === 'register' && password !== confirmPassword) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }

      this.loading = true
      setTimeout(() => {
        this.loading = false
        uni.showToast({
          title: this.mode === 'login' ? '登录成功' : '注册成功',
          icon: 'success',
        })
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/map/map' })
        }, 500)
      }, 900)
    },
    onForgot() {
      uni.showToast({ title: '可接入找回密码流程', icon: 'none' })
    },
    onSocialLogin(platform) {
      uni.showToast({ title: `${platform} 登录演示`, icon: 'none' })
    },
  },
}
</script>

<style>
.page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  background: linear-gradient(115deg, #51a2ff 0%, #ad46ff 50%, #f6339a 100%);
}

/* Background blur decorations */
.bg-blur {
  position: absolute;
  border-radius: 50%;
  filter: blur(48rpx);
}

.bg-blur-1 {
  width: 256rpx;
  height: 160rpx;
  left: 80rpx;
  top: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0.86;
}

.bg-blur-2 {
  width: 320rpx;
  height: 192rpx;
  left: 306rpx;
  top: 320rpx;
  background: rgba(255, 255, 255, 0.15);
}

.bg-blur-3 {
  width: 288rpx;
  height: 176rpx;
  left: 196rpx;
  bottom: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.87;
}

/* Decorative icons */
.deco-icon {
  position: absolute;
  pointer-events: none;
}

.deco-star-1 {
  width: 64rpx;
  height: 64rpx;
  right: 100rpx;
  top: 280rpx;
}

.deco-star-2 {
  width: 80rpx;
  height: 80rpx;
  left: 200rpx;
  top: 720rpx;
  transform: rotate(150deg);
}

.deco-star-3 {
  width: 48rpx;
  height: 48rpx;
  right: 120rpx;
  top: 560rpx;
}

/* Bottom overlay */
.bottom-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 192rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
}

/* Auth Card */
.auth-card {
  width: 100%;
  max-width: 720rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28rpx;
  padding: 64rpx;
  box-shadow: 0 50rpx 100rpx rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10;
}

/* Header */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.brand-icon {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: linear-gradient(90deg, #2b7fff 0%, #ad46ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32rpx;
}

.brand-icon-img {
  width: 64rpx;
  height: 64rpx;
}

.title {
  font-size: 60rpx;
  font-weight: 700;
  color: #1e2939;
  line-height: 72rpx;
  text-align: center;
}

.subtitle {
  font-size: 32rpx;
  color: #4a5565;
  line-height: 48rpx;
  margin-top: 16rpx;
  text-align: center;
}

/* Tab List */
.tab-list {
  display: flex;
  background: #ececf0;
  border-radius: 28rpx;
  padding: 6rpx;
  margin-bottom: 48rpx;
}

.tab {
  flex: 1;
  height: 58rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 28rpx;
  transition: all 220ms ease;
}

.tab.active {
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #0a0a0a;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.confirm-field {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  transition: all 300ms ease;
}

.confirm-field.show {
  max-height: 200rpx;
  opacity: 1;
}

.label {
  font-size: 28rpx;
  font-weight: 500;
  color: #0a0a0a;
  line-height: 28rpx;
}

.input-wrap {
  height: 72rpx;
  background: #f3f3f5;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  border: 2rpx solid transparent;
  transition: all 220ms ease;
}

.input-wrap.focused {
  border-color: #2b7fff;
  box-shadow: 0 0 0 6rpx rgba(43, 127, 255, 0.12);
}

.input-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
  color: #0a0a0a;
  background: transparent;
}

.placeholder {
  color: #717182;
}

.eye-btn {
  font-size: 32rpx;
  padding: 8rpx;
  margin-left: 8rpx;
}

/* Submit Button */
.submit-btn {
  height: 88rpx;
  background: linear-gradient(90deg, #2b7fff 0%, #ad46ff 100%);
  border-radius: 16rpx;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16rpx;
  transition: all 200ms ease;
}

.submit-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.submit-btn[disabled] {
  opacity: 0.7;
}

.submit-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
}

/* Forgot Link */
.forgot-link {
  font-size: 28rpx;
  color: #2b7fff;
  text-align: center;
  line-height: 40rpx;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 32rpx 0;
  position: relative;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: #e5e7eb;
}

.divider-text-wrap {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 16rpx;
}

.divider-text {
  font-size: 28rpx;
  color: #6a7282;
  white-space: nowrap;
}

/* Social Login */
.social-row {
  display: flex;
  gap: 24rpx;
}

.social-btn {
  flex: 1;
  height: 72rpx;
  background: #ffffff;
  border: 2rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  transition: all 200ms ease;
}

.social-btn:active {
  background: #f8f8f8;
  transform: scale(0.98);
}

.social-icon {
  width: 32rpx;
  height: 32rpx;
}

.social-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #0a0a0a;
}
</style>
