<template>
  <view class="test-page">
    <text class="title">视频测试页面</text>
    <video 
      :src="videoSrc" 
      :autoplay="true" 
      :loop="true" 
      :muted="false"
      controls
      style="width: 100%; height: 300px;"
      @error="handleVideoError"
    ></video>
    <button @tap="reloadVideo">重新加载视频</button>
    <text v-if="errorInfo" class="error-info">{{ errorInfo }}</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      videoSrc: '/static/login.mp4',
      errorInfo: ''
    }
  },
  methods: {
    handleVideoError(err) {
      console.error('视频加载失败:', err)
      this.errorInfo = '视频加载失败: ' + JSON.stringify(err)
    },
    reloadVideo() {
      this.errorInfo = ''
      // 重新设置视频源
      this.videoSrc = ''
      this.$nextTick(() => {
        this.videoSrc = '/static/login.mp4'
      })
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
.error-info {
  color: red;
  margin-top: 20px;
}
</style>