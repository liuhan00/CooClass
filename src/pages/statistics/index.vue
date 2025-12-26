<template>
  <view class="container">
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
          <text class="dimension-text">{{ dimensionText }}</text>
          <text class="arrow-icon">▼</text>
        </view>
      </view>
      <text class="section-subtitle">{{ dimensionSubtitle }}</text>
      
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
                <text class="bar-date">{{ bar.date }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 标签分布（环形图+日期导航） -->
    <view class="tag-distribution-section">
      <view class="section-header">
        <text class="section-title">标签分布</text>
        <!-- 按天查看 -->
        <view class="daily-view-toggle" @tap="toggleDailyView">
          <text class="toggle-text">按天查看</text>
          <text class="toggle-arrow">›</text>
        </view>
      </view>
      <!-- 日期导航栏 -->
      <view class="date-navigation">
        <view class="nav-button nav-button--prev" @tap="prevDay">
          <text class="nav-arrow">‹</text>
        </view>
        <text class="current-date">{{ currentDate }}</text>
        <view class="nav-button nav-button--next" :class="{ 'nav-button--disabled': currentDate === todayDate }" @tap="nextDay">
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

          
          <!-- 环形图 -->
          <canvas 
            :canvas-id="'ringChartCanvas' + currentDimension" 
            :id="'ringChartCanvas' + currentDimension" 
            class="ring-canvas" 
            @touchstart="onRingChartTouchStart"
            @touchmove="onRingChartTouchMove"
            @touchend="onRingChartTouchEnd"
          ></canvas>
        </view>
      </view>
      

    </view>
  
  <!-- 维度选择弹窗 -->
  <view class="dimension-modal" v-if="showDimensionModal" @tap="closeDimensionModal">
    <view class="dimension-modal-overlay" @tap.stop=""></view>
    <view class="dimension-modal-content" @tap.stop="">
      <view class="dimension-modal-header">
        <text class="dimension-modal-title">选择分类类型</text>
        <view class="dimension-modal-close" @tap="closeDimensionModal">×</view>
      </view>
      <view class="dimension-modal-body">
        <view 
          class="dimension-option" 
          :class="{ 'dimension-option--active': currentDimension === 'duration' }"
          @tap="selectDimension('duration')"
        >
          <text class="dimension-option-text">时长</text>
        </view>
        <view 
          class="dimension-option" 
          :class="{ 'dimension-option--active': currentDimension === 'count' }"
          @tap="selectDimension('count')"
        >
          <text class="dimension-option-text">次数</text>
        </view>
      </view>
    </view>
  </view>
  
  <!-- 时间分类选择弹窗 -->
  <view class="time-classification-modal" v-if="showTimeClassificationModal" @tap="closeTimeClassificationModal">
    <view class="time-classification-overlay" @tap.stop=""></view>
    <view class="time-classification-content" @tap.stop="">
      <view class="time-classification-header">
        <text class="time-classification-title">按时间分类</text>
        <view class="time-classification-close" @tap="closeTimeClassificationModal">×</view>
      </view>
      <view class="time-classification-body">
        <view class="picker-container">
          <view class="picker-overlay-top"></view>
          <view class="picker-overlay-bottom"></view>
          <picker-view 
            class="picker-view" 
            :value="pickerValue" 
            @change="onPickerChange"
          >
            <picker-view-column>
              <view class="picker-item" v-for="item in timeClassificationOptions" :key="item.value">
                {{ item.label }}
              </view>
            </picker-view-column>
          </picker-view>
          <view class="picker-highlight"></view>
        </view>
      </view>
      <view class="time-classification-footer">
        <view class="time-classification-confirm" @tap="finishTimeClassification">
          <text class="time-classification-confirm-text">完成</text>
        </view>
      </view>
    </view>
  </view>
</view>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      currentDimension: 'duration', // 当前维度：duration(时长) 或 count(次数)
      showDailyView: false, // 是否显示按天查看
      showDimensionModal: false, // 是否显示维度选择弹窗
      showTimeClassificationModal: false, // 是否显示时间分类选择弹窗
      timeClassification: 'day', // 时间分类：day(按天)、week(按周)、month(按月)、year(按年)
      timeClassificationOptions: [
        { label: '按天查看', value: 'day' },
        { label: '按周查看', value: 'week' },
        { label: '按月查看', value: 'month' },
        { label: '按年查看', value: 'year' }
      ], // 时间分类选项
      pickerValue: [0], // 滚动选择器的值
      currentDate: '', // 当前选中的日期
      todayDate: '', // 今天的日期
      
      // 柱状图数据 - 时长
      durationData: [
        { date: '12.23', height: 80, value: 30 },
        { date: '12.24', height: 120, value: 45 },
        { date: '12.25', height: 60, value: 20 },
        { date: '12.26', height: 100, value: 35 },
        { date: '12.27', height: 140, value: 50 },
        { date: '12.28', height: 90, value: 32 },
        { date: '12.29', height: 110, value: 40 },
        { date: '12.30', height: 70, value: 25 },
        { date: '12.31', height: 130, value: 48 }
      ],
      // 柱状图数据 - 次数
      countData: [
        { date: '12.23', height: 70, value: 8 },
        { date: '12.24', height: 100, value: 12 },
        { date: '12.25', height: 50, value: 5 },
        { date: '12.26', height: 90, value: 10 },
        { date: '12.27', height: 120, value: 15 },
        { date: '12.28', height: 80, value: 7 },
        { date: '12.29', height: 100, value: 11 },
        { date: '12.30', height: 60, value: 4 },
        { date: '12.31', height: 110, value: 13 }
      ],
      
      // 环形图数据
      ringChartData: [
        { label: '专注', value: 30, color: '#000000', count: 30 }, // 黑色
        { label: '阅读', value: 20, color: '#2196F3', count: 20 }, // 蓝色
        { label: '工作', value: 15, color: '#FF9800', count: 15 }, // 橙色
        { label: '健身', value: 10, color: '#9C27B0', count: 10 }, // 紫色
        { label: '学习', value: 5, color: '#4CAF50', count: 5 }  // 绿色
      ],
      ringChartTotal: 140, // 总次数
      ringChartInstance: null, // 环形图实例
      chartCanvas: null // 图表canvas引用
    }
  },
  
  onLoad() {
    this.initDates();
    this.$nextTick(() => {
      setTimeout(() => {
        this.drawRingChart();
      }, 100);
    });
  },
  
  computed: {
    barData() {
      return this.currentDimension === 'duration' ? this.durationData : this.countData;
    },
    
    dimensionText() {
      return this.currentDimension === 'duration' ? '时长' : '次数';
    },
    
    dimensionSubtitle() {
      const total = this.currentDimension === 'duration' 
        ? '1小时' 
        : '15次';
      return `累计${total}`;
    }
  },
  
  methods: {
    // 初始化日期
    initDates() {
      const today = new Date();
      this.todayDate = this.formatDate(today);
      this.currentDate = this.todayDate; // 默认显示今天
      
      // 初始化滚动选择器的值
      this.updatePickerValue();
    },
    
    // 更新滚动选择器的值
    updatePickerValue() {
      const index = this.timeClassificationOptions.findIndex(item => item.value === this.timeClassification);
      this.pickerValue = [index >= 0 ? index : 0];
    },
    
    // 格式化日期为 MM.DD 周X 格式
    formatDate(date) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekDay = weekDays[date.getDay()];
      return `${month}.${day} 周${weekDay}`;
    },
    // 切换维度（时长/次数）
    toggleDimension() {
      this.showDimensionModal = true;
    },
    
    // 选择维度
    selectDimension(dimension) {
      this.currentDimension = dimension;
      this.showDimensionModal = false;
      
      // 这里可以添加更新图表数据的逻辑
      uni.showToast({
        title: `已切换到${dimension === 'duration' ? '时长' : '次数'}维度`,
        icon: 'none'
      });
    },
    
    // 关闭维度选择弹窗
    closeDimensionModal() {
      this.showDimensionModal = false;
    },
    
    // 显示柱子详情
    showDetail(bar) {
      const unit = this.currentDimension === 'duration' ? '分钟' : '次';
      uni.showToast({
        title: `日期: ${bar.date}, ${this.dimensionText}: ${bar.value}${unit}`,
        icon: 'none'
      })
    },
    
    // 切换日期（前一天）
    prevDay() {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      this.currentDate = this.formatDate(date);
    },
    
    // 切换日期（后一天）
    nextDay() {
      // 检查是否已经是今天，如果是今天则不能向后选择
      if (this.currentDate === this.todayDate) {
        return;
      }
      
      const date = new Date();
      // 从当前显示的日期开始计算
      const currentDateStr = this.currentDate.split(' ')[0]; // 获取 MM.DD 部分
      const [month, day] = currentDateStr.split('.').map(Number);
      
      date.setMonth(month - 1);
      date.setDate(day);
      date.setDate(date.getDate() + 1); // 向后一天
      
      this.currentDate = this.formatDate(date);
    },
    
    // 切换维度（时长/次数）
    switchDimension(dimension) {
      this.currentDimension = dimension
      uni.showToast({
        title: `切换到${dimension === 'duration' ? '时长' : '次数'}维度`,
        icon: 'none'
      })
      
      // 重新绘制环形图
      this.$nextTick(() => {
        setTimeout(() => {
          this.drawRingChart();
        }, 100);
      });
    },
    
    // 显示时间分类选择弹窗
    toggleDailyView() {
      this.showTimeClassificationModal = true;
    },
    
    // 滚动选择器变化
    onPickerChange(e) {
      const index = e.detail.value[0];
      this.pickerValue = [index];
      this.timeClassification = this.timeClassificationOptions[index].value;
    },
    
    // 关闭时间分类选择弹窗
    closeTimeClassificationModal() {
      this.showTimeClassificationModal = false;
    },
    
    // 完成时间分类选择
    finishTimeClassification() {
      this.showTimeClassificationModal = false;
    },
    
    // 选择时间分类
    selectTimeClassification(classification) {
      this.timeClassification = classification;
      this.updatePickerValue();
    },
    
    // 绘制环形图
    async drawRingChart() {
      // 确保DOM渲染完成
      await this.$nextTick();
      
      // 使用setTimeout确保元素完全渲染
      setTimeout(() => {
        // 获取canvas元素
        const query = uni.createSelectorQuery().in(this);
        const selector = '#ringChartCanvas' + this.currentDimension;
        
        query.select(selector).boundingClientRect((rect) => {
          if (!rect || rect.width === 0 || rect.height === 0) {
            console.error('无法获取环形图canvas元素或元素尺寸为0');
            return;
          }
          
          // 创建canvas上下文
          const ctx = uni.createCanvasContext('ringChartCanvas' + this.currentDimension, this);
          
          // 使用Canvas API绘制环形图
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          // 计算半径时考虑标签位置，确保标签不会超出画布
          const maxRadius = Math.min(rect.width, rect.height) / 2 * 0.8; // 最大半径不超过画布的一半
          const radius = Math.min(maxRadius - 60, Math.min(rect.width, rect.height) * 0.25); // 减小半径，为中央留出更多空间
          const innerRadius = radius * 0.6; // 减小内半径，增加环形宽度
          
          // 清除画布
          ctx.clearRect(0, 0, rect.width, rect.height);
          
          // 计算总值
          const total = this.currentDimension === 'duration' 
            ? this.ringChartData.reduce((sum, item) => sum + item.value, 0)
            : this.ringChartTotal;
          
          // 绘制背景圆环
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
          ctx.setFillStyle('#f0f0f0');
          ctx.fill();
          
          // 绘制每个扇形
          let currentAngle = -Math.PI / 2; // 从顶部开始
          
          this.ringChartData.forEach((item, index) => {
            const value = this.currentDimension === 'duration' ? item.value : item.count;
            const percentage = total > 0 ? value / total : 0;
            const angle = percentage * 2 * Math.PI;
            
            // 绘制扇形
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
            ctx.lineTo(
              centerX + innerRadius * Math.cos(currentAngle + angle),
              centerY + innerRadius * Math.sin(currentAngle + angle)
            );
            ctx.arc(centerX, centerY, innerRadius, currentAngle + angle, currentAngle, true);
            ctx.closePath();
            
            ctx.setFillStyle(item.color);
            ctx.fill();
            
            // 绘制扇形边框
            ctx.setStrokeStyle('#ffffff');
            ctx.setLineWidth(2);
            ctx.stroke();
            
            // 计算标签位置
            const midAngle = currentAngle + angle / 2;
            // 确保标签位置不会超出画布边界
            const maxLabelRadius = Math.min(rect.width, rect.height) / 2 * 0.9; // 标签半径不超过画布的一半
            const labelRadius = Math.min(radius + 40, maxLabelRadius);
            const labelX = centerX + labelRadius * Math.cos(midAngle);
            const labelY = centerY + labelRadius * Math.sin(midAngle);
            
            // 绘制连接线
            ctx.beginPath();
            ctx.moveTo(centerX + radius * Math.cos(midAngle), centerY + radius * Math.sin(midAngle));
            ctx.lineTo(labelX, labelY);
            ctx.setStrokeStyle('#000000');
            ctx.setLineWidth(1);
            ctx.stroke();
            
            // 绘制标签文字
            ctx.setFillStyle('#000000');
            ctx.setFontSize(16);
            ctx.setTextAlign('center');
            ctx.setTextBaseline('middle');
            
            // 标签文字分两行显示
            ctx.setFontSize(16); // 恢复字体大小
            ctx.setTextAlign('center');
            ctx.fillText(item.label, labelX, labelY - 12);
            ctx.fillText(`${value}次`, labelX, labelY + 12);
            
            currentAngle += angle;
          });
          
          // 绘制外边框
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.setStrokeStyle('#ffffff');
          ctx.setLineWidth(2);
          ctx.stroke();
          
          // 绘制内边框
          ctx.beginPath();
          ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
          ctx.stroke();
          
          // 中心区域留空，不绘制任何内容，为后续添加自定义内容预留空间
          
          // 调用draw方法渲染内容
          ctx.draw(true); // 传入true参数以确保绘制
        }).exec();
      }, 200);
    },
        
    // 环形图触摸事件
    onRingChartTouchStart(e) {
      // 处理触摸开始事件
    },
        
    onRingChartTouchMove(e) {
      // 处理触摸移动事件
    },
        
    onRingChartTouchEnd(e) {
      // 处理触摸结束事件
    },
    
    // 页面卸载时清理图表实例
    onUnload() {
      if (this.ringChartInstance) {
        this.ringChartInstance.dispose();
        this.ringChartInstance = null;
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
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



.bar-date {
  font-size: 20rpx;
  color: #666666;
  margin-top: 10rpx;
}

/* 标签分布标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
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

.nav-button--disabled {
  opacity: 0.4;
  pointer-events: none;
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
  gap: 10rpx;
  margin-bottom: 30rpx;
  background-color: #f0f0f0;
  border-radius: 50rpx;
  padding: 10rpx;
}

.switch-button {
  padding: 15rpx 30rpx;
  border-radius: 50rpx;
  background-color: transparent;
  flex: 1;
  text-align: center;
}

.switch-button--active {
  background-color: #ffffff;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  font-weight: bold;
}

.switch-text {
  font-size: 28rpx;
  color: #333333;
}

/* 环形图 */
.ring-chart-container {
  display: flex;
  justify-content: center; /* 让内容居中 */
  align-items: center; /* 垂直居中 */
  margin: 20rpx 0; /* 调整间距，与内容块协调 */
}

.ring-chart {
  width: 600rpx;
  height: 600rpx;
  position: relative;
  flex-shrink: 0;
}

.ring-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 600rpx;
  height: 600rpx;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
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
  min-width: 0; /* 确保flex项目不会超出容器 */
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

/* 维度选择弹窗 */
.dimension-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.dimension-modal-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  width: 80%;
  max-width: 500rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.3);
}

.dimension-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.dimension-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dimension-modal-close {
  font-size: 40rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-modal-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dimension-option {
  padding: 25rpx 30rpx;
  border-radius: 12rpx;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-option--active {
  background-color: #e6f7ff;
  border: 2rpx solid #1890ff;
}

.dimension-option-text {
  font-size: 28rpx;
  color: #333;
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

/* 时间分类选择弹窗 */
.time-classification-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
  display: flex;
  align-items: flex-end; /* 弹窗显示在底部 */
}

.time-classification-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.time-classification-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 20rpx 20rpx 0 0; /* 只有顶部圆角 */
  width: 100%;
  padding: 40rpx 30rpx 30rpx;
  box-shadow: 0 -10rpx 20rpx rgba(0, 0, 0, 0.1);
}

.time-classification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.time-classification-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.time-classification-close {
  font-size: 40rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-classification-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.picker-container {
  position: relative;
  height: 300rpx;
  overflow: hidden;
}

.picker-view {
  height: 100%;
  box-sizing: border-box;
  padding: 0 60rpx;
}

.picker-item {
  height: 75rpx;
  line-height: 75rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.picker-overlay-top, .picker-overlay-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 112rpx;
  z-index: 1;
}

.picker-overlay-top {
  top: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5));
}

.picker-overlay-bottom {
  bottom: 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5));
}

.picker-highlight {
  position: absolute;
  top: 50%;
  left: 60rpx;
  right: 60rpx;
  height: 75rpx;
  transform: translateY(-50%);
  border-top: 2rpx solid #e0e0e0;
  border-bottom: 2rpx solid #e0e0e0;
  pointer-events: none;
  z-index: 1;
}

.time-classification-option {
  padding: 25rpx 30rpx;
  border-radius: 12rpx;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-classification-option--active {
  background-color: #e6f7ff;
  border: 2rpx solid #1890ff;
}

.time-classification-option-text {
  font-size: 28rpx;
  color: #333;
}

.time-classification-footer {
  display: flex;
  justify-content: center;
}

.time-classification-confirm {
  background-color: #000000;
  color: #ffffff;
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-classification-confirm-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
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