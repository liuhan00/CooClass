<template>
  <view class="container">
    <!-- 死亡小鸡展示 -->
    <view class="dead-chicken-area">
      <view class="dead-chicken">
        <view class="mini-chick mini-chick--dead">
          <view class="mini-chick-face">
            <view class="mini-chick-eye mini-chick-eye--left"></view>
            <view class="mini-chick-eye mini-chick-eye--right"></view>
            <view class="mini-chick-beak"></view>
            <view class="mini-chick-mouth"></view>
            <view class="mini-chick-tear mini-chick-tear--left"></view>
            <view class="mini-chick-tear mini-chick-tear--right"></view>
            <view class="mini-chick-x mini-chick-x--left"></view>
            <view class="mini-chick-x mini-chick-x--right"></view>
          </view>
        </view>
      </view>
      
      <!-- 死亡提示文字 -->
      <view class="death-message">
        <text class="message-text">完蛋！你的</text>
        <text class="chicken-emoji">🐥</text>
        <text class="message-text">死了</text>
      </view>
    </view>
    
    <!-- 操作按钮区域 -->
    <view class="actions-area">
      <!-- 返回首页按钮 -->
      <button class="action-btn btn-home" @tap="goToHome">
        <text class="btn-text">返回首页</text>
      </button>
      
      <!-- 重新开始按钮 -->
      <button class="action-btn btn-restart" @tap="restartTimer">
        <text class="btn-text">重新开始</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 可以添加需要的数据
    }
  },
  
  methods: {
    // 返回首页
    goToHome() {
      // 返回到首页
      uni.navigateBack();
    },
    
    // 重新开始计时
    restartTimer() {
      // 返回到专注计时页面并重新开始
      uni.navigateTo({
        url: '/pages/focused-timer/index'
      });
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5; /* 与其他页面一致的背景色 */
  padding: 40rpx;
  box-sizing: border-box;
}

/* 死亡小鸡区域 */
.dead-chicken-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dead-chicken {
  width: 100%;
  height: 300rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60rpx;
}

/* 死亡小鸡样式 */
.mini-chick--dead {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #cccccc;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 20rpx rgba(0, 0, 0, 0.2);
  opacity: 0.7;
}

.mini-chick--dead .mini-chick-face {
  width: 100%;
  height: 100%;
  position: relative;
}

.mini-chick--dead .mini-chick-eye {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #000000;
  top: 30rpx;
}

.mini-chick--dead .mini-chick-eye::after {
  content: '';
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ffffff;
  top: 5rpx;
  left: 5rpx;
}

.mini-chick--dead .mini-chick-eye--left {
  left: 25rpx;
}

.mini-chick--dead .mini-chick-eye--right {
  right: 25rpx;
}

.mini-chick--dead .mini-chick-beak {
  position: absolute;
  width: 24rpx;
  height: 16rpx;
  background: #999999;
  border-radius: 50% 50% 60% 60%;
  bottom: 35rpx;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: inset 0 -1rpx 0 rgba(0, 0, 0, 0.15);
}

.mini-chick--dead .mini-chick-mouth {
  position: absolute;
  width: 36rpx;
  height: 16rpx;
  border-radius: 0 0 999rpx 999rpx;
  background: #666666;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
}

/* 眼泪 */
.mini-chick-tear {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  background: #4fc3f7;
  border-radius: 50%;
  top: 50rpx;
  animation: tear-fall 2s infinite;
}

.mini-chick-tear--left {
  left: 20rpx;
  animation-delay: 0s;
}

.mini-chick-tear--right {
  right: 20rpx;
  animation-delay: 1s;
}

@keyframes tear-fall {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(40rpx);
    opacity: 0;
  }
}

/* X标记 */
.mini-chick-x {
  position: absolute;
  width: 20rpx;
  height: 4rpx;
  background: #ff0000;
  top: 38rpx;
}

.mini-chick-x--left {
  left: 25rpx;
  transform: rotate(45deg);
}

.mini-chick-x--left::after {
  content: '';
  position: absolute;
  width: 20rpx;
  height: 4rpx;
  background: #ff0000;
  transform: rotate(90deg);
}

.mini-chick-x--right {
  right: 25rpx;
  transform: rotate(-45deg);
}

.mini-chick-x--right::after {
  content: '';
  position: absolute;
  width: 20rpx;
  height: 4rpx;
  background: #ff0000;
  transform: rotate(90deg);
}

/* 死亡提示文字 */
.death-message {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 80rpx;
}

.message-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.chicken-emoji {
  font-size: 48rpx;
  margin: 0 10rpx;
}

/* 操作按钮区域 */
.actions-area {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.action-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 20rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.btn-home {
  background-color: #000000;
  color: #ffffff;
}

.btn-restart {
  background-color: #f0f0f0;
  color: #666666;
}

.btn-text {
  font-size: 36rpx;
}
</style>