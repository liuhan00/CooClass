<template>
  <view class="container">
    <!-- Tab导航 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'profile' }"
        @tap="switchInternalTab('profile')"
      >
        <text class="tab-text">小鸡档案</text>
      </view>
      <view 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'schedule' }"
        @tap="switchInternalTab('schedule')"
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
              <text class="character-name" @tap="editChickenName">{{ chickenInfo.nickname }}</text>
              <text class="character-level">Lv.{{ chickenInfo.level }}</text>
            </view>
          </view>
          <view class="progress-container">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: (chickenInfo.expCurrent / chickenInfo.expTotal * 100) + '%' }"></view>
            </view>
            <text class="progress-text">{{ chickenInfo.expCurrent }}/{{ chickenInfo.expTotal }}</text>
          </view>
          <view class="character-stats">
            <view class="stat-item">
              <text class="stat-label">年龄</text>
              <text class="stat-value">{{ chickenInfo.days }}天</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">体重</text>
              <text class="stat-value">{{ chickenInfo.weight }} kg</text>
            </view>
          </view>
        </view>
        
        <view class="profile-section chat-section">
          <view class="section-header">
            <text class="section-title">与小鸡聊天</text>
          </view>
          <view class="chat-container">
            <scroll-view 
              class="chat-messages" 
              id="chatMessages" 
              scroll-y="true" 
              :scroll-top="chatScrollTop"
              :scroll-with-animation="true"
            >
              <view class="message-item" v-for="(msg, index) in chatMessages" :key="index" :class="{ 'user-message': msg.sender === 'user', 'chicken-message': msg.sender === 'chicken' }">
                <view class="message-content">
                  <text class="message-text">{{ msg.text }}</text>
                  <text class="message-time">{{ msg.time }}</text>
                </view>
              </view>
            </scroll-view>
            <view class="chat-input-area">
              <input 
                class="chat-input" 
                v-model="currentMessage" 
                placeholder="对小鸡说点什么吧~" 
                @confirm="sendChatMessage"
              />
              <button class="send-button" @tap="sendChatMessage">发送</button>
            </view>
          </view>
        </view>
        
        <view class="profile-section">
          <view class="section-header">
            <text class="section-title">累计专注时长</text>
          </view>
          <view class="focus-stats">
            <view class="stat-item">
              <text class="stat-value">{{ chickenInfo.focusHours || 120 }}</text>
              <text class="stat-label">小时</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ chickenInfo.focusDays || 30 }}</text>
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
    
    <!-- 名称编辑弹窗 -->
    <view class="name-edit-modal" v-if="showNameEditModal">
      <view class="name-edit-modal-overlay" @tap="closeNameEditModal"></view>
      <view class="name-edit-modal-content">
        <text class="name-edit-modal-title">修改小鸡名称</text>
        <input 
          class="name-edit-input" 
          v-model="newNickname" 
          placeholder="请输入新的小鸡名称" 
          @confirm="confirmNameEdit"
          maxlength="20"
        />
        <view class="name-edit-modal-buttons">
          <button class="modal-button cancel-button" @tap="closeNameEditModal">取消</button>
          <button class="modal-button confirm-button" @tap="confirmNameEdit">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'profile', // 默认激活小鸡档案tab
      chickenInfo: {
        nickname: '小咕',
        level: 13,
        expCurrent: 715,
        expTotal: 1000,
        days: 24,
        weight: 1.0,
        focusHours: 120,
        focusDays: 30
      },
      showNameEditModal: false,
      newNickname: '',
      // 聊天相关数据
      chatMessages: [],
      currentMessage: '',
      chatScrollTop: 0
    }
  },
  
  onLoad() {
    // 初始化聊天消息
    this.chatMessages = [
      {
        text: '你好！我是小咕，很高兴和你聊天！',
        sender: 'chicken',
        time: this.formatTime(new Date())
      }
    ];
  },
  methods: {
    // 切换内部tab
    switchInternalTab(tab) {
      this.activeTab = tab
    },
    
    // 跳转到创建页面
    goToCreatePage() {
      // 这里可以传递参数区分默认选中状态
      uni.navigateTo({
        url: '/pages/create-time/index' // 假设创建页面路径
      })
    },
    
    // 编辑小鸡名称
    editChickenName() {
      this.showNameEditModal = true;
      this.newNickname = this.chickenInfo.nickname;
    },
    
    // 关闭名称编辑弹窗
    closeNameEditModal() {
      this.showNameEditModal = false;
    },
    
    // 确认修改名称
    confirmNameEdit() {
      if (this.newNickname.trim() !== '') {
        this.chickenInfo.nickname = this.newNickname.trim();
        // 添加昵称修改通知
        this.chatMessages.push({
          text: '昵称已更新为：' + this.chickenInfo.nickname,
          sender: 'chicken',
          time: this.formatTime(new Date())
        });
        uni.showToast({
          title: '名称修改成功',
          icon: 'success'
        });
        this.showNameEditModal = false;
      } else {
        uni.showToast({
          title: '名称不能为空',
          icon: 'none'
        });
      }
    },
    
    // 格式化时间
    formatTime(date) {
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${hour}:${minute}`;
    },
    
    // 发送聊天消息
    sendChatMessage() {
      if (!this.currentMessage.trim()) {
        return;
      }
      
      // 添加用户消息
      const userMessage = {
        text: this.currentMessage,
        sender: 'user',
        time: this.formatTime(new Date())
      };
      this.chatMessages.push(userMessage);
      
      // 清空输入框
      const message = this.currentMessage;
      this.currentMessage = '';
      
      // 模拟小鸡回复
      setTimeout(() => {
        const responses = [
          '咕咕咕~ 你说得对！',
          '真有趣，能再告诉我多一点吗？',
          '我最喜欢听你说话了！',
          '专注学习真是一件快乐的事情呢！',
          '今天你学到了什么新知识吗？',
          '我们一起加油吧！',
          '你真是个有趣的人呢！',
          '我陪着你，一起成长吧！',
          '你今天的专注时长很棒哦！',
          '继续保持专注，你一定可以的！'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const chickenMessage = {
          text: randomResponse,
          sender: 'chicken',
          time: this.formatTime(new Date())
        };
        this.chatMessages.push(chickenMessage);
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 1000);
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        // 更新scrollTop以滚动到底部
        const timestamp = new Date().getTime();
        this.chatScrollTop = timestamp; // 使用时间戳作为唯一值来触发滚动
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
  background-color: rgba(255, 107, 139, 0.7);
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

/* 聊天界面样式 */
.chat-section {
  padding: 30rpx;
  min-height: 400rpx;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 350rpx;
}

.chat-messages {
  flex: 1;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
}

.message-item {
  margin-bottom: 20rpx;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
}

.user-message .message-content {
  background-color: #4CAF50;
  color: white;
  border-radius: 20rpx 8rpx 20rpx 20rpx;
  padding: 15rpx;
}

.chicken-message {
  align-self: flex-start;
}

.chicken-message .message-content {
  background-color: #f0f0f0;
  color: #333333;
  border-radius: 8rpx 20rpx 20rpx 20rpx;
  padding: 15rpx;
}

.message-text {
  display: block;
  margin-bottom: 5rpx;
}

.message-time {
  font-size: 20rpx;
  color: #999;
  text-align: right;
}

.chat-input-area {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.chat-input {
  flex: 1;
  height: 60rpx;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.send-button {
  width: 80rpx;
  height: 60rpx;
  background-color: #333;
  color: white;
  border-radius: 30rpx;
  font-size: 24rpx;
  line-height: 60rpx;
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

/* 名称编辑弹窗样式 */
.name-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.name-edit-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.name-edit-modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.name-edit-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 30rpx;
  width: 100%;
}

.name-edit-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-bottom: 40rpx;
  box-sizing: border-box;
}

.name-edit-modal-buttons {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.modal-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  margin: 0 10rpx;
  color: #ffffff;
}

.cancel-button {
  background-color: #cccccc; /* 灰色按钮 */
}

.cancel-button:active {
  background-color: #bbbbbb;
}

.confirm-button {
  background-color: #000000; /* 黑色按钮 */
}

.confirm-button:active {
  background-color: #333333;
}
</style>