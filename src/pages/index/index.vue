<template>
  <view class="page">
    <view class="bg-glow bg-glow-a"></view>
    <view class="bg-glow bg-glow-b"></view>

    <view class="auth-card">
      <view class="brand-icon">
        <text class="icon-inner">◎</text>
      </view>
      <text class="title">旅行大富翁</text>
      <text class="subtitle">记录你的足迹，点亮世界地图</text>

      <view class="mode-switch">
        <view class="mode-track" :class="{ right: mode === 'register' }"></view>
        <view class="mode-item" :class="{ active: mode === 'login' }" @click="switchMode('login')">
          登录
        </view>
        <view class="mode-item" :class="{ active: mode === 'register' }" @click="switchMode('register')">
          注册
        </view>
      </view>

      <view class="form-wrap" :class="{ 'is-register': mode === 'register', animated: animating }">
        <view class="input-item" :class="{ focused: focusedField === 'email' }">
          <text class="input-icon">✉</text>
          <input
            class="input"
            type="text"
            v-model.trim="form.email"
            placeholder="your@email.com"
            @focus="focusedField = 'email'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="input-item" :class="{ focused: focusedField === 'password' }">
          <text class="input-icon">🔒</text>
          <input
            class="input"
            :password="!showPassword"
            v-model="form.password"
            placeholder="请输入密码"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''"
          />
          <text class="eye-btn" @click="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁' }}</text>
        </view>

        <view class="input-item extra-field" :class="{ focused: focusedField === 'confirm' }">
          <text class="input-icon">🔐</text>
          <input
            class="input"
            :password="!showConfirm"
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
            @focus="focusedField = 'confirm'"
            @blur="focusedField = ''"
          />
          <text class="eye-btn" @click="showConfirm = !showConfirm">{{ showConfirm ? '🙈' : '👁' }}</text>
        </view>
      </view>

      <button class="submit-btn" :disabled="loading" @click="submit">
        {{ loading ? '处理中...' : mode === 'login' ? '登录' : '注册' }}
      </button>

      <text class="forget-text" @click="onForgot">忘记密码?</text>

      <view class="divider">
        <view class="line"></view>
        <text class="divider-text">或使用第三方登录</text>
        <view class="line"></view>
      </view>

      <view class="social-row">
        <view class="social-btn">
          <text class="social-icon fb">f</text>
          <text>Facebook</text>
        </view>
        <view class="social-btn">
          <text class="social-icon dc">◉</text>
          <text>Discord</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      mode: 'login',
      animating: false,
      loading: false,
      focusedField: '',
      showPassword: false,
      showConfirm: false,
      form: {
        email: '',
        password: '',
        confirmPassword: '',
      },
    }
  },
  methods: {
    switchMode(nextMode) {
      if (this.mode === nextMode) return
      this.mode = nextMode
      this.animating = false
      setTimeout(() => {
        this.animating = true
      }, 10)
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
      }, 900)
    },
    onForgot() {
      uni.showToast({ title: '演示页：可接入找回密码流程', icon: 'none' })
    },
  },
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 56rpx 34rpx;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #5d7cf4 0%, #7f54ed 44%, #bf3ba7 100%);
}

.bg-glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  filter: blur(46rpx);
  opacity: 0.28;
}

.bg-glow-a {
  top: -120rpx;
  right: -100rpx;
  background: #d9dcff;
}

.bg-glow-b {
  bottom: -160rpx;
  left: -120rpx;
  background: #ffd0e9;
}

.auth-card {
  width: 100%;
  max-width: 640rpx;
  background: #f4f3f8;
  border-radius: 28rpx;
  padding: 42rpx 34rpx 34rpx;
  box-shadow: 0 24rpx 60rpx rgba(40, 24, 93, 0.22);
  position: relative;
  z-index: 3;
}

.brand-icon {
  width: 104rpx;
  height: 104rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4d7cf4 0%, #9455eb 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10rpx 24rpx rgba(93, 106, 237, 0.35);
}

.icon-inner {
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
}

.title {
  display: block;
  text-align: center;
  font-size: 62rpx;
  line-height: 1.2;
  color: #1f2537;
  font-weight: 800;
}

.subtitle {
  display: block;
  text-align: center;
  margin-top: 10rpx;
  font-size: 30rpx;
  color: #656b78;
}

.mode-switch {
  position: relative;
  margin-top: 34rpx;
  border-radius: 40rpx;
  background: #dfdee5;
  height: 72rpx;
  padding: 6rpx;
  display: flex;
}

.mode-track {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: calc(50% - 6rpx);
  height: 60rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 12rpx rgba(67, 56, 202, 0.1);
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mode-track.right {
  transform: translateX(100%);
}

.mode-item {
  flex: 1;
  z-index: 2;
  text-align: center;
  line-height: 60rpx;
  color: #5d6573;
  font-size: 30rpx;
  font-weight: 600;
  transition: color 220ms ease;
}

.mode-item.active {
  color: #1f2537;
}

.form-wrap {
  margin-top: 28rpx;
}

.input-item {
  height: 84rpx;
  border-radius: 18rpx;
  background: #ececf1;
  margin-bottom: 18rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  border: 2rpx solid transparent;
  transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
}

.input-item.focused {
  border-color: #8f81f3;
  box-shadow: 0 0 0 6rpx rgba(121, 96, 234, 0.12);
  transform: translateY(-2rpx);
}

.input-icon {
  width: 36rpx;
  text-align: center;
  color: #8e95a5;
  font-size: 30rpx;
}

.input {
  flex: 1;
  height: 100%;
  margin-left: 14rpx;
  font-size: 32rpx;
  color: #2a3140;
}

.eye-btn {
  font-size: 30rpx;
  color: #8e95a5;
  padding: 6rpx;
}

.extra-field {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
  overflow: hidden;
  transform: translateY(-6rpx);
  transition: max-height 300ms ease, opacity 240ms ease, margin-bottom 240ms ease, transform 280ms ease;
}

.is-register .extra-field {
  max-height: 84rpx;
  opacity: 1;
  margin-bottom: 18rpx;
  transform: translateY(0);
}

.animated .input-item {
  animation: slideInUp 320ms ease both;
}

.animated .input-item:nth-child(2) {
  animation-delay: 70ms;
}

.animated .input-item:nth-child(3) {
  animation-delay: 130ms;
}

.submit-btn {
  margin-top: 10rpx;
  width: 100%;
  height: 86rpx;
  border-radius: 18rpx;
  border: none;
  background: linear-gradient(135deg, #4f79f2 0%, #9a4fea 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  transition: transform 200ms ease, opacity 200ms ease;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn[disabled] {
  opacity: 0.86;
}

.forget-text {
  margin-top: 20rpx;
  display: block;
  text-align: center;
  color: #6e7fa9;
  font-size: 30rpx;
}

.divider {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.line {
  flex: 1;
  height: 1px;
  background: #dddce3;
}

.divider-text {
  color: #767d8d;
  font-size: 28rpx;
}

.social-row {
  margin-top: 20rpx;
  display: flex;
  gap: 16rpx;
}

.social-btn {
  flex: 1;
  height: 78rpx;
  border-radius: 14rpx;
  border: 2rpx solid #e1e2e9;
  background: #f7f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: #2b3443;
  font-size: 30rpx;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.social-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 6rpx 14rpx rgba(79, 70, 229, 0.12);
}

.social-icon {
  width: 34rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
}

.social-icon.fb {
  color: #3b5998;
}

.social-icon.dc {
  color: #5bcd74;
}

@keyframes slideInUp {
  from {
    transform: translateY(10rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
