// 颜色映射工具函数
// 将数字映射到具体的颜色值

const COLOR_MAP = {
  "1": "#FF6B8B", // 粉色
  "2": "#4ECDC4", // 青绿色
  "3": "#FFD166", // 黄色
  "4": "#9B5DE5", // 紫色
  "5": "#00BBF9"  // 蓝色
};

// 根据颜色数字获取颜色值
function getColorByNumber(colorNumber) {
  const color = COLOR_MAP[colorNumber];
  if (!color) {
    console.warn(`未找到颜色编号 ${colorNumber} 对应的颜色，使用默认颜色`);
    return COLOR_MAP["1"]; // 默认返回第一个颜色
  }
  return color;
}

// 获取颜色映射表
function getColorMap() {
  return { ...COLOR_MAP };
}

// 获取所有可用的颜色编号
function getAvailableColorNumbers() {
  return Object.keys(COLOR_MAP);
}

export {
  COLOR_MAP,
  getColorByNumber,
  getColorMap,
  getAvailableColorNumbers
};