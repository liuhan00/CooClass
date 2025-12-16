<template>
  <view class="screen login-screen">
    <image class="mascot" src="/static/logo.png" mode="aspectFit"></image>

    <view class="pill login-pill">
      <text class="pill-text">咕咕学时</text>
      <text class="pill-arrow">›</text>
    </view>

    <view class="login-actions">
      <button class="wx-button" type="default" @tap="handleWxLogin">
        微信授权登录
      </button>
      <button class="guest-button" type="default" plain="true" @tap="handleGuestLogin">
        游客登录
      </button>
    </view>

    <view class="login-tip">
      登录后可同步小鸡养成、专注时长等数据
    </view>

    <view class="chick-strip">
      <view class="chick-face" v-for="(face, index) in chickFaces" :key="index">
        <text>{{ face }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      chickFaces: ['🐣', '🐥', '🐔', '🐤', '🐔', '🐥', '🐣'],
    }
  },
  methods: {
    handleWxLogin() {
      uni.showToast({
        title: '已发起微信授权示意',
        icon: 'none',
      })
      this.navigateToHome()
    },
    handleGuestLogin() {
      uni.showToast({
        title: '以游客身份体验',
        icon: 'none',
      })
      this.navigateToHome()
    },
    navigateToHome() {
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        })
      }, 400)
    },
  },
}
</script>

<style>
.screen {
  min-height: 100vh;
  padding: 140rpx 48rpx 120rpx;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mascot {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 48rpx;
}

.pill {
  width: 420rpx;
  padding: 24rpx 36rpx;
  background-color: #f5f5f5;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.login-pill {
  margin-top: 8rpx;
  font-size: 32rpx;
}

.pill-text {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #1a1a1a;
}

.pill-arrow {
  font-size: 32rpx;
  color: #1a1a1a;
}

.login-actions {
  width: 440rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 48rpx;
}

.wx-button {
  width: 100%;
  height: 112rpx;
  line-height: 112rpx;
  border-radius: 80rpx;
  background-color: #000000;
  color: #ffffff;
  font-size: 32rpx;
}

.guest-button {
  width: 100%;
  height: 112rpx;
  line-height: 112rpx;
  border-radius: 80rpx;
  border: 2rpx solid #000000;
  color: #000000;
  font-size: 32rpx;
  background-color: transparent;
}

.login-tip {
  margin-top: 32rpx;
  font-size: 26rpx;
  color: #8b8b8b;
}

.chick-strip {
  width: 100%;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chick-face {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chick-face text {
  font-size: 34rpx;
  color: #ffd45c;
}
</style>
