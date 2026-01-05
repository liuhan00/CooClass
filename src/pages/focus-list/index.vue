<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-title">
      <text>专注记录</text>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-row">
        <picker mode="date" :value="startDate" @change="onStartDateChange">
          <view class="picker-item">
            <text>开始日期: {{ startDate || '选择日期' }}</text>
          </view>
        </picker>
        <picker mode="date" :value="endDate" @change="onEndDateChange">
          <view class="picker-item">
            <text>结束日期: {{ endDate || '选择日期' }}</text>
          </view>
        </picker>
      </view>
      
      <view class="filter-row">
        <picker :value="selectedSceneIndex" :range="scenes" @change="onSceneChange">
          <view class="picker-item">
            <text>场景: {{ selectedSceneIndex >= 0 ? scenes[selectedSceneIndex] : '全部' }}</text>
          </view>
        </picker>
      </view>
      
      <button class="filter-btn" @tap="fetchFocusList">筛选</button>
    </view>
    
    <!-- 专注记录列表 -->
    <scroll-view class="focus-list" scroll-y="true">
      <view class="focus-item" v-for="record in focusRecords" :key="record.focusId">
        <view class="record-header">
          <text class="scene">{{ record.scene }}</text>
          <text class="date">{{ formatDateTime(record.startTime) }}</text>
        </view>
        <view class="record-content">
          <view class="duration">
            <text class="label">时长: </text>
            <text class="value">{{ formatDuration(record.actualDuration || record.duration) }}</text>
          </view>
          <view class="time-range">
            <text class="label">时间: </text>
            <text class="value">{{ formatTimeRange(record.startTime, record.endTime) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <button @tap="loadMore">加载更多</button>
      </view>
      
      <view class="no-more" v-else-if="focusRecords.length > 0">
        <text>没有更多记录</text>
      </view>
      
      <view class="empty-state" v-if="focusRecords.length === 0 && !loading">
        <text>暂无专注记录</text>
      </view>
    </scroll-view>
    
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getFocusList, getFocusTags } from '@/utils/request.js'

export default {
  data() {
    return {
      // 筛选条件
      startDate: '',
      endDate: '',
      selectedSceneIndex: -1,
      scenes: ['学习', '工作', '阅读', '写作', '编程'],
      
      // 专注记录
      focusRecords: [],
      loading: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10,
      
      // 标签映射
      tagMap: {}
    }
  },
  
  onLoad() {
    // 页面加载时获取专注记录
    this.fetchFocusList();
  },
  
  methods: {
    // 日期选择器变化
    onStartDateChange(e) {
      this.startDate = e.detail.value;
    },
    
    onEndDateChange(e) {
      this.endDate = e.detail.value;
    },
    
    onSceneChange(e) {
      this.selectedSceneIndex = parseInt(e.detail.value);
    },
    
    // 获取标签映射
    async loadTagMap() {
      try {
        const response = await getFocusTags();
        if (response.statusCode === 200 && response.data.code === 200) {
          const tags = response.data.data || [];
          // 创建tagId到标签名称的映射
          this.tagMap = tags.reduce((map, tag) => {
            map[tag.tagId] = tag.tagName || tag.name;
            return map;
          }, {});
        }
      } catch (error) {
        console.error('获取标签列表失败:', error);
      }
    },
    
    // 获取专注记录列表
    async fetchFocusList() {
      this.loading = true;
      
      try {
        // 先加载标签映射
        await this.loadTagMap();
        
        const params = {
          page: 1,
          size: this.pageSize,
          scene: this.selectedSceneIndex >= 0 ? this.scenes[this.selectedSceneIndex] : undefined,
          startDate: this.startDate || undefined,
          endDate: this.endDate || undefined
        };
        
        const response = await getFocusList(params);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 根据API文档，response.data.data 应该是一个包含 list、total、page、size 的分页对象
          const responseData = response.data.data || {};
          
          // 转换后端返回的数据格式为页面需要的格式，处理tagId到场景名称的映射
          this.focusRecords = (responseData.list || []).map(record => {
            // 优先使用scene字段，如果没有则根据tagId查找标签名称，如果都没有则显示'其他'
            let sceneName = record.scene;
            if (!sceneName && record.tagId) {
              sceneName = this.tagMap[record.tagId] || '其他';
            } else if (!sceneName) {
              sceneName = '其他';
            }
            
            return {
              focusId: record.focusId,
              duration: record.duration || 0, // 设定专注时长（分钟）
              actualDuration: record.actualDuration || 0, // 实际专注时长（分钟）
              scene: sceneName, // 专注场景
              startTime: record.startTime,
              endTime: record.endTime,
              coinsEarned: record.coinsEarned || 0, // 获得谷物币
              expEarned: record.expEarned || 0, // 获得经验值
              isCompleted: record.isCompleted || false
            };
          });
          
          this.currentPage = 1;
          this.hasMore = this.focusRecords.length === this.pageSize;
        } else {
          uni.showToast({
            title: response.data.message || '获取记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取专注记录失败:', error);
        uni.showToast({
          title: '网络请求失败',
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
      this.currentPage++;
      
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          scene: this.selectedSceneIndex >= 0 ? this.scenes[this.selectedSceneIndex] : undefined,
          startDate: this.startDate || undefined,
          endDate: this.endDate || undefined
        };
        
        const response = await getFocusList(params);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 根据API文档，response.data.data 应该是一个包含 list、total、page、size 的分页对象
          const responseData = response.data.data || {};
          
          // 转换后端返回的数据格式为页面需要的格式，处理tagId到场景名称的映射
          const newRecords = (responseData.list || []).map(record => {
            // 优先使用scene字段，如果没有则根据tagId查找标签名称，如果都没有则显示'其他'
            let sceneName = record.scene;
            if (!sceneName && record.tagId) {
              sceneName = this.tagMap[record.tagId] || '其他';
            } else if (!sceneName) {
              sceneName = '其他';
            }
            
            return {
              focusId: record.focusId,
              duration: record.duration || 0, // 设定专注时长（分钟）
              actualDuration: record.actualDuration || 0, // 实际专注时长（分钟）
              scene: sceneName, // 专注场景
              startTime: record.startTime,
              endTime: record.endTime,
              coinsEarned: record.coinsEarned || 0, // 获得谷物币
              expEarned: record.expEarned || 0, // 获得经验值
              isCompleted: record.isCompleted || false
            };
          });
          
          this.focusRecords = [...this.focusRecords, ...newRecords];
          this.hasMore = newRecords.length === this.pageSize;
        } else {
          this.currentPage--;
          uni.showToast({
            title: response.data.message || '获取记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取专注记录失败:', error);
        this.currentPage--;
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 格式化时间显示
    formatDateTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}.${date.getDate()} ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]}`;
    },
    
    formatTimeRange(start, end) {
      if (!start || !end) return '';
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const endStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      return `${startStr} - ${endStr}`;
    },
    
    formatDuration(minutes) {
      if (!minutes) return '0分钟';
      const totalMinutes = Math.floor(minutes);
      const hours = Math.floor(totalMinutes / 60);
      if (hours > 0) {
        return `${hours}小时${totalMinutes % 60}分钟`;
      }
      return `${totalMinutes}分钟`;
    }
  }
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  min-height: 100vh;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.filter-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.picker-item {
  padding: 20rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.picker-item:last-child {
  margin-bottom: 0;
}

.filter-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-top: 20rpx;
}

.focus-list {
  height: calc(100vh - 400rpx);
}

.focus-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.scene {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.date {
  font-size: 24rpx;
  color: #999;
}

.record-content {
  display: flex;
  flex-direction: column;
}

.duration, .time-range {
  display: flex;
  margin-bottom: 10rpx;
}

.duration:last-child, .time-range:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  margin-right: 10rpx;
}

.value {
  color: #333;
  font-weight: bold;
}

.load-more, .no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.loading {
  text-align: center;
  padding: 30rpx;
  color: #999;
}
</style>