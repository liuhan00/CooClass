// 网络请求工具
const BASE_URL = 'http://192.168.1.157:8081'; // 后端IP地址和端口

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
    url: '/api/auth/update-user-info',
    method: 'POST',
    data: data
  });
}

export default {
  request,
  wechatLogin,
  // guestLogin,  // 已禁用 - 游客登录不再使用后端接口
  getUserInfo,
  updateUserInfo
};