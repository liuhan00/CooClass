<template>
  <view class="profile-edit-page">
    <!-- 页面顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">编辑资料</text>
      <view class="nav-right">
        <text class="save-btn" @tap="saveProfile">保存</text>
      </view>
    </view>

    <!-- 用户资料编辑区域 -->
    <scroll-view class="edit-container" scroll-y="true">
      <!-- 头像编辑 -->
      <view class="avatar-section">
        <view class="avatar-container" @tap="chooseAvatar">
          <image class="avatar-preview" :src="userInfo.avatar" mode="aspectFill"></image>
          <view class="camera-icon">📷</view>
        </view>
      </view>

      <!-- 昵称编辑 -->
      <view class="input-section">
        <view class="input-label">昵称</view>
        <input class="input-field" v-model="userInfo.nickname" placeholder="请输入昵称" maxlength="20" />
      </view>

      <!-- 简介编辑 -->
      <view class="input-section">
        <view class="input-label">简介</view>
        <textarea 
          class="textarea-field" 
          v-model="userInfo.bio" 
          placeholder="介绍一下自己吧" 
          maxlength="100"
          :auto-height="true"
        ></textarea>
      </view>

      <!-- 生日编辑 -->
      <view class="input-section">
        <view class="input-label">生日</view>
        <picker class="picker-field" mode="date" :value="userInfo.birthday" @change="onBirthdayChange">
          <view class="picker-content">
            <text v-if="userInfo.birthday">{{ userInfo.birthday }}</text>
            <text v-else class="placeholder-text">请选择生日</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        avatar: '/static/logo.png', // 默认头像
        nickname: '用户名',
        bio: '这是一个个人简介',
        birthday: ''
      },
      originalUserInfo: {} // 用于比较是否有修改
    }
  },
  
  onLoad() {
    // 页面加载时初始化用户数据
    this.initUserData();
  },
  
  methods: {
    // 初始化用户数据
    initUserData() {
      // 这里可以从本地存储或API获取用户数据
      // 暂时使用默认值
      this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
    },
    
    // 返回上一页
    goBack() {
      // 检查是否有修改
      const hasChanges = this.checkForChanges();
      if (hasChanges) {
        uni.showModal({
          title: '提示',
          content: '资料已修改，确定不保存吗？',
          confirmText: '不保存',
          cancelText: '继续编辑',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } else {
        uni.navigateBack();
      }
    },
    
    // 检查是否有修改
    checkForChanges() {
      return this.userInfo.avatar !== this.originalUserInfo.avatar ||
             this.userInfo.nickname !== this.originalUserInfo.nickname ||
             this.userInfo.bio !== this.originalUserInfo.bio ||
             this.userInfo.birthday !== this.originalUserInfo.birthday;
    },
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0]
        },
        fail: (err) => {
          console.log('选择头像失败', err)
        }
      })
    },
    
    // 生日选择器变化
    onBirthdayChange(e) {
      this.userInfo.birthday = e.detail.value
    },
    
    // 保存用户资料
    saveProfile() {
      if (!this.userInfo.nickname.trim()) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '保存中...'
      })
      
      // 这里可以调用API保存用户资料
      // api.updateUserProfile(this.userInfo)
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '资料保存成功',
          icon: 'success'
        })
        
        // 更新原始数据
        this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }, 1000)
    }
  }
}
</script>

<style>
page {
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
}

.profile-edit-page {
  flex: 1;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  min-height: 100vh;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333333;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.nav-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.save-btn {
  font-size: 28rpx;
  color: #ff6b35;
  font-weight: bold;
}

/* 编辑容器 */
.edit-container {
  flex: 1;
  padding: 30rpx;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 20rpx;
}

/* 头像区域 */
.avatar-section {
  padding: 100rpx 30rpx 120rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-label {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 40rpx;
  align-self: flex-start;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-preview {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
}

.camera-icon {
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
  width: 50rpx;
  height: 50rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

/* 输入区域 */
.input-section {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.input-label {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 20rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.textarea-field {
  width: 100%;
  min-height: 120rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #fafafa;
}

.picker-field {
  width: 100%;
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.placeholder-text {
  color: #999999;
}

.picker-arrow {
  color: #cccccc;
  font-size: 32rpx;
}
</style>