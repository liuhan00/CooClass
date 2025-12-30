<template>
  <view class="profile-edit-page">
    <!-- 页面顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">编辑资料</text>
      <view class="nav-right">
        <text class="view-records-btn" @tap="viewFocusRecords">记录</text>
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
import request, { BASE_URL } from '@/utils/request.js'

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
    // 查看专注记录
    viewFocusRecords() {
      uni.navigateTo({
        url: '/pages/focus-list/index'
      });
    },
    
    // 初始化用户数据
    async initUserData() {
      try {
        // 检查本地存储的token
        const token = uni.getStorageSync('token');
        const userInfo = uni.getStorageSync('userInfo');
        
        console.log('编辑页面 - 本地存储的用户信息:', {
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
            avatar: userData.avatar || this.userInfo.avatar,
            nickname: userData.nickname || this.userInfo.nickname,
            bio: userData.bio || this.userInfo.bio,
            birthday: userData.birthday || this.userInfo.birthday
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
        if (error.statusCode === 401) {
          // 用户未登录或token过期，跳转到登录页面
          uni.showModal({
            title: '提示',
            content: '您还未登录，请先登录',
            confirmText: '去登录',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              } else {
                // 如果用户取消登录，则返回上一页
                uni.navigateBack();
              }
            }
          });
          return; // 停止后续处理
        } else {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      } finally {
        uni.hideLoading();
        // 保存原始数据用于比较
        this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
      }
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
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          try {
            uni.showLoading({
              title: '上传中...'
            });
            
            // 上传头像到服务器（这里使用模拟上传，实际项目中需要替换为真实上传接口）
            // 由于uni.uploadFile需要服务器支持，我们暂时先更新本地数据
            this.userInfo.avatar = tempFilePath;
            
            // 如果有头像上传API，可以在这里调用
            /* 
            const uploadResult = await uni.uploadFile({
              url: BASE_URL + '/api/upload/avatar',
              filePath: tempFilePath,
              name: 'avatar',
              header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token') // 如果需要认证
              }
            });
            
            if(uploadResult.statusCode === 200) {
              const response = JSON.parse(uploadResult.data);
              if(response.success) {
                this.userInfo.avatar = response.data.url;
              }
            }
            */
          } catch (error) {
            console.error('上传头像失败:', error);
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            });
          } finally {
            uni.hideLoading();
          }
        },
        fail: (err) => {
          console.log('选择头像失败', err);
          uni.showToast({
            title: '选择头像失败',
            icon: 'none'
          });
        }
      })
    },
    
    // 生日选择器变化
    onBirthdayChange(e) {
      this.userInfo.birthday = e.detail.value
    },
    
    // 保存用户资料
    async saveProfile() {
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
      
      try {
        // 调用API保存用户资料
        const response = await request.updateUserInfo(this.userInfo);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          uni.showToast({
            title: '资料保存成功',
            icon: 'success'
          });
          
          // 更新原始数据
          this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
          
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: response.data.message || '保存失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('保存用户资料失败:', error);
        
        // 检查是否是401未授权错误
        if (error.statusCode === 401 || (error.errMsg && error.errMsg.includes('401'))) {
          // 用户未登录或token过期，跳转到登录页面
          uni.showModal({
            title: '提示',
            content: '登录已过期，请重新登录',
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
  margin-top: 80rpx; /* 增加上边距，进一步避免与系统状态栏重叠 */
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
    
.view-records-btn {
  font-size: 28rpx;
  color: #666666;
  margin-right: 30rpx;
  padding: 10rpx 15rpx;
  border-radius: 8rpx;
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