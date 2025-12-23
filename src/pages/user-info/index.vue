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

    <!-- 更多区块 -->
    <view class="more-section">
      <text class="section-title">更多</text>
      <view class="more-item" @tap="handleMoreTap('联系我们')">
        <view class="more-content">
          <text class="more-title">联系我们</text>
          <text class="more-desc">您可以通过客服邮箱联系我们</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="more-item" @tap="handleMoreTap('用户协议')">
        <view class="more-content">
          <text class="more-title">用户协议</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="more-item" @tap="handleMoreTap('隐私政策')">
        <view class="more-content">
          <text class="more-title">隐私政策</text>
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
    // 页面加载时可以获取用户真实信息
    // 这里可以调用API获取用户数据
    // this.fetchUserInfo();
  },
  
  methods: {
    // 添加新的方法来处理注销弹窗
    closeLogoutModal() {
      this.showLogoutModal = false;
    },
    
    confirmLogout() {
      uni.showToast({
        title: '账号已注销',
        icon: 'none'
      });
      // 这里可以调用注销账号的API
      // api.logoutAccount();
      
      // 关闭弹窗
      this.showLogoutModal = false;
      
      // 可以跳转到登录页面
      // uni.redirectTo({
      //   url: '/pages/login/index'
      // });
    },
    
    // 获取用户信息（示例方法）
    fetchUserInfo() {
      // 这里可以调用后端API获取用户真实信息
      // 示例：
      // api.getUserInfo().then(res => {
      //   this.userInfo = res.data;
      // });
    },
    
    // 修改头像
    changeAvatar() {
      uni.showToast({
        title: '更换头像功能开发中',
        icon: 'none'
      });
      // 这里可以调用上传头像功能
    },
    
    // 编辑资料
    editProfile() {
      uni.showToast({
        title: '编辑资料功能开发中',
        icon: 'none'
      });
      // 这里可以跳转到编辑资料页面
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
          uni.showModal({
            title: '功能许愿',
            editable: true,
            placeholderText: '请输入您希望添加的功能...',
            success: (res) => {
              if (res.confirm) {
                uni.showToast({
                  title: '已收到您的建议',
                  icon: 'success'
                });
                // 这里可以将用户建议发送到服务器
                // api.submitWish(res.content);
              }
            }
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
    
    handleMoreTap(item) {
      console.log('点击更多项:', item);
      
      switch(item) {
        case '联系我们':
          uni.showActionSheet({
            itemList: ['客服微信', '客服QQ', '客服邮箱'],
            success: (res) => {
              let contact = '';
              switch(res.tapIndex) {
                case 0:
                  contact = '微信：xxx-xxxx-xxxx';
                  break;
                case 1:
                  contact = 'QQ：123456789';
                  break;
                case 2:
                  contact = '邮箱：support@guguxue.com';
                  break;
              }
              uni.setClipboardData({
                data: contact,
                success: () => {
                  uni.showToast({
                    title: '已复制到剪贴板',
                    icon: 'success'
                  });
                }
              });
            }
          });
          break;
        case '用户协议':
          uni.showToast({
            title: '用户协议页面开发中',
            icon: 'none'
          });
          // 这里可以跳转到用户协议页面
          break;
        case '隐私政策':
          uni.showToast({
            title: '隐私政策页面开发中',
            icon: 'none'
          });
          // 这里可以跳转到隐私政策页面
          break;
        default:
          uni.showToast({
            title: `点击了${item}`,
            icon: 'none'
          });
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
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
.support-section,
.more-section {
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
.support-item,
.more-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child,
.support-item:last-child,
.more-item:last-child {
  border-bottom: none;
}

.setting-content,
.support-content,
.more-content {
  flex: 1;
}

.setting-title,
.support-title,
.more-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.setting-desc,
.support-desc,
.more-desc {
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
</style>