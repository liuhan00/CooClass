<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">统计</text>
    </view>
    
    <!-- 状态概览区 -->
    <view class="status-overview">
      <!-- 今日专注 & 累计专注 -->
      <view class="focus-cards">
        <view class="focus-card focus-card--today">
          <text class="card-label">今日专注</text>
          <text class="card-value">75</text>
          <text class="card-unit">分钟</text>
        </view>
        <view class="focus-card focus-card--total">
          <text class="card-label">累计专注</text>
          <text class="card-value">120</text>
          <text class="card-unit">分钟</text>
        </view>
      </view>
      
      <!-- 今日失败 & 累计失败 -->
      <view class="failure-section">
        <view class="failure-item">
          <text class="failure-label">今日失败</text>
          <text class="failure-value">2</text>
        </view>
        <view class="failure-item">
          <text class="failure-label">累计失败</text>
          <text class="failure-value failure-value--highlight">15</text>
        </view>
      </view>
    </view>
    
    <!-- 近期专注速览（柱状图模块） -->
    <view class="recent-focus-section">
      <view class="section-header">
        <text class="section-title">近期专注速览</text>
        <view class="dimension-toggle" @tap="toggleDimension">
          <text class="dimension-text">时长</text>
          <text class="arrow-icon">▼</text>
        </view>
      </view>
      <text class="section-subtitle">累计时长1分</text>
      
      <!-- 柱状图 -->
      <view class="bar-chart">
        <view class="chart-container">
          <!-- Y轴刻度 -->
          <view class="y-axis">
            <text class="y-label">60</text>
            <text class="y-label">45</text>
            <text class="y-label">30</text>
            <text class="y-label">15</text>
            <text class="y-label">0</text>
          </view>
          
          <!-- 图表区域 -->
          <view class="chart-area">
            <!-- 红色虚线（平均时长/目标时长） -->
            <view class="average-line"></view>
            
            <!-- 柱子 -->
            <view class="bars-container">
              <view 
                v-for="(bar, index) in barData" 
                :key="index"
                class="bar-wrapper"
                @tap="showDetail(bar)"
              >
                <view 
                  class="bar" 
                  :style="{ height: bar.height + 'rpx' }"
                ></view>
                <view class="bird-icon"></view>
                <text class="bar-date">{{ bar.date }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 标签分布（环形图+日期导航） -->
    <view class="tag-distribution-section">
      <!-- 日期导航栏 -->
      <view class="date-navigation">
        <view class="nav-button nav-button--prev" @tap="prevDay">
          <text class="nav-arrow">‹</text>
        </view>
        <text class="current-date">12.20 周六</text>
        <view class="nav-button nav-button--next" @tap="nextDay">
          <text class="nav-arrow">›</text>
        </view>
      </view>
      
      <!-- 切换按钮 -->
      <view class="dimension-switch">
        <view 
          class="switch-button" 
          :class="{ 'switch-button--active': currentDimension === 'duration' }"
          @tap="switchDimension('duration')"
        >
          <text class="switch-text">时长</text>
        </view>
        <view 
          class="switch-button" 
          :class="{ 'switch-button--active': currentDimension === 'count' }"
          @tap="switchDimension('count')"
        >
          <text class="switch-text">次数</text>
        </view>
      </view>
      
      <!-- 环形图 -->
      <view class="ring-chart-container">
        <view class="ring-chart">
          <!-- 中心文本 -->
          <view class="chart-center">
            <text class="center-value">1h 20m</text>
            <text class="center-label">当日总专注时长</text>
          </view>
          
          <!-- 扇区 -->
          <view class="chart-sectors">
            <!-- 这里简化展示，实际应该根据数据动态生成 -->
            <view class="sector sector--focus"></view>
            <view class="sector sector--study"></view>
            <view class="sector sector--reading"></view>
            <view class="sector sector--fitness"></view>
            <view class="sector sector--work"></view>
          </view>
        </view>
        
        <!-- 扇区标签 -->
        <view class="sector-labels">
          <view class="label-item">
            <view class="label-color label-color--focus"></view>
            <text class="label-text">专注</text>
            <text class="label-value">0分</text>
          </view>
          <view class="label-item">
            <view class="label-color label-color--study"></view>
            <text class="label-text">学习</text>
            <text class="label-value">0分</text>
          </view>
          <view class="label-item">
            <view class="label-color label-color--reading"></view>
            <text class="label-text">阅读</text>
            <text class="label-value">0分</text>
          </view>
          <view class="label-item">
            <view class="label-color label-color--fitness"></view>
            <text class="label-text">健身</text>
            <text class="label-value">0分</text>
          </view>
          <view class="label-item">
            <view class="label-color label-color--work"></view>
            <text class="label-text">工作</text>
            <text class="label-value">0分</text>
          </view>
        </view>
      </view>
      
      <!-- 按天查看 -->
      <view class="daily-view-toggle" @tap="toggleDailyView">
        <text class="toggle-text">按天查看</text>
        <text class="toggle-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentDimension: 'duration', // 当前维度：duration(时长) 或 count(次数)
      showDailyView: false, // 是否显示按天查看
      
      // 柱状图数据
      barData: [
        { date: '12.23', height: 80, value: 30 },
        { date: '12.24', height: 120, value: 45 },
        { date: '12.25', height: 60, value: 20 },
        { date: '12.26', height: 100, value: 35 },
        { date: '12.27', height: 140, value: 50 },
        { date: '12.28', height: 90, value: 32 },
        { date: '12.29', height: 110, value: 40 },
        { date: '12.30', height: 70, value: 25 },
        { date: '12.31', height: 130, value: 48 }
      ]
    }
  },
  
  methods: {
    // 切换维度（时长/次数）
    toggleDimension() {
      // 这里可以实现维度切换逻辑
      uni.showToast({
        title: '切换维度',
        icon: 'none'
      })
    },
    
    // 显示柱子详情
    showDetail(bar) {
      uni.showToast({
        title: `日期: ${bar.date}, 时长: ${bar.value}分钟`,
        icon: 'none'
      })
    },
    
    // 切换日期（前一天）
    prevDay() {
      uni.showToast({
        title: '切换到前一天',
        icon: 'none'
      })
    },
    
    // 切换日期（后一天）
    nextDay() {
      uni.showToast({
        title: '切换到后一天',
        icon: 'none'
      })
    },
    
    // 切换维度（时长/次数）
    switchDimension(dimension) {
      this.currentDimension = dimension
      uni.showToast({
        title: `切换到${dimension === 'duration' ? '时长' : '次数'}维度`,
        icon: 'none'
      })
    },
    
    // 切换按天查看
    toggleDailyView() {
      this.showDailyView = !this.showDailyView
      uni.showToast({
        title: this.showDailyView ? '展开按天查看' : '收起按天查看',
        icon: 'none'
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
  padding: 20rpx;
  box-sizing: border-box;
}

/* 页面标题 */
.page-header {
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

/* 状态概览区 */
.status-overview {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 专注卡片 */
.focus-cards {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.focus-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.focus-card--today {
  background-color: #000000;
}

.focus-card--total {
  background-color: #ffffff;
  border: 1rpx solid #000000;
}

.card-label {
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.focus-card--today .card-label {
  color: #ffffff;
}

.focus-card--total .card-label {
  color: #000000;
}

.card-value {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.focus-card--today .card-value {
  color: #ffffff;
}

.focus-card--total .card-value {
  color: #000000;
}

.card-unit {
  font-size: 24rpx;
}

.focus-card--today .card-unit {
  color: #cccccc;
}

.focus-card--total .card-unit {
  color: #666666;
}

/* 失败统计 */
.failure-section {
  display: flex;
  justify-content: space-between;
}

.failure-item {
  display: flex;
  flex-direction: column;
}

.failure-label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.failure-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.failure-value--highlight {
  color: #ff0000;
}

/* 近期专注速览 */
.recent-focus-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.dimension-toggle {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
}

.dimension-text {
  font-size: 28rpx;
  color: #333333;
  margin-right: 10rpx;
}

.arrow-icon {
  font-size: 24rpx;
  color: #666666;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

/* 柱状图 */
.bar-chart {
  height: 400rpx;
}

.chart-container {
  display: flex;
  height: 100%;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 60rpx;
  margin-right: 20rpx;
}

.y-label {
  font-size: 20rpx;
  color: #999999;
}

.chart-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.average-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2rpx;
  border-top: 2rpx dashed #ff0000;
  z-index: 1;
}

.bars-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-top: 20rpx;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar {
  width: 40rpx;
  background-color: #000000;
  border-radius: 8rpx 8rpx 0 0;
  margin-bottom: 10rpx;
}

.bird-icon {
  width: 30rpx;
  height: 30rpx;
  background-color: #FF6B8B;
  border-radius: 50%;
  margin-bottom: 10rpx;
  position: relative;
}

.bird-icon::before {
  content: '';
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  background-color: #000000;
  border-radius: 50%;
  top: 8rpx;
  left: 8rpx;
}

.bar-date {
  font-size: 20rpx;
  color: #666666;
}

/* 标签分布 */
.tag-distribution-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 日期导航 */
.date-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
}

.nav-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
  margin: 0 20rpx;
}

.nav-arrow {
  font-size: 36rpx;
  color: #333333;
}

.current-date {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

/* 维度切换 */
.dimension-switch {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.switch-button {
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.switch-button--active {
  background-color: #e0e0e0;
}

.switch-text {
  font-size: 28rpx;
  color: #333333;
}

/* 环形图 */
.ring-chart-container {
  display: flex;
  margin-bottom: 30rpx;
}

.ring-chart {
  width: 300rpx;
  height: 300rpx;
  position: relative;
  margin-right: 40rpx;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.center-label {
  font-size: 24rpx;
  color: #666666;
}

.chart-sectors {
  width: 100%;
  height: 100%;
  position: relative;
}

.sector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.sector--focus {
  clip-path: polygon(50% 50%, 50% 0%, 80% 20%);
  background-color: #4CAF50;
}

.sector--study {
  clip-path: polygon(50% 50%, 80% 20%, 100% 50%);
  background-color: #2196F3;
}

.sector--reading {
  clip-path: polygon(50% 50%, 100% 50%, 80% 80%);
  background-color: #FF9800;
}

.sector--fitness {
  clip-path: polygon(50% 50%, 80% 80%, 50% 100%);
  background-color: #9C27B0;
}

.sector--work {
  clip-path: polygon(50% 50%, 50% 100%, 20% 80%);
  background-color: #F44336;
}

/* 扇区标签 */
.sector-labels {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.label-item {
  display: flex;
  align-items: center;
}

.label-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  margin-right: 15rpx;
}

.label-color--focus {
  background-color: #4CAF50;
}

.label-color--study {
  background-color: #2196F3;
}

.label-color--reading {
  background-color: #FF9800;
}

.label-color--fitness {
  background-color: #9C27B0;
}

.label-color--work {
  background-color: #F44336;
}

.label-text {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
}

.label-value {
  font-size: 28rpx;
  color: #666666;
}

/* 按天查看 */
.daily-view-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 12rpx;
}

.toggle-text {
  font-size: 28rpx;
  color: #333333;
}

.toggle-arrow {
  font-size: 36rpx;
  color: #666666;
}
</style>