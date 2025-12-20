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
      <view class="icon-grid">
        <view 
          v-for="(icon, index) in iconOptions" 
          :key="index"
          class="icon-item"
          :class="{ 'icon-item--selected': formData.selectedIcons.includes(icon.id) }"
          @tap="toggleIconSelection(icon.id)"
        >
          <view class="icon-background">
            <text class="icon-symbol">{{ icon.symbol }}</text>
          </view>
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
export default {
  data() {
    return {
      // 当前选中的类型
      currentType: 'countdown', // 'countdown' 或 'memorial'
      
      // 表单数据
      formData: {
        title: '',
        date: this.getCurrentDate(),
        themeColor: '#FF6B8B', // 默认粉色
        selectedIcons: [] // 选中的图标ID数组
      },
      
      // 颜色选项
      colorOptions: [
        { name: '粉色', value: '#FF6B8B' },
        { name: '青绿色', value: '#4ECDC4' },
        { name: '黄色', value: '#FFD166' },
        { name: '紫色', value: '#9B5DE5' },
        { name: '蓝色', value: '#00BBF9' }
      ],
      
      // 图标选项
      iconOptions: [
        { id: 'graduation', symbol: '🎓', name: '毕业帽' },
        { id: 'basketball', symbol: '🏀', name: '篮球' },
        { id: 'notebook', symbol: '📓', name: '笔记本' },
        { id: 'cake', symbol: '🎂', name: '蛋糕' },
        { id: 'heart', symbol: '❤️', name: '爱心' },
        { id: 'suitcase', symbol: '🧳', name: '旅行箱' },
        { id: 'book', symbol: '📚', name: '书本' },
        { id: 'music', symbol: '🎵', name: '音乐符号' },
        { id: 'star', symbol: '⭐', name: '星星' },
        { id: 'camera', symbol: '📷', name: '相机' }
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
      } else {
        this.formData.themeColor = '#4ECDC4'
      }
    },
    
    // 日期选择回调
    onDateChange(e) {
      this.formData.date = e.detail.value
    },
    
    // 选择主题颜色
    selectColor(color) {
      this.formData.themeColor = color
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
    createRecord() {
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
      
      // 提交表单数据
      console.log('提交表单数据:', this.formData)
      
      // 这里应该调用API保存数据
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
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

/* 图标网格 */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24rpx 24rpx;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-background {
  width: 64rpx;
  height: 64rpx;
  background-color: #F0F0F0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.icon-item--selected .icon-background {
  background-color: #FF6B8B;
}

.memorial .icon-item--selected .icon-background {
  background-color: #4ECDC4;
}

.icon-symbol {
  font-size: 32rpx;
  color: #666666;
}

.icon-item--selected .icon-symbol {
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