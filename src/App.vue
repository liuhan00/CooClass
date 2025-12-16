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