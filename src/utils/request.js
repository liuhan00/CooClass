// 网络请求工具
const BASE_URL = 'http://192.168.1.124:8081'; // 后端IP地址和端口

// 通用请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取存储的token（如果有的话）
    const token = uni.getStorageSync('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...options.header
    };
    
    console.log('请求信息:', {
      url: BASE_URL + options.url,
      token: token ? '存在' : '不存在',
      tokenValue: token,
      headers: headers
    });
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      success: (res) => {
        console.log('请求成功:', {
          url: BASE_URL + options.url,
          statusCode: res.statusCode,
          data: res.data
        });
        
        // 检查HTTP状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          // HTTP状态码错误
          const error = new Error(`HTTP Error: ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.data = res.data;
          reject(error);
        }
      },
      fail: (err) => {
        console.error('请求失败:', {
          url: BASE_URL + options.url,
          error: err
        });
        
        // 网络错误
        const error = new Error('网络请求失败');
        error.networkError = true;
        error.originalError = err;
        reject(error);
      }
    });
  });
}

// 微信登录请求
function wechatLogin(data) {
  return request({
    url: '/api/auth/wechat-login',
    method: 'POST',
    data: data
  });
}

// 游客登录请求（已禁用 - 不再使用后端接口）
// function guestLogin(data) {
//   return request({
//     url: '/api/auth/guest-login',
//     method: 'POST',
//     data: data
//   });
// }

// 获取用户信息
function getUserInfo() {
  return request({
    url: '/api/auth/user-info',
    method: 'GET'
  });
}

// 更新用户信息
function updateUserInfo(data) {
  return request({
    url: '/api/auth/user-info',
    method: 'PUT',
    data: data
  });
}

// 注销账号
function deleteAccount() {
  return request({
    url: '/api/user/account',
    method: 'DELETE'
  });
}

// 开始专注
function startFocus(data) {
  return request({
    url: '/api/focus/start',
    method: 'POST',
    data: data
  });
}

// 结束专注
function endFocus(data) {
  return request({
    url: '/api/focus/end',
    method: 'POST',
    data: data
  });
}

// 中断专注
function cancelFocus(data) {
  return request({
    url: '/api/focus/cancel',
    method: 'POST',
    data: data
  });
}

// 继续专注
function continueFocus(data) {
  return request({
    url: '/api/focus/continue',
    method: 'POST',
    data: data
  });
}

// 获取专注记录列表
function getFocusList(params = {}) {
  // 将参数转换为查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = queryString ? `/api/focus/list?${queryString}` : '/api/focus/list';
  
  return request({
    url: url,
    method: 'GET'
  });
}

// 获取标签列表
function getFocusTags(params = {}) {
  // 将参数转换为查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = queryString ? `/api/focus-tags/?${queryString}` : '/api/focus-tags/';
  
  return request({
    url: url,
    method: 'GET'
  });
}

// 创建标签
// 前端创建标签时只需传 tagName 和 icon（可选）
// 后端自动分配 1~5 之间的颜色编号
function createFocusTag(data) {
  return request({
    url: '/api/focus-tags/',
    method: 'POST',
    data: data
  });
}

// 更新标签
function updateFocusTag(tagId, data) {
  return request({
    url: `/api/focus-tags/${tagId}`,
    method: 'PUT',
    data: data
  });
}

// 删除标签
function deleteFocusTag(tagId) {
  return request({
    url: `/api/focus-tags/${tagId}`,
    method: 'DELETE'
  });
}

// 默认导出
export default {
  request,
  wechatLogin,
  // guestLogin,  // 已禁用 - 游客登录不再使用后端接口
  updateUserInfo,
  deleteAccount
};

// 命名导出通用请求方法
export { getUserInfo };

// 命名导出专注功能相关API
export { startFocus, endFocus, cancelFocus, continueFocus, getFocusList };

// 命名导出标签管理相关API
export { getFocusTags, createFocusTag, updateFocusTag, deleteFocusTag };

// 日程管理相关API
function createSchedule(data) {
  return request({
    url: '/api/schedules/',
    method: 'POST',
    data: data
  });
}

function getSchedules() {
  return request({
    url: '/api/schedules/',
    method: 'GET'
  });
}

function getUpcomingSchedules() {
  return request({
    url: '/api/schedules/upcoming',
    method: 'GET'
  });
}

function getScheduleStats() {
  return request({
    url: '/api/schedules/stats',
    method: 'GET'
  });
}

function completeSchedule(scheduleId) {
  return request({
    url: `/api/schedules/${scheduleId}/complete`,
    method: 'PUT'
  });
}

function deleteSchedule(scheduleId) {
  return request({
    url: `/api/schedules/${scheduleId}`,
    method: 'DELETE'
  });
}

// 命名导出日程管理相关API
export { createSchedule, getSchedules, getUpcomingSchedules, getScheduleStats, completeSchedule, deleteSchedule };

// 获取小鸡统计信息
function getChickenStats() {
  return request({
    url: '/api/chicken/info',
    method: 'GET'
  });
}

// 与小鸡互动
function interactWithChicken(data) {
  return request({
    url: '/api/chicken/interact',
    method: 'POST',
    data: data
  });
}

// 获取药物列表
function getMedicineList() {
  return request({
    url: '/api/medicine/list',
    method: 'GET'
  });
}

// 获取食物列表
function getFoodsList() {
  return request({
    url: '/api/foods/',
    method: 'GET'
  });
}

// 获取用户药物库存
function getUserMedicineInventory() {
  return request({
    url: '/api/medicine/inventory',
    method: 'GET'
  });
}

// 获取用户食物库存
function getUserFoodInventory() {
  return request({
    url: '/api/foods/inventory',
    method: 'GET'
  });
}

// 购买药物
function purchaseMedicine(data) {
  return request({
    url: '/api/medicine/purchase',
    method: 'POST',
    data: data
  });
}

// 购买食物
function purchaseFood(data) {
  return request({
    url: '/api/foods/purchase',
    method: 'POST',
    data: data
  });
}

// 喂食小鸡
function feedChicken(data) {
  return request({
    url: '/api/chicken/feed',
    method: 'POST',
    data: data
  });
}

// 使用药品
function useMedicine(data) {
  return request({
    url: '/api/medicine/use',
    method: 'POST',
    data: data
  });
}

// 获取药品使用历史
function getMedicineHistory() {
  return request({
    url: '/api/medicine/history',
    method: 'GET'
  });
}

// 升级小鸡
function levelUpChicken() {
  return request({
    url: '/api/chicken/level-up',
    method: 'POST'
  });
}

// 获取专注统计数据
function getFocusStats(params = {}) {
  // 将参数转换为查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = queryString ? `/api/statistics/focus?${queryString}` : '/api/statistics/focus';
  
  return request({
    url: url,
    method: 'GET'
  });
}

// 获取今日专注统计数据
function getTodayStats() {
  return request({
    url: '/api/focus/today-stats',
    method: 'GET'
  });
}

// 获取小鸡喂养记录
function getChickenFeedStats() {
  return request({
    url: '/api/chicken/feed-stats',
    method: 'GET'
  });
}

// 获取小鸡互动记录历史
function getChickenInteractionHistory(params = {}) {
  // 将参数转换为查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = queryString ? `/api/chicken/interaction-history?${queryString}` : '/api/chicken/interaction-history';
  
  return request({
    url: url,
    method: 'GET'
  });
}

// 专注完成后的奖励检测
function detectAndReward(data) {
  return request({
    url: '/api/focus/auto/detect-and-reward',
    method: 'POST',
    data: data
  });
}

// 获取奖励详情
function getRewardDetails(focusId) {
  return request({
    url: `/api/focus/reward-details/${focusId}`,
    method: 'GET'
  });
}

// 获取用户小球数量
function getUserBallCount() {
  return request({
    url: '/api/user/ball-count',
    method: 'GET'
  });
}

// 获取用户今日任务
function getTodayMissions() {
  return request({
    url: '/api/mission/today',
    method: 'GET'
  });
}

// 领取任务奖励
function claimMissionReward(missionId) {
  return request({
    url: `/api/mission/claim/${missionId}`,
    method: 'POST'
  });
}

// 获取任务统计
function getMissionStats() {
  return request({
    url: '/api/mission/stats',
    method: 'GET'
  });
}

// 命名导出通用请求方法
export { request, wechatLogin, getChickenStats, interactWithChicken, getFoodsList, getUserFoodInventory, purchaseFood, getMedicineList, getUserMedicineInventory, purchaseMedicine, feedChicken, useMedicine, levelUpChicken, getFocusStats, getTodayStats, getChickenFeedStats, getMedicineHistory, getChickenInteractionHistory, detectAndReward, getRewardDetails, getUserBallCount, getTodayMissions, claimMissionReward, getMissionStats };

// 命名导出用户信息相关API
export { deleteAccount };

// 上传头像
function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    
    // 检查token是否存在且有效
    if (!token) {
      console.error('上传头像失败: 用户未登录，缺少token');
      const error = new Error('用户未登录，请先登录');
      error.statusCode = 401;
      reject(error);
      return;
    }
    
    console.log('上传头像信息:', {
      url: BASE_URL + '/api/upload/avatar',
      token: token ? '存在' : '不存在',
      tokenLength: token.length
    });
    
    uni.uploadFile({
      url: BASE_URL + '/api/upload/avatar',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/form-data'
      },
      success: (res) => {
        console.log('上传头像响应:', {
          statusCode: res.statusCode,
          data: res.data
        });
        
        // 检查是否是401或403错误
        if (res.statusCode === 401 || res.statusCode === 403) {
          console.error('认证失败，可能token无效:', res.data);
          uni.removeStorageSync('token'); // 清除无效token
          const error = new Error('登录已过期，请重新登录');
          error.statusCode = res.statusCode;
          reject(error);
          return;
        }
        
        try {
          const response = JSON.parse(res.data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              statusCode: res.statusCode,
              data: response
            });
          } else {
            const error = new Error(`HTTP Error: ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.data = response;
            reject(error);
          }
        } catch (e) {
          console.error('解析上传响应失败:', e);
          const error = new Error('响应数据格式错误');
          error.originalResponse = res.data;
          reject(error);
        }
      },
      fail: (err) => {
        console.error('上传头像失败:', err);
        const error = new Error('头像上传失败');
        error.networkError = true;
        error.originalError = err;
        reject(error);
      }
    });
  });
}

// 命名导出上传头像API
export { uploadAvatar };
