// WebSocket工具函数
// 定义WebSocket关闭码常量
const WEBSOCKET_CLOSE_CODES = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  // 保留 1004
  // 1005 是特殊用途，不能由应用使用
  // 1006 是特殊用途，不能由应用使用
  NO_STATUS_RECEIVED: 1005, // 特殊用途
  ABNORMAL_CLOSURE: 1006,  // 特殊用途
  INVALID_FRAME_PAYLOAD_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MISSING_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE: 1015,
  // 应用自定义关闭码范围 (3000-3999)
  APP_CUSTOM_START: 3000,
  APP_CUSTOM_END: 3999,
  // 应用自定义关闭码
  APP_USER_LOGOUT: 3001,
  APP_TOKEN_EXPIRED: 3002,
  APP_MAINTENANCE: 3003,
  APP_FORCE_CLOSE: 3004
};

// 检查关闭码是否有效
function isValidCloseCode(code) {
  // 1000是正常关闭码
  if (code === 1000) return true;
  // 3000-3999是应用自定义范围
  if (code >= 3000 && code <= 3999) return true;
  // 4000-4999是私有使用范围
  if (code >= 4000 && code <= 4999) return true;
  return false;
}

// 安全关闭WebSocket连接
function safeCloseSocket(socketTask, code = WEBSOCKET_CLOSE_CODES.NORMAL_CLOSURE, reason = '') {
  if (!socketTask) {
    console.warn('WebSocket实例不存在，无法关闭');
    return;
  }
  
  // 验证关闭码是否符合规范
  if (!isValidCloseCode(code)) {
    console.warn(`无效的WebSocket关闭码: ${code}，将使用默认关闭码: ${WEBSOCKET_CLOSE_CODES.NORMAL_CLOSURE}`);
    code = WEBSOCKET_CLOSE_CODES.NORMAL_CLOSURE;
  }
  
  try {
    socketTask.close({
      code: code,
      reason: reason,
      success: (res) => {
        console.log('WebSocket连接关闭成功', res);
      },
      fail: (err) => {
        console.error('WebSocket连接关闭失败', err);
      }
    });
  } catch (error) {
    console.error('关闭WebSocket时发生异常', error);
  }
}

// 创建WebSocket连接的封装函数
function connectSocket(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const socketTask = uni.connectSocket({
        url: options.url,
        header: options.header || {},
        protocols: options.protocols || [],
        method: options.method || 'GET',
        success: (res) => {
          console.log('WebSocket连接成功', res);
          resolve(socketTask);
        },
        fail: (err) => {
          console.error('WebSocket连接失败', err);
          reject(err);
        }
      });
      
      // 监听WebSocket事件
      if (options.onOpen) {
        socketTask.onOpen(options.onOpen);
      }
      
      if (options.onMessage) {
        socketTask.onMessage(options.onMessage);
      }
      
      if (options.onError) {
        socketTask.onError(options.onError);
      }
      
      if (options.onClose) {
        socketTask.onClose(options.onClose);
      }
      
    } catch (error) {
      console.error('创建WebSocket连接时发生异常', error);
      reject(error);
    }
  });
}

export {
  WEBSOCKET_CLOSE_CODES,
  isValidCloseCode,
  safeCloseSocket,
  connectSocket
};