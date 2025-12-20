<template>
  <view class="container">
    <!-- 页面头部 -->
    <view class="header">
    </view>
    
    <!-- Tab导航 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'profile' }"
        @tap="switchTab('profile')"
      >
        <text class="tab-text">小鸡档案</text>
      </view>
      <view 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'schedule' }"
        @tap="switchTab('schedule')"
      >
        <text class="tab-text">时光日程</text>
      </view>
    </view>
    
    <!-- Tab内容 -->
    <view class="tab-content">
      <!-- 小鸡档案Tab -->
      <view v-if="activeTab === 'profile'" class="profile-tab">
        <!-- 角色基本信息 -->
        <view class="profile-section character-info">
          <view class="character-header">
            <view class="character-name-container">
              <text class="character-name">小咕</text>
              <text class="character-level">Lv.13</text>
            </view>
            <view class="character-status">
              <text class="status-indicator">N</text>
            </view>
          </view>
          <view class="progress-container">
            <view class="progress-bar">
              <view class="progress-fill" style="width: 71.5%"></view>
            </view>
            <text class="progress-text">715/1000</text>
          </view>
          <view class="character-stats">
            <view class="stat-item">
              <text class="stat-label">年龄</text>
              <text class="stat-value">24天</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">体重</text>
              <text class="stat-value">1.0 kg</text>
            </view>
          </view>
        </view>
        
        <view class="profile-section">
          <view class="section-header">
            <text class="section-title">等级成长曲线</text>
          </view>
          <view class="growth-chart">
            <!-- 这里可以放置等级成长曲线图表 -->
            <text class="chart-placeholder">等级成长曲线图表</text>
          </view>
        </view>
        
        <view class="profile-section">
          <view class="section-header">
            <text class="section-title">累计专注时长</text>
          </view>
          <view class="focus-stats">
            <view class="stat-item">
              <text class="stat-value">120</text>
              <text class="stat-label">小时</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">30</text>
              <text class="stat-label">天</text>
            </view>
          </view>
        </view>
        

      </view>
      
      <!-- 时光日程Tab -->
      <view v-if="activeTab === 'schedule'" class="schedule-tab">
        
        <!-- 倒数日记录区 -->
        <view class="countdown-section">
          <text class="section-title">倒数日</text>
          <view class="record-card">
            <view class="icon-area">
              <view class="couple-icon"></view>
            </view>
            <view class="info-area">
              <text class="main-text">距离见ta</text>
              <text class="date-text">2025.12.20 星期六</text>
              <view class="days-area">
                <text class="days-number">0</text>
                <view class="days-unit">
                  <text class="unit-text">DAYS</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 分割线 -->
        <view class="divider"></view>
        
        <!-- 纪念日记录区 -->
        <view class="memorial-section">
          <text class="section-title">纪念日</text>
          <view class="record-card">
            <view class="icon-area">
              <view class="smiley-icon"></view>
            </view>
            <view class="info-area">
              <text class="main-text">与ta相识</text>
              <text class="date-text">2025.11.30 星期日</text>
              <view class="days-area">
                <text class="days-number">20</text>
                <view class="days-unit">
                  <text class="unit-text">DAYS</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 添加按钮 -->
        <view class="add-button" @tap="goToCreatePage">
          <text class="plus-icon">+</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'profile' // 默认激活小鸡档案tab
    }
  },
  methods: {
    // 切换tab
    switchTab(tab) {
      this.activeTab = tab
    },
    
    // 跳转到创建页面
    goToCreatePage() {
      // 这里可以传递参数区分默认选中状态
      uni.navigateTo({
        url: '/pages/create-time/index' // 假设创建页面路径
      })
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #ffffff;
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #e0e0e0;
}



.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 30rpx;
  text-align: center;
  border-bottom: 6rpx solid transparent;
}

.tab--active {
  border-bottom-color: #000000;
}

.tab-text {
  font-size: 32rpx;
  color: #666666;
}

.tab--active .tab-text {
  color: #000000;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.profile-tab,
.schedule-tab {
  padding: 30rpx;
}

.profile-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20rpx;
}



.growth-chart {
  height: 300rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: #999999;
  font-size: 28rpx;
}

.focus-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #000000;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}


.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}


/* 角色信息样式 */
.character-info {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  color: #333333;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e0e0e0;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.character-name-container {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.character-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
}

.character-level {
  font-size: 28rpx;
  background-color: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  color: #666666;
}

.character-status {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  font-size: 24rpx;
  font-weight: bold;
  color: #666666;
}

.progress-container {
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 20rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 10rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666666;
}

.character-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 5rpx;
}

.stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #000000;
}

/* 时光日程样式 */

.section-title {
  font-size: 28rpx;
  font-weight: normal;
  color: #666666;
  margin: 20rpx 0;
  display: block;
  text-align: left;
}

.record-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.icon-area {
  margin-right: 24rpx;
}

.couple-icon {
  width: 64rpx;
  height: 64rpx;
  background-color: #FF6B8B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.smiley-icon {
  width: 64rpx;
  height: 64rpx;
  background-color: #4ECDC4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-area {
  flex: 1;
}

.main-text {
  font-size: 32rpx;
  font-weight: normal;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.date-text {
  font-size: 24rpx;
  font-weight: normal;
  color: #999999;
  display: block;
  margin-bottom: 20rpx;
}

.days-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.days-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B8B;
}

.memorial-section .days-number {
  color: #4ECDC4;
}

.days-unit {
  text-align: right;
}

.unit-text {
  font-size: 24rpx;
  font-weight: normal;
  color: #999999;
}

.divider {
  height: 1rpx;
  background-color: #EEEEEE;
  margin: 20rpx 0;
}

.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 96rpx;
  height: 96rpx;
  background-color: #333333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.add-button:active {
  background-color: #000000;
}

.plus-icon {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: bold;
}
</style>