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
          <text class="toggle-text">{{ timeClassificationText }}</text>
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
            :canvas-id="'ringChartCanvas' + timestamp" 
            :id="'ringChartCanvas' + timestamp" 
            class="ring-canvas" 
            v-if="showRingChart"
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
      timestamp: Date.now(), // 用于强制刷新canvas
      
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
        { label: '专注', value: 120, color: '#000000', count: 8 }, // 黑色 - 时长120分钟，次数8次
        { label: '阅读', value: 90, color: '#2196F3', count: 12 }, // 蓝色 - 时长90分钟，次数12次
        { label: '工作', value: 150, color: '#FF9800', count: 10 }, // 橙色 - 时长150分钟，次数10次
        { label: '健身', value: 60, color: '#9C27B0', count: 6 }, // 紫色 - 时长60分钟，次数6次
        { label: '学习', value: 180, color: '#4CAF50', count: 15 }  // 绿色 - 时长180分钟，次数15次
      ],
      ringChartTotal: 51, // 总次数（当显示次数时的总数）
      ringChartInstance: null, // 环形图实例
      chartCanvas: null, // 图表canvas引用
      showRingChart: true // 控制环形图显示，用于强制重绘
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
    },
    
    timeClassificationText() {
      switch(this.timeClassification) {
        case 'day':
          return '按天查看';
        case 'week':
          return '按周查看';
        case 'month':
          return '按月查看';
        case 'year':
          return '按年查看';
        default:
          return '按天查看';
      }
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
    
    // 根据时间分类格式化日期
    formatDate(date) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      switch(this.timeClassification) {
        case 'day':
          // 按天查看：MM.DD 周X 格式
          const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
          const weekDay = weekDays[date.getDay()];
          return `${month}.${day} 周${weekDay}`;
          
        case 'week':
          // 按周查看：显示周一到周日的日期范围
          const startOfWeek = new Date(date);
          // 获取这一周的周一
          const dayOfWeek = date.getDay();
          const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周日是0，需要特殊处理
          startOfWeek.setDate(date.getDate() + daysFromMonday);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          const startMonth = (startOfWeek.getMonth() + 1).toString().padStart(2, '0');
          const startDay = startOfWeek.getDate().toString().padStart(2, '0');
          const endMonth = (endOfWeek.getMonth() + 1).toString().padStart(2, '0');
          const endDay = endOfWeek.getDate().toString().padStart(2, '0');
          
          // 处理跨月情况
          if (startOfWeek.getMonth() !== endOfWeek.getMonth()) {
            return `${startMonth}.${startDay}~${endMonth}.${endDay}`;
          } else {
            return `${startMonth}.${startDay}~${endDay}`;
          }
          
        case 'month':
          // 按月查看：YYYY.MM 格式
          return `${date.getFullYear()}.${month}`;
          
        case 'year':
          // 按年查看：YYYY 格式
          return `${date.getFullYear()}`;
          
        default:
          // 默认按天查看
          const defaultWeekDays = ['日', '一', '二', '三', '四', '五', '六'];
          const defaultWeekDay = defaultWeekDays[date.getDay()];
          return `${month}.${day} 周${defaultWeekDay}`;
      }
    },
    // 切换维度（时长/次数）
    toggleDimension() {
      this.showDimensionModal = true;
    },
    
    // 选择维度
    selectDimension(dimension) {
      console.log('选择维度:', dimension);
      this.currentDimension = dimension;
      this.showDimensionModal = false;
      
      uni.showToast({
        title: `已切换到${dimension === 'duration' ? '时长' : '次数'}维度`,
        icon: 'none'
      });
      
      // 更新时间戳以强制刷新canvas，使用更大的时间间隔以确保更新
      this.$nextTick(() => {
        setTimeout(() => {
          this.timestamp = Date.now();
          console.log('更新时间戳:', this.timestamp);
          
          // 强制刷新环形图，解决小程序兼容性问题
          this.forceRefreshRingChart();
        }, 100);
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
    
    // 切换日期（前一个时间段）
    prevDay() {
      const currentDate = this.parseCurrentDate();
      
      switch(this.timeClassification) {
        case 'day':
          currentDate.setDate(currentDate.getDate() - 1);
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() - 7);
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() - 1);
          break;
        case 'year':
          currentDate.setFullYear(currentDate.getFullYear() - 1);
          break;
      }
      
      this.currentDate = this.formatDate(currentDate);
    },
    
    // 切换日期（后一个时间段）
    nextDay() {
      // 检查是否已经是今天的时间段，如果是则不能向后选择
      if (this.isTodayTimeRange()) {
        return;
      }
      
      const currentDate = this.parseCurrentDate();
      
      switch(this.timeClassification) {
        case 'day':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'year':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
      
      this.currentDate = this.formatDate(currentDate);
    },
    
    // 解析当前显示的日期
    parseCurrentDate() {
      const today = new Date();
      
      switch(this.timeClassification) {
        case 'day':
          // 从 MM.DD 格式解析日期
          const dayParts = this.currentDate.split(' ')[0].split('.');
          const month = parseInt(dayParts[0]) - 1;
          const day = parseInt(dayParts[1]);
          
          // 使用当前年份，但如果月份超过当前月份，则使用前一年（防止未来日期）
          let year = today.getFullYear();
          if (month > today.getMonth()) {
            year = year - 1;
          }
          return new Date(year, month, day);
          
        case 'week':
          // 从 MM.DD~MM.DD 格式解析日期，取开始日期
          const weekParts = this.currentDate.split('~');
          const startPart = weekParts[0].split('.');
          const startMonth = parseInt(startPart[0]) - 1;
          const startDay = parseInt(startPart[1]);
          
          let weekYear = today.getFullYear();
          if (startMonth > today.getMonth()) {
            weekYear = weekYear - 1;
          }
          return new Date(weekYear, startMonth, startDay);
          
        case 'month':
          // 从 YYYY.MM 格式解析日期，取该月第一天
          const monthParts = this.currentDate.split('.');
          const monthYear = parseInt(monthParts[0]);
          const monthNum = parseInt(monthParts[1]) - 1;
          return new Date(monthYear, monthNum, 1);
          
        case 'year':
          // 从 YYYY 格式解析日期，取该年第一天
          const yearNum = parseInt(this.currentDate);
          return new Date(yearNum, 0, 1);
          
        default:
          // 默认按天处理
          const defaultParts = this.currentDate.split(' ')[0].split('.');
          const defaultMonth = parseInt(defaultParts[0]) - 1;
          const defaultDay = parseInt(defaultParts[1]);
          
          let defaultYear = today.getFullYear();
          if (defaultMonth > today.getMonth()) {
            defaultYear = defaultYear - 1;
          }
          return new Date(defaultYear, defaultMonth, defaultDay);
      }
    },
    
    // 检查当前时间范围是否为今天的时间范围
    isTodayTimeRange() {
      const today = new Date();
      const todayFormatted = this.formatDate(today);
      return this.currentDate === todayFormatted;
    },
    
    // 切换维度（时长/次数）
    switchDimension(dimension) {
      console.log('切换维度到:', dimension);
      this.currentDimension = dimension
      
      uni.showToast({
        title: `切换到${dimension === 'duration' ? '时长' : '次数'}维度`,
        icon: 'none'
      })
      
      // 更新时间戳以强制刷新canvas，使用更大的时间间隔以确保更新
      this.$nextTick(() => {
        setTimeout(() => {
          this.timestamp = Date.now();
          console.log('更新时间戳:', this.timestamp);
          
          // 强制刷新环形图，解决小程序兼容性问题
          this.forceRefreshRingChart();
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
      
      // 更新当前日期为对应时间分类的当前时间
      const today = new Date();
      this.currentDate = this.formatDate(today);
      this.todayDate = this.currentDate;
      
      // 更新时间戳以强制刷新canvas
      this.timestamp = Date.now();
      
      // 强制刷新环形图，解决小程序兼容性问题
      this.forceRefreshRingChart();
    },
    
    // 选择时间分类
    selectTimeClassification(classification) {
      this.timeClassification = classification;
      this.updatePickerValue();
      // 更新时间戳以强制刷新canvas
      this.timestamp = Date.now();
      
      // 强制刷新环形图，解决小程序兼容性问题
      this.forceRefreshRingChart();
    },
    
    // 绘制环形图
    async drawRingChart() {
      console.log('开始绘制环形图，当前维度:', this.currentDimension, '时间戳:', this.timestamp);
      // 确保DOM渲染完成
      await this.$nextTick();
      
      // 使用更长的延时确保元素完全渲染，解决小程序兼容性问题
      setTimeout(() => {
        // 获取canvas元素
        const query = uni.createSelectorQuery().in(this);
        const selector = '#ringChartCanvas' + this.timestamp;
        console.log('canvas选择器:', selector, '当前维度:', this.currentDimension);
        
        query.select(selector).boundingClientRect((rect) => {
          if (!rect || rect.width === 0 || rect.height === 0) {
            console.error('无法获取环形图canvas元素或元素尺寸为0');
            return;
          }
          
          // 创建canvas上下文
          const ctx = uni.createCanvasContext('ringChartCanvas' + this.timestamp, this);
          console.log('创建canvas上下文成功，当前维度:', this.currentDimension);
          
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
            : this.ringChartData.reduce((sum, item) => sum + item.count, 0);
          console.log('当前维度:', this.currentDimension, '总数:', total);
          
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
            console.log('绘制扇形 - 标签:', item.label, '值:', value, '百分比:', percentage);
            
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
            ctx.setFontSize(20); // 增大标签字体大小
            ctx.setTextAlign('center');
            ctx.fillText(item.label, labelX, labelY - 12);
            
            // 根据当前维度显示标签单位
            const unitText = this.currentDimension === 'duration' ? `${value}m` : `${value}次`;
            console.log('绘制标签文本:', item.label, '单位文本:', unitText);
            ctx.fillText(unitText, labelX, labelY + 12);
            
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
          
          // 绘制中心动态文本
          this.drawCenterText(ctx, centerX, centerY, radius, innerRadius);
          
          // 强制绘制并确保刷新，增加延时以确保在小程序中正确显示
          setTimeout(() => {
            ctx.draw(true, () => {
              console.log('第一次绘制完成，当前维度:', this.currentDimension);
              
              // 在某些小程序环境中，可能需要额外的强制刷新
              setTimeout(() => {
                ctx.draw(true, () => {
                  console.log('第二次绘制完成，当前维度:', this.currentDimension);
                });
              }, 200);
            });
          }, 100);
        }).exec();
      }, 150); // 增加延时以确保在小程序中元素完全渲染
    },
        
    // 绘制中心动态文本
    drawCenterText(ctx, centerX, centerY, radius, innerRadius) {
      // 计算中心文本内容
      const centerText = this.getCenterText();
      
      // 设置文本样式
      ctx.setFillStyle('#000000');
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      
      // 根据文本长度和环形图内径调整字体大小
      const maxFontSize = Math.min(20, (innerRadius * 1.5) / 2); // 限制最大字体大小
      const fontSize = Math.min(maxFontSize, 200 / centerText.length); // 根据文本长度调整字体大小
      ctx.setFontSize(fontSize);
      
      // 绘制多行文本
      const lines = centerText.split('\n');
      
      // 计算每行垂直居中位置
      const lineHeight = fontSize * 1.3; // 行高
      const totalHeight = lines.length * lineHeight;
      const startY = centerY - totalHeight / 2 + lineHeight / 2; // 调整起始位置
      
      // 绘制每一行
      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, startY + index * lineHeight);
      });
    },
    
    // 获取中心文本内容
    getCenterText() {
      console.log('获取中心文本，当前维度:', this.currentDimension);
      // 获取时间分类的文本描述
      const timeClassificationText = {
        'day': '天',
        'week': '周',
        'month': '月',
        'year': '年'
      }[this.timeClassification] || '天';
      
      if (this.currentDimension === 'duration') {
        // 时长模式：显示总时长
        const totalDuration = this.ringChartData.reduce((sum, item) => sum + item.value, 0);
        console.log('时长模式，总时长:', totalDuration);
        
        // 将分钟转换为小时和分钟
        const hours = Math.floor(totalDuration / 60);
        const minutes = totalDuration % 60;
        
        if (hours > 0) {
          const result = `这${timeClassificationText}专注\n总时长${hours}h ${minutes}m`;
          console.log('中心文本内容:', result);
          return result;
        } else {
          const result = `这${timeClassificationText}专注\n总时长${minutes}m`;
          console.log('中心文本内容:', result);
          return result;
        }
      } else {
        // 次数模式：显示总次数
        const totalCount = this.ringChartData.reduce((sum, item) => sum + item.count, 0);
        console.log('次数模式，总次数:', totalCount);
        
        // 根据时间分类调整文本
        let result;
        if (this.timeClassification === 'year') {
          result = `这${timeClassificationText}\n总次数${totalCount}次`;
        } else {
          result = `这${timeClassificationText}\n总次数${totalCount}次`;
        }
        
        console.log('中心文本内容:', result);
        return result;
      }
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
    },
    
    // 强制刷新环形图
    forceRefreshRingChart() {
      // 通过临时隐藏和显示Canvas来强制重新渲染
      this.showRingChart = false;
      
      this.$nextTick(() => {
        setTimeout(() => {
          this.showRingChart = true;
          
          // 确保DOM更新后再绘制
          this.$nextTick(() => {
            setTimeout(() => {
              this.drawRingChart();
            }, 350); // 给足够时间让Canvas元素重新创建
          });
        }, 50); // 短暂隐藏后重新显示
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
  width: 700rpx;
  height: 700rpx;
  position: relative;
  flex-shrink: 0;
}

.ring-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 700rpx;
  height: 700rpx;
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