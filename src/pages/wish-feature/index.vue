<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">‹</text>
        <text class="nav-title">意见与反馈</text>
      </view>
    </view>

    <!-- 主体内容 -->
    <view class="content">
      <!-- 反馈类型选择 -->
      <view class="input-group">
        <view class="input-item" @tap="showFeedbackTypeSelector">
          <text class="input-label">选择反馈类型</text>
          <view class="input-right">
            <text class="input-value">{{ feedbackTypeText }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 问题和意见输入框 -->
      <view class="input-group">
        <text class="input-label">问题和意见</text>
        <textarea 
          class="textarea" 
          placeholder="请描述您的建议或问题,以便我们尽快为您处理(必填)" 
          v-model="feedbackContent"
          @input="onFeedbackInput"
          :maxlength="100"
        ></textarea>
        <view class="char-count">
          <text>{{ feedbackContent.length }}/100</text>
        </view>
      </view>

      <!-- 联系方式输入框 -->
      <view class="input-group">
        <text class="input-label">联系方式(选填)</text>
        <input 
          class="input" 
          placeholder="微信/QQ/手机号/邮件" 
          v-model="contactInfo"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button 
        class="submit-btn" 
        :class="{ 'submit-btn--disabled': !isSubmitEnabled }"
        @tap="submitFeedback"
        :disabled="!isSubmitEnabled"
      >
        <text class="submit-text">提交反馈</text>
      </button>
    </view>

    <!-- 反馈类型选择弹窗 -->
    <view class="modal" v-if="showTypeSelector">
      <view class="modal-overlay" @tap="hideFeedbackTypeSelector"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">选择反馈类型</text>
          <view class="modal-close" @tap="hideFeedbackTypeSelector">×</view>
        </view>
        <view class="modal-body">
          <view 
            class="option-item" 
            v-for="(item, index) in feedbackTypes" 
            :key="index"
            @tap="selectFeedbackType(index)"
          >
            <text class="option-text">{{ item.text }}</text>
            <text v-if="selectedTypeIndex === index" class="option-selected">✓</text>
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
      feedbackTypeText: '功能建议',
      selectedTypeIndex: 0,
      feedbackTypes: [
        { value: 'feature', text: '功能建议' },
        { value: 'bug', text: '程序错误' },
        { value: 'content', text: '内容问题' },
        { value: 'other', text: '其他' }
      ],
      feedbackContent: '',
      contactInfo: '',
      showTypeSelector: false
    }
  },
  
  computed: {
    isSubmitEnabled() {
      return this.feedbackContent.trim().length > 0;
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    showFeedbackTypeSelector() {
      this.showTypeSelector = true;
    },
    
    hideFeedbackTypeSelector() {
      this.showTypeSelector = false;
    },
    
    selectFeedbackType(index) {
      this.selectedTypeIndex = index;
      this.feedbackTypeText = this.feedbackTypes[index].text;
      this.hideFeedbackTypeSelector();
    },
    
    onFeedbackInput(e) {
      this.feedbackContent = e.detail.value;
    },
    
    submitFeedback() {
      if (!this.isSubmitEnabled) {
        uni.showToast({
          title: '请填写反馈内容',
          icon: 'none'
        });
        return;
      }
      
      // 显示提交中提示
      uni.showLoading({
        title: '提交中...'
      });
      
      // 模拟提交反馈
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '反馈提交成功',
          icon: 'success'
        });
        
        // 清空表单
        this.feedbackContent = '';
        this.contactInfo = '';
        this.feedbackTypeText = '功能建议';
        this.selectedTypeIndex = 0;
      }, 1500);
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding-top: var(--status-bar-height);
  position: relative;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-icon {
  font-size: 36rpx;
  color: #000000;
  margin-right: 10rpx;
}

.nav-title {
  font-size: 32rpx;
  color: #000000;
  font-weight: bold;
}

/* 主体内容 */
.content {
  padding: 30rpx;
  box-sizing: border-box;
  min-height: auto;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.input-label {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
}

.input-right {
  display: flex;
  align-items: center;
}

.input-value {
  font-size: 28rpx;
  color: #999999;
  margin-right: 10rpx;
}

.arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

.textarea {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
  margin-top: 10rpx;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999999;
  margin-top: 10rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
  margin-top: 10rpx;
}

/* 提交按钮 */
.submit-section {
  padding: 30rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #000000;
  border-radius: 40rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn--disabled {
  background-color: #CCCCCC;
}

.submit-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: bold;
}

/* 反馈类型选择弹窗 */
.modal {
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

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  width: 80%;
  max-width: 600rpx;
  max-height: 70vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
}

.modal-close {
  font-size: 40rpx;
  color: #999999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  border-bottom: 1rpx solid #f8f8f8;
}

.option-item:last-child {
  border-bottom: none;
}

.option-text {
  font-size: 28rpx;
  color: #333333;
}

.option-selected {
  font-size: 32rpx;
  color: #000000;
  font-weight: bold;
}
</style>