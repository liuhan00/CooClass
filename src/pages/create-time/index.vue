<template>
  <view class="container" :class="currentType === 'countdown' ? 'countdown' : 'memorial'">
    <!-- 顶部导航栏 -->
    <view class="navbar">
    </view>
    
    <!-- 表单主体 -->
    <view class="form-container">
      <!-- 日子类型选择区 -->
      <text class="form-label">日子类型</text>
      <view class="type-selector">
        <view 
          class="type-option" 
          :class="{ 'type-option--active': currentType === 'countdown' }"
          @tap="switchType('countdown')"
        >
          倒数日
        </view>
        <view 
          class="type-option" 
          :class="{ 'type-option--active': currentType === 'memorial' }"
          @tap="switchType('memorial')"
        >
          纪念日
        </view>
      </view>
      
      <!-- 标题输入框 -->
      <text class="form-label">标题</text>
      <input 
        class="form-input" 
        placeholder="输入标题" 
        v-model="formData.title"
      />
      
      <!-- 日期选择框 -->
      <text class="form-label">请选择日期</text>
      <picker 
        mode="date" 
        :value="formData.date" 
        start="2020-01-01" 
        end="2030-12-31" 
        @change="onDateChange"
      >
        <view class="date-picker">
          <text class="date-text">{{ formatDateWithWeekday(formData.date) }}</text>
          <text class="calendar-icon">📅</text>
        </view>
      </picker>
      
      <!-- 主题颜色选项 -->
      <text class="form-label">主题颜色</text>
      <view class="color-options">
        <view 
          v-for="(color, index) in colorOptions" 
          :key="index"
          class="color-option"
          :class="{ 'color-option--selected': formData.themeColor === color.value }"
          :style="{ backgroundColor: color.value }"
          @tap="selectColor(color.value)"
        >
          <view 
            v-if="formData.themeColor === color.value"
            class="color-checkmark"
          ></view>
        </view>
      </view>
      
      <!-- 标签选择区 -->
      <text class="form-label">标签选择</text>
      <view class="tag-grid">
        <view 
          v-for="(icon, index) in iconOptions" 
          :key="index"
          class="tag-item"
          :class="{ 'tag-item--selected': formData.selectedIcons.includes(icon.id) }"
          @tap="toggleIconSelection(icon.id)"
        >
          <text class="tag-text">{{ icon.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="footer">
      <button class="create-button" @tap="createRecord">创建</button>
    </view>
  </view>
</template>

<script>
import { createSchedule } from '@/utils/request.js';

export default {
  data() {
    return {
      // 当前选中的类型
      currentType: 'countdown', // 'countdown' 或 'memorial'
      
      // 表单数据
      formData: {
        title: '',
        date: this.getCurrentDate(),
        themeColor: '#FF6B8B', // 默认颜色值
        themeColorNumber: 1, // 默认颜色数字
        selectedIcons: [] // 选中的图标ID数组
      },
      
      // 颜色选项
      colorOptions: [
        { name: '粉色', value: '#FF6B8B', number: 1 },
        { name: '青绿色', value: '#4ECDC4', number: 2 },
        { name: '黄色', value: '#FFD166', number: 3 },
        { name: '紫色', value: '#9B5DE5', number: 4 },
        { name: '蓝色', value: '#00BBF9', number: 5 }
      ],
      
      // 标签选项
      iconOptions: [
        { id: 'graduation', symbol: '🎓', name: '毕业' },
        { id: 'birthday', symbol: '🎂', name: '生日' },
        { id: 'wedding', symbol: '💒', name: '婚礼' },
        { id: 'travel', symbol: '✈️', name: '旅行' },
        { id: 'work', symbol: '💼', name: '入职' },
        { id: 'exam', symbol: '📚', name: '考试' },
        { id: 'anniversary', symbol: '❤️', name: '纪念日' },
        { id: 'newyear', symbol: '🎉', name: '新年' },
        { id: 'vacation', symbol: '🌴', name: '假期' },
        { id: 'project', symbol: '🚀', name: '项目' }
      ]
    }
  },
  
  methods: {
    // 获取当前日期
    getCurrentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 格式化日期并添加星期几
    formatDateWithWeekday(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const weekday = weekdays[date.getDay()]
      return `${dateString} ${weekday}`
    },
    // 切换日子类型
    switchType(type) {
      this.currentType = type
      // 根据类型切换默认主题色
      if (type === 'countdown') {
        this.formData.themeColor = '#FF6B8B'
        this.formData.themeColorNumber = 1 // 粉色
      } else {
        this.formData.themeColor = '#4ECDC4'
        this.formData.themeColorNumber = 2 // 青绿色
      }
    },
    
    // 日期选择回调
    onDateChange(e) {
      this.formData.date = e.detail.value
    },
    
    // 选择主题颜色
    selectColor(color) {
      this.formData.themeColor = color
      // 根据颜色值查找对应的数字
      const selectedColor = this.colorOptions.find(option => option.value === color)
      if (selectedColor) {
        this.formData.themeColorNumber = selectedColor.number
      }
    },
    
    // 切换图标选择状态
    toggleIconSelection(iconId) {
      const index = this.formData.selectedIcons.indexOf(iconId)
      if (index > -1) {
        // 已选中，取消选中
        this.formData.selectedIcons.splice(index, 1)
      } else {
        // 未选中，添加选中
        this.formData.selectedIcons.push(iconId)
      }
    },
    
    // 创建记录
    async createRecord() {
      // 表单校验
      if (!this.formData.title) {
        uni.showToast({
          title: '请输入标题',
          icon: 'none'
        })
        return
      }
      
      if (!this.formData.date) {
        uni.showToast({
          title: '请选择日期',
          icon: 'none'
        })
        return
      }
      
      // 准备发送给后端的数据
      const submitData = {
        title: this.formData.title,
        type: this.currentType === 'countdown' ? 'countdown' : 'anniversary', // API需要 'countdown' 或 'anniversary'
        targetDate: this.formData.date,
        themeColor: this.formData.themeColorNumber, // 发送颜色数字而非颜色值
        description: this.formData.selectedIcons.join(',') || this.formData.title // 使用选中的标签作为描述
      };
      
      try {
        uni.showLoading({
          title: '创建中...'
        });
        
        // 调用API创建日程
        const response = await createSchedule(submitData);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          uni.hideLoading();
          uni.showToast({
            title: response.data.message || '创建失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('创建日程失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
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
  background-color: #f5f5f5; /* 默认背景色 */
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}

/* 倒数日主题 */
.countdown .container {
  background-color: #FFF0F3; /* 粉色主题的浅色背景 */
}

/* 纪念日主题 */
.memorial .container {
  background-color: #E8F8F5; /* 青绿色主题的浅色背景 */
}

/* 顶部导航栏 */
.navbar {
  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e0e0e0;
  backdrop-filter: blur(10rpx); /* 添加模糊效果 */
}

.type-selector {
  display: inline-flex;
  background-color: rgba(240, 240, 240, 0.8); /* 半透明浅灰色背景 */
  border-radius: 8rpx;
  padding: 4rpx;
}

.type-option {
  background-color: transparent;
  color: #666666;
  padding: 8rpx 16rpx;
  border-radius: 4rpx;
  font-size: 28rpx;
  font-weight: normal;
  margin: 0;
}

.type-option--active {
  background-color: #FF6B8B;
  color: #ffffff;
}

.memorial .type-option--active {
  background-color: #4ECDC4;
}



/* 表单容器 */
.form-container {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  background-color: transparent; /* 透明背景，使用容器背景色 */
}

.form-label {
  font-size: 28rpx;
  font-weight: normal;
  color: #666666;
  margin-top: 32rpx;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  background-color: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
  border: 1rpx solid #DDDDDD;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  height: 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.form-input:focus {
  border-color: #FF6B8B;
}

.memorial .form-input:focus {
  border-color: #4ECDC4;
}

/* 日期选择器 */
.date-picker {
  background-color: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
  border: 1rpx solid #DDDDDD;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  height: 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-text {
  font-size: 28rpx;
  color: #333333;
}

.calendar-icon {
  font-size: 32rpx;
  color: #999999;
}

/* 颜色选项 */
.color-options {
  display: flex;
  margin-bottom: 20rpx;
}

.color-option {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 1rpx solid #DDDDDD;
  margin-right: 32rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option--selected {
  border: 2rpx solid #333333;
}

.color-checkmark {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: #ffffff;
}

/* 标签网格 */
.tag-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx 24rpx;
}

.tag-item {
  padding: 16rpx;
  background-color: #F0F0F0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.tag-item--selected {
  background-color: #FF6B8B;
  color: #ffffff;
}

.memorial .tag-item--selected {
  background-color: #4ECDC4;
}

.tag-text {
  font-size: 28rpx;
  color: #666666;
}

.tag-item--selected .tag-text {
  color: #ffffff;
}

/* 底部操作按钮 */
.footer {
  padding: 32rpx;
  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  border-top: 1rpx solid #e0e0e0;
  backdrop-filter: blur(10rpx); /* 添加模糊效果 */
}

.create-button {
  background-color: #333333; /* 深灰色按钮 */
  color: #ffffff;
  border-radius: 16rpx;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 500;
  width: 100%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.create-button:active {
  background-color: #000000;
}
</style>