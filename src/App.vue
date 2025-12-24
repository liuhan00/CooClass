<script>
export default {
  onLaunch() {
    console.log('咕咕学时小程序启动成功')
  },
  onShow() {
    console.log('咕咕学时已进入前台')
  },
  onHide() {
    console.log('咕咕学时切换至后台')
  },
  onError(error) {
    // 检查是否是WebSocket关闭代码错误
    if (error && typeof error === 'string' && error.includes('closeSocket') && error.includes('1006')) {
      console.warn('捕获到WebSocket关闭代码错误，已忽略:', error)
      return
    }
    
    // 检查是否是subPageFrameEndTime错误
    if (error && typeof error === 'string' && error.includes('__subPageFrameEndTime__')) {
      console.warn('捕获到subPageFrameEndTime错误，已忽略:', error)
      return
    }
    
    console.error('全局错误:', error)
  },
}
</script>

<style>
page {
  background-color: #ffffff;
  color: #101010;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
}

button::after {
  border: none;
}
</style>