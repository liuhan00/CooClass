<template>
  <view class="container">
    <!-- 页面头部 -->
    <view class="header">
      <text class="page-title">时光模块</text>
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
        
        <view class="profile-section">
          <view class="section-header">
            <text class="section-title">解锁的小鸡皮肤/技能</text>
          </view>
          <view class="unlocked-items">
            <view class="item">
              <text class="item-name">默认皮肤</text>
              <text class="item-status">已解锁</text>
            </view>
            <view class="item">
              <text class="item-name">金色皮肤</text>
              <text class="item-status">未解锁</text>
            </view>
            <view class="item">
              <text class="item-name">飞行技能</text>
              <text class="item-status">未解锁</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 时光日程Tab -->
      <view v-if="activeTab === 'schedule'" class="schedule-tab">
        <view class="calendar-section">
          <view class="calendar-header">
            <text class="month-year">2023年12月</text>
            <view class="nav-buttons">
              <text class="nav-button">‹</text>
              <text class="nav-button">›</text>
            </view>
          </view>
          <view class="calendar-grid">
            <!-- 日历头部 -->
            <view class="weekdays">
              <text class="weekday">日</text>
              <text class="weekday">一</text>
              <text class="weekday">二</text>
              <text class="weekday">三</text>
              <text class="weekday">四</text>
              <text class="weekday">五</text>
              <text class="weekday">六</text>
            </view>
            <!-- 日历日期 -->
            <view class="dates">
              <!-- 示例日期，实际应该动态生成 -->
              <view v-for="day in 31" :key="day" class="date-cell">
                <text class="date-number">{{ day }}</text>
                <view class="date-indicators">
                  <view class="indicator indicator--completed"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="schedule-section">
          <view class="section-header">
            <text class="section-title">今日日程</text>
          </view>
          <view class="schedule-list">
            <view class="schedule-item">
              <view class="schedule-info">
                <text class="schedule-time">09:00 - 10:30</text>
                <text class="schedule-title">阅读专注</text>
              </view>
              <view class="schedule-reward">
                <text class="reward-text">+10金币</text>
              </view>
            </view>
            <view class="schedule-item">
              <view class="schedule-info">
                <text class="schedule-time">14:00 - 15:30</text>
                <text class="schedule-title">工作专注</text>
              </view>
              <view class="schedule-reward">
                <text class="reward-text">+10金币</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="rules-section">
          <view class="section-header">
            <text class="section-title">规则说明</text>
          </view>
          <view class="rules-content">
            <text class="rule-text">完成日程得金币，助力宠物升级</text>
          </view>
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

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
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

.profile-section,
.schedule-section,
.calendar-section,
.rules-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
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

.unlocked-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.item-name {
  font-size: 28rpx;
  color: #333333;
}

.item-status {
  font-size: 24rpx;
  color: #666666;
}

.item-status:not(:first-child) {
  color: #ff9800;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.month-year {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.nav-buttons {
  display: flex;
  gap: 20rpx;
}

.nav-button {
  font-size: 36rpx;
  color: #666666;
  padding: 10rpx;
}

.weekdays {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #666666;
}

.dates {
  display: flex;
  flex-wrap: wrap;
}

.date-cell {
  width: calc(100% / 7);
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.date-number {
  font-size: 28rpx;
  color: #333333;
}

.date-indicators {
  position: absolute;
  bottom: 10rpx;
  display: flex;
}

.indicator {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.indicator--completed {
  background-color: #4CAF50;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.schedule-info {
  display: flex;
  flex-direction: column;
}

.schedule-time {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 5rpx;
}

.schedule-title {
  font-size: 28rpx;
  color: #333333;
}

.schedule-reward {
  background-color: #FFF3E0;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.reward-text {
  font-size: 24rpx;
  color: #FF9800;
  font-weight: bold;
}

.rules-content {
  padding: 20rpx;
  background-color: #E3F2FD;
  border-radius: 10rpx;
}

.rule-text {
  font-size: 28rpx;
  color: #1976D2;
}
</style>