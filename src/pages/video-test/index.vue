<template>
  <view class="container">
    <text class="title">视频测试页面</text>
    
    <!-- 测试网络视频 -->
    <view class="section">
      <text class="subtitle">网络视频测试：</text>
      <video 
        id="networkVideo"
        class="video-player"
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        controls
        :autoplay="false"
        @error="handleNetworkVideoError"
        @loadeddata="handleNetworkVideoLoaded"
      ></video>
    </view>
    
    <!-- 测试本地视频 -->
    <view class="section">
      <text class="subtitle">本地视频测试：</text>
      <video 
        id="localVideo"
        class="video-player"
        :src="localVideoSrc"
        controls
        :autoplay="false"
        @error="handleLocalVideoError"
        @loadeddata="handleLocalVideoLoaded"
      ></video>
    </view>
    
    <!-- 错误信息显示 -->
    <view v-if="errorMessages.length > 0" class="error-section">
      <text class="error-title">错误信息：</text>
      <text v-for="(msg, index) in errorMessages" :key="index" class="error-message">
        {{ msg }}
      </text>
    </view>
    
    <!-- 控制按钮 -->
    <view class="controls">
      <button @tap="playNetworkVideo">播放网络视频</button>
      <button @tap="playLocalVideo">播放本地视频</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      localVideoSrc: './login_h264.mp4',
      errorMessages: []
    }
  },
  methods: {
    handleNetworkVideoError(err) {
      this.errorMessages.push(`网络视频加载失败: ${JSON.stringify(err)}`);
      console.error('网络视频加载失败:', err);
    },
    
    handleLocalVideoError(err) {
      this.errorMessages.push(`本地视频加载失败: ${JSON.stringify(err)}`);
      console.error('本地视频加载失败:', err);
    },
    
    handleNetworkVideoLoaded() {
      this.errorMessages.push('网络视频加载成功');
      console.log('网络视频加载成功');
    },
    
    handleLocalVideoLoaded() {
      this.errorMessages.push('本地视频加载成功');
      console.log('本地视频加载成功');
    },
    
    playNetworkVideo() {
      const videoContext = uni.createVideoContext('networkVideo', this);
      videoContext.play();
    },
    
    playLocalVideo() {
      const videoContext = uni.createVideoContext('localVideo', this);
      videoContext.play();
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}

.section {
  margin-bottom: 40rpx;
}

.subtitle {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.video-player {
  width: 100%;
  height: 400rpx;
  background-color: #f0f0f0;
}

.error-section {
  margin-top: 40rpx;
  padding: 20rpx;
  background-color: #ffeeee;
  border-radius: 10rpx;
}

.error-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff0000;
  margin-bottom: 10rpx;
}

.error-message {
  font-size: 24rpx;
  color: #ff0000;
  margin-bottom: 5rpx;
  display: block;
}

.controls {
  display: flex;
  justify-content: space-around;
  margin-top: 40rpx;
}

.controls button {
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}
</style>