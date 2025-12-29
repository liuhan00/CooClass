<template>
  <view class="container">
    <!-- 用户信息区 (Header) -->
    <view class="user-header">
      <view class="user-avatar" @tap="changeAvatar">
        <image class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo.username }}</text>
        <text class="user-id">ID: {{ userInfo.userId }}</text>
      </view>
      <view class="edit-icon" @tap="editProfile">
        <text>✏️</text>
      </view>
    </view>

    <!-- 账号设置区块 -->
    <view class="settings-section">
      <text class="section-title">账号设置</text>
      <view class="setting-item" @tap="viewFocusRecords">
        <view class="setting-content">
          <text class="setting-title">专注记录</text>
          <text class="setting-desc">查看您的专注历史记录</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="setting-item" @tap="showLogoutModal = true">
        <view class="setting-content">
          <text class="setting-title">注销账号</text>
          <text class="setting-desc">会清空您所有的记录, 谨慎处理哦</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="setting-item" @tap="handleSettingTap('退出登录')">
        <view class="setting-content">
          <text class="setting-title">退出登录</text>
          <text class="setting-desc">退出APP, 依然会保留数据</text>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 支持我们区块 -->
    <view class="support-section">
      <text class="section-title">支持我们</text>
      <view class="support-item" @tap="handleSupportTap('加群交群')">
        <view class="support-icon">🍊</view>
        <view class="support-content">
          <text class="support-title">加群交群</text>
          <text class="support-desc">一起开始自律吧</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="support-item" @tap="handleSupportTap('给我们评分')">
        <view class="support-icon">❤️</view>
        <view class="support-content">
          <text class="support-title">给我们评分</text>
          <text class="support-desc">小小的鼓励一下我们</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="support-item" @tap="handleSupportTap('新功能许愿')">
        <view class="support-icon">✨</view>
        <view class="support-content">
          <text class="support-title">新功能许愿</text>
          <text class="support-desc">任何愿望都可以告诉我们, 说不定就会实现呢</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="support-item" @tap="handleSupportTap('和朋友分享')">
        <view class="support-icon">🍎</view>
        <view class="support-content">
          <text class="support-title">和朋友分享</text>
          <text class="support-desc">坚持的道路上多一个人一起努力</text>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    
    <!-- 注销账号确认弹窗 -->
    <view class="logout-modal" v-if="showLogoutModal">
      <view class="logout-modal-overlay" @tap="closeLogoutModal"></view>
      <view class="logout-modal-content">
        <text class="logout-modal-title">注销账号</text>
        <text class="logout-modal-content-text">注销账号会清空您的所有记录，并且不可恢复，谨慎处理哦</text>
        <view class="logout-modal-buttons">
          <button class="modal-button cancel-button" @tap="closeLogoutModal">取消</button>
          <button class="modal-button confirm-button" @tap="confirmLogout">注销</button>
        </view>
      </view>
    </view>
    

  </view>
</template>

<script>
import request from '@/utils/request.js'

export default {
  data() {
    return {
      // 用户信息数据
      userInfo: {
        username: '用户名',
        userId: '123456789',
        avatar: '/static/logo.png'
      },
      showLogoutModal: false
    }
  },
  
  onLoad() {
    // 页面加载时获取用户真实信息
    this.fetchUserInfo();
  },
  
  onShow() {
    // 页面显示时刷新用户信息，确保显示最新数据
    this.fetchUserInfo();
  },
  
  methods: {
    // 查看专注记录
    viewFocusRecords() {
      uni.navigateTo({
        url: '/pages/focus-list/index'
      });
    },
    
    // 添加新的方法来处理注销弹窗
    closeLogoutModal() {
      this.showLogoutModal = false;
    },
    
    async confirmLogout() {
      try {
        uni.showLoading({
          title: '注销中...'
        });
        
        // 调用注销账号API
        const response = await request.deleteAccount();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          uni.showToast({
            title: '账号已注销',
            icon: 'success'
          });
          
          // 清除本地存储的用户信息和token
          uni.removeStorageSync('userInfo');
          uni.removeStorageSync('token');
          
          // 关闭弹窗
          this.showLogoutModal = false;
          
          // 跳转到登录页面
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/login/index'
            });
          }, 1500);
        } else {
          uni.showToast({
            title: response.data.message || '注销失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('注销账号失败:', error);
        uni.showToast({
          title: '注销失败，请重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        // 检查本地存储的token
        const token = uni.getStorageSync('token');
        const userInfo = uni.getStorageSync('userInfo');
        
        console.log('本地存储的用户信息:', {
          hasToken: !!token,
          token: token,
          userInfo: userInfo
        });
        
        uni.showLoading({
          title: '加载中...'
        });
        
        // 从API获取用户信息
        const response = await request.getUserInfo();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 更新用户信息
          const userData = response.data.data;
          this.userInfo = {
            username: userData.nickname || userData.username || this.userInfo.username,
            userId: userData.userId || userData.id || this.userInfo.userId,
            avatar: userData.avatar || this.userInfo.avatar,
            bio: userData.bio || '',
            birthday: userData.birthday || ''
          };
        } else {
          console.error('获取用户信息失败:', response.data);
          uni.showToast({
            title: response.data.message || '获取用户信息失败',
            icon: 'none'
          });
          
          // 如果是用户ID错误，可能需要重新登录
          if (response.data.message && response.data.message.includes('用户ID不能为空')) {
            uni.showModal({
              title: '提示',
              content: '用户信息异常，请重新登录',
              confirmText: '去登录',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  uni.navigateTo({
                    url: '/pages/login/index'
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        
        // 检查是否是401未授权错误
        if (error.statusCode === 401 || error.errMsg) {
          // 用户未登录或token过期，跳转到登录页面
          uni.showModal({
            title: '提示',
            content: '您还未登录或登录已过期，请先登录',
            confirmText: '去登录',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              }
            }
          });
        } else {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      } finally {
        uni.hideLoading();
      }
    },
    
    // 修改头像
    changeAvatar() {
      uni.navigateTo({
        url: '/pages/profile-edit/index'
      });
    },
    
    // 编辑资料
    editProfile() {
      uni.navigateTo({
        url: '/pages/profile-edit/index'
      });
    },
    
    handleSettingTap(setting) {
      console.log('点击账号设置项:', setting);
      
      switch(setting) {
        case '注销账号':
          // 这个case现在不会被执行，因为注销账号点击事件直接设置showLogoutModal = true
          break;
        case '退出登录':
          uni.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            success: (res) => {
              if (res.confirm) {
                uni.showToast({
                  title: '已退出登录',
                  icon: 'success'
                });
                // 这里可以调用退出登录的API
                // api.logout();
                // 跳转到登录页
                setTimeout(() => {
                  uni.redirectTo({
                    url: '/pages/login/index'
                  });
                }, 1000);
              }
            }
          });
          break;
        default:
          uni.showToast({
            title: `点击了${setting}`,
            icon: 'none'
          });
      }
    },
    
    handleSupportTap(support) {
      console.log('点击支持我们项:', support);
      
      switch(support) {
        case '加群交群':
          uni.showToast({
            title: '功能开发中',
            icon: 'none'
          });
          // 这里可以跳转到加群页面或者复制群号
          break;
        case '给我们评分':
          uni.showToast({
            title: '感谢您的支持！',
            icon: 'none'
          });
          // 这里可以跳转到应用商店评分页面
          break;
        case '新功能许愿':
          uni.navigateTo({
            url: '/pages/wish-feature/index'
          });
          break;
        case '和朋友分享':
          uni.showToast({
            title: '分享功能开发中',
            icon: 'none'
          });
          // 这里可以调用分享功能
          break;
        default:
          uni.showToast({
            title: `点击了${support}`,
            icon: 'none'
          });
      }
    },
    
  }
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  min-height: 100vh;
}

/* 用户信息区 */
.user-header {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: normal;
}

.edit-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

/* 区块样式 */
.settings-section,
.support-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.settings-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: normal;
  margin-bottom: 30rpx;
  display: block;
}

/* 设置项样式 */
.setting-item,
.support-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child,
.support-item:last-child {
  border-bottom: none;
}

.setting-content,
.support-content {
  flex: 1;
}

.setting-title,
.support-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.setting-desc,
.support-desc {
  font-size: 26rpx;
  color: #999999;
  font-weight: normal;
}

.arrow {
  color: #cccccc;
  font-size: 32rpx;
  margin-left: 20rpx;
}

/* 支持我们项特殊样式 */
.support-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  width: 60rpx;
}

/* 特殊处理注销账号项 */
.setting-item:first-child .setting-title {
  color: #ff4757;
}

/* 注销账号弹窗样式 */
.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.logout-modal-content {
  position: relative;
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logout-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 30rpx;
  width: 100%;
}

.logout-modal-content-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 50rpx;
  line-height: 1.5;
  width: 100%;
}

.logout-modal-buttons {
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

.setting-item:focus-within {
  background-color: #f5f5f5;
}
</style>