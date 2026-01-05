<template>
  <view class="container">

    
    <!-- 筛选选项 -->
    <view class="filter-section">
      <view class="filter-item" @tap="showTypePicker = true">
        <text class="filter-label">类型:</text>
        <text class="filter-value">{{ selectedTypeText }}</text>
        <text class="filter-arrow">﹀</text>
      </view>
      <view class="filter-item" @tap="showDaysPicker = true">
        <text class="filter-label">时间:</text>
        <text class="filter-value">{{ selectedDaysText }}</text>
        <text class="filter-arrow">﹀</text>
      </view>
    </view>
    
    <!-- 互动记录列表 -->
    <scroll-view class="records-container" scroll-y="true" @scrolltolower="loadMore">
      <view class="record-item" v-for="(record, index) in records" :key="index">
        <view class="record-icon">
          {{ getInteractionIcon(record.interactionType) }}
        </view>
        <view class="record-content">
          <text class="record-message">{{ record.message }}</text>
          <view class="record-details">
            <text class="record-type">{{ getInteractionTypeText(record.interactionType) }}</text>
            <text class="record-time">{{ formatDate(record.createTime) }}</text>
          </view>
          <view class="record-stats" v-if="record.happinessGained || record.expGained">
            <text class="stat-item" v-if="record.happinessGained">+{{ record.happinessGained }}快乐</text>
            <text class="stat-item" v-if="record.expGained">+{{ record.expGained }}经验</text>
            <text class="stat-item" v-if="record.quantity">×{{ record.quantity }}</text>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-status" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view class="loading-status" v-else-if="hasMore">
        <text class="loading-text">上拉加载更多</text>
      </view>
      
      <view class="loading-status" v-else-if="records.length > 0">
        <text class="loading-text">已加载全部记录</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="records.length === 0 && !loading">
        <text class="empty-text">暂无互动记录</text>
      </view>
    </scroll-view>
    
    <!-- 类型选择弹窗 -->
    <view class="picker-modal" v-if="showTypePicker" @tap="hidePicker">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择互动类型</text>
          <text class="picker-cancel" @tap="hidePicker">取消</text>
        </view>
        <view class="picker-options">
          <view 
            class="picker-option" 
            :class="{ 'picker-option--selected': selectedType === option.value }"
            v-for="option in typeOptions" 
            :key="option.value"
            @tap="selectType(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 时间选择弹窗 -->
    <view class="picker-modal" v-if="showDaysPicker" @tap="hidePicker">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择时间范围</text>
          <text class="picker-cancel" @tap="hidePicker">取消</text>
        </view>
        <view class="picker-options">
          <view 
            class="picker-option" 
            :class="{ 'picker-option--selected': selectedDays === option.value }"
            v-for="option in daysOptions" 
            :key="option.value"
            @tap="selectDays(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getChickenInteractionHistory } from '@/utils/request.js'

export default {
  data() {
    return {
      records: [],
      loading: false,
      hasMore: false,
      page: 1,
      pageSize: 10,
      
      // 筛选参数
      selectedType: '', // ''表示全部，'feed'表示喂食，'play'表示玩耍
      selectedDays: 7,  // 默认7天
      showTypePicker: false,
      showDaysPicker: false,
      
      // 选项配置
      typeOptions: [
        { label: '全部', value: '' },
        { label: '喂食', value: 'feed' },
        { label: '玩耍', value: 'play' }
      ],
      daysOptions: [
        { label: '全部', value: 0 },
        { label: '1天内', value: 1 },
        { label: '3天内', value: 3 },
        { label: '7天内', value: 7 },
        { label: '30天内', value: 30 }
      ]
    }
  },
  
  onLoad() {
    this.loadRecords();
  },
  
  computed: {
    selectedTypeText() {
      const option = this.typeOptions.find(opt => opt.value === this.selectedType);
      return option ? option.label : '全部';
    },
    
    selectedDaysText() {
      const option = this.daysOptions.find(opt => opt.value === this.selectedDays);
      return option ? option.label : '7天内';
    }
  },
  
  onLoad() {
    this.loadRecords();
  },
  
  onReachBottom() {
    this.loadMore();
  },
  
  methods: {
    // 加载记录
    async loadRecords() {
      this.loading = true;
      
      try {
        const params = {
          interactionType: this.selectedType || undefined, // 如果为空则不传递参数
          days: this.selectedDays === 0 ? undefined : this.selectedDays // 如果为0则不传递参数
        };
        
        const response = await getChickenInteractionHistory(params);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          this.records = response.data.data.records || [];
          this.hasMore = (response.data.data.totalCount || 0) > this.records.length;
        } else {
          console.error('获取互动记录失败:', response);
          uni.showToast({
            title: response.data.message || '获取记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取互动记录时出错:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 加载更多
    async loadMore() {
      if (!this.hasMore || this.loading) return;
      
      this.loading = true;
      
      try {
        const params = {
          interactionType: this.selectedType || undefined,
          days: this.selectedDays === 0 ? undefined : this.selectedDays,
          page: this.page + 1,
          size: this.pageSize
        };
        
        const response = await getChickenInteractionHistory(params);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          const newRecords = response.data.data.records || [];
          this.records = [...this.records, ...newRecords];
          this.page++;
          this.hasMore = newRecords.length === this.pageSize;
        } else {
          console.error('获取更多记录失败:', response);
        }
      } catch (error) {
        console.error('获取更多记录时出错:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // 选择互动类型
    selectType(type) {
      this.selectedType = type;
      this.resetPagination();
      this.loadRecords();
      this.hidePicker();
    },
    
    // 选择时间范围
    selectDays(days) {
      this.selectedDays = days;
      this.resetPagination();
      this.loadRecords();
      this.hidePicker();
    },
    
    // 重置分页
    resetPagination() {
      this.page = 1;
      this.records = [];
    },
    
    // 显示选择器
    showPicker(type) {
      if (type === 'type') {
        this.showTypePicker = true;
      } else if (type === 'days') {
        this.showDaysPicker = true;
      }
    },
    
    // 隐藏选择器
    hidePicker() {
      this.showTypePicker = false;
      this.showDaysPicker = false;
    },
    
    // 获取互动类型图标
    getInteractionIcon(type) {
      const icons = {
        'feed': '🍗',
        'play': '🎮',
        'default': ' interaction'
      };
      
      return icons[type] || icons['default'];
    },
    
    // 获取互动类型文本
    getInteractionTypeText(type) {
      const types = {
        'feed': '喂食',
        'play': '玩耍'
      };
      
      return types[type] || type;
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // 今天，显示时:分
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (diffDays === 1) {
          return '昨天';
        } else if (diffDays < 7) {
          return `${diffDays}天前`;
        } else {
          // 显示年月日
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        }
      } catch (error) {
        console.error('日期格式化错误:', error);
        return dateStr;
      }
    },
    

  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
  color: #ffffff;
  position: relative;
  z-index: 10;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ffffff;
}

.back-icon {
  font-size: 40rpx;
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.placeholder {
  width: 80rpx;
  height: 80rpx;
}

/* 筛选选项 */
.filter-section {
  display: flex;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 30rpx;
  margin: 0 10rpx;
  background-color: #f8f8f8;
}

.filter-label {
  font-size: 26rpx;
  color: #666666;
  margin-right: 10rpx;
}

.filter-value {
  font-size: 26rpx;
  color: #333333;
  font-weight: bold;
}

.filter-arrow {
  font-size: 24rpx;
  color: #999999;
  margin-left: 10rpx;
}

/* 记录容器 */
.records-container {
  flex: 1;
  padding: 20rpx 30rpx;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* 记录项 */
.record-item {
  display: flex;
  align-items: flex-start;
  padding: 25rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  word-wrap: break-word;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.record-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
  min-width: 60rpx;
  text-align: center;
}

.record-content {
  flex: 1;
  min-width: 0; /* 防止flex项目溢出 */
  word-wrap: break-word;
  max-width: 100%;
  overflow: hidden;
}

.record-message {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 15rpx;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-all;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.record-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  min-width: 0; /* 防止flex项目溢出 */
  word-wrap: break-word;
  width: 100%;
  overflow: hidden;
}

.record-type {
  font-size: 24rpx;
  color: #666666;
  background-color: #f0f0f0;
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
}

.record-time {
  font-size: 24rpx;
  color: #999999;
}

.record-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #ff6b8b;
  background-color: #fff5f7;
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
}

/* 加载状态 */
.loading-status {
  text-align: center;
  padding: 40rpx 0;
}

.loading-text {
  font-size: 26rpx;
  color: #999999;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

/* 选择器弹窗 */
.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-content {
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.picker-cancel {
  font-size: 28rpx;
  color: #999999;
}

.picker-options {
  max-height: 400rpx;
  overflow-y: auto;
}

.picker-option {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-option:last-child {
  border-bottom: none;
}

.picker-option--selected {
  background-color: #f0f8ff;
  color: #1890ff;
}

.option-text {
  font-size: 28rpx;
  color: #333333;
}
</style>