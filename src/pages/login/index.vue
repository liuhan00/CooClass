<template>
  <view class="screen login-screen" :class="{ 'login-screen--entered': hasEntered }">
    <view class="hero-wrapper">
      <!-- 视频或备用背景 -->
      <video
        v-show="!videoError"
        id="heroVideo"
        class="hero-video"
        :src="videoSrc"
        :autoplay="true"
        :loop="true"
        :muted="true"
        :controls="false"
        show-center-play-btn="false"
        show-fullscreen-btn="false"
        enable-progress-gesture="false"
        object-fit="cover"
        @error="handleVideoError"
        @loadeddata="handleVideoLoaded"
      ></video>
      <!-- 视频加载失败时显示的备用背景 -->
      <view v-show="videoError" class="video-placeholder">
        <!-- 使用Canvas绘制动画 -->
        <canvas 
          canvas-id="loginCanvas" 
          class="canvas-placeholder"
          width="420" 
          height="420"
        ></canvas>
      </view>

      <text class="hero-name">{{ brandName }}</text>
      <text class="hero-tagline">登录后让小鸡陪你专注成长</text>
    </view>

    <view class="content-panel">
      <view class="top-bar">
        <view class="brand-badge">
          <text class="brand-title">{{ brandName }}</text>
        </view>
        <view class="top-icons">
          <text class="icon-button">···</text>
          <text class="icon-button">◎</text>
        </view>
      </view>

      <view class="login-panel">
        <text class="login-title">拖动小鸡，感受治愈的重量</text>
        <text class="login-subtitle">真实重力 + 碰撞衰减 + 抓取飞出手感</text>
        <button class="login-button login-button--wechat" @tap="handleWeChatLogin">微信授权登录</button>
        <button class="login-button login-button--ghost" @tap="handleGuestLogin">游客登录</button>
        <text class="login-tip">登录后可同步小鸡养成记录 · 数据云端保存</text>
      </view>
    </view>

    <view
      class="playground"
      :class="{ 'chick-dragging-active': activeChickId }"
      @touchstart="handleGlobalTouchStart"
      @touchmove="handleGlobalTouchMove"
      @touchend="handleGlobalTouchEnd"
      @touchcancel="handleGlobalTouchEnd"
    >
      <view class="chick-playground">
        <view class="playground-floor"></view>
        <view
          v-for="chick in chicks"
          :key="chick.id"
          class="playful-chick"
          :class="{ 'playful-chick--dragging': activeChickId === chick.id }"
          :style="getChickStyle(chick)"
        >
          <view class="mini-chick mini-chick--playground" :class="`mini-chick--${chick.expression}`">
            <view class="mini-chick-face">
              <view class="mini-chick-eye mini-chick-eye--left"></view>
              <view class="mini-chick-eye mini-chick-eye--right"></view>
              <view class="mini-chick-beak"></view>
              <view class="mini-chick-mouth"></view>
              <view class="mini-chick-brow mini-chick-brow--left"></view>
              <view class="mini-chick-brow mini-chick-brow--right"></view>
              <view class="mini-chick-cheek mini-chick-cheek--left" v-if="chick.expression === 'love'"></view>
              <view class="mini-chick-cheek mini-chick-cheek--right" v-if="chick.expression === 'love'"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Matter from 'matter-js'

const { Engine, Bodies, Body, Composite, Constraint, Query } = Matter

const FRAME_INTERVAL = 1000 / 60
const CHICK_RADIUS = 35

const requestFrame =
  typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => setTimeout(callback, 16)

const cancelFrame =
  typeof globalThis !== 'undefined' && typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame.bind(globalThis)
    : (timer) => clearTimeout(timer)

const CHICK_EXPRESSIONS = ['calm', 'focus', 'wink', 'laugh', 'side-eye', 'smile', 'blink', 'cheer', 'sleepy', 'surprised', 'love', 'angry', 'cool']

export default {
  data() {
    return {
      brandName: '咕咕学时',
      chicks: [],
      activeChickId: null,
      dragSnapshot: null,
      gravityVector: { x: 0, y: 1 },
      rpxRatio: 1,
      playgroundWidth: 750,
      playgroundHeight: 1000,
      playgroundRect: null,
      engine: null,
      dragConstraint: null,
      chickBodies: [],
      frameId: null,
      hasEntered: false,
      loginTimer: null,
      videoSrc: '',
      videoError: false,

      videoContext: null,
      accelerometerHandler: null,
    }
  },
  onLoad() {
    this.cacheDeviceRatio()
    // 设置视频路径
    // 使用H.264编码的视频文件
    setTimeout(() => {
      // 先使用网络测试视频来确认是否是文件本身的问题
      // this.videoSrc = './login_h264.mp4';
      this.videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
    }, 100)
  },
  onReady() {
    // 创建视频上下文
    if (uni.createVideoContext) {
      this.videoContext = uni.createVideoContext('heroVideo', this)
    }
    
    // 延迟播放视频以确保其已正确加载
    setTimeout(() => {
      if (this.videoContext && this.videoContext.play) {
        this.videoContext.play()
      }
    }, 500)
    
    this.measurePlayground(() => {
      this.initChicks()
      this.startPhysics()
    })
    
    // 初始化Canvas动画
    this.initCanvasAnimation()
  },
  onShow() {
    this.startPhysics()
    this.startAccelerometer()
    // 延迟播放视频以确保其已正确加载
    setTimeout(() => {
      if (this.videoContext && this.videoContext.play) {
        this.videoContext.play()
      }
    }, 300)
  },
  onHide() {
    this.stopPhysics()
    this.stopAccelerometer()
    if (this.videoContext && this.videoContext.pause) {
      this.videoContext.pause()
    }
  },
  onUnload() {
    this.stopPhysics()
    this.stopAccelerometer()
    this.destroyMatterWorld()
    if (this.loginTimer) {
      clearTimeout(this.loginTimer)
      this.loginTimer = null
    }
  },
  methods: {
    cacheDeviceRatio() {
      try {
        const info = uni.getSystemInfoSync()
        this.rpxRatio = 750 / info.windowWidth
        const totalRpxHeight = info.windowHeight * this.rpxRatio
        this.playgroundWidth = 750 - 96
        this.playgroundHeight = Math.max(totalRpxHeight - 520, 460)
      } catch (error) {
        console.warn('获取设备信息失败，将使用默认比例', error)
      }
    },
    measurePlayground(done) {
      this.$nextTick(() => {
        // 获取整个屏幕的尺寸作为拖动区域
        try {
          const info = uni.getSystemInfoSync()
          this.playgroundRect = {
            left: 0,
            top: 0,
            width: info.windowWidth,
            height: info.windowHeight
          }
          this.playgroundWidth = info.windowWidth * this.rpxRatio
          this.playgroundHeight = info.windowHeight * this.rpxRatio
          
          // 确保页面高度正确设置
          // 在小程序环境中不使用document.querySelector
        } catch (error) {
          console.warn('获取屏幕信息失败，将使用默认值', error)
          // 如果获取失败，仍然使用原来的操场尺寸
          if (!uni.createSelectorQuery) {
            if (typeof done === 'function') {
              done()
            }
            return
          }
          uni
            .createSelectorQuery()
            .in(this)
            .select('.chick-playground')
            .boundingClientRect((rect) => {
              if (rect && rect.width && rect.height) {
                this.playgroundRect = rect
                this.playgroundWidth = rect.width * this.rpxRatio
                this.playgroundHeight = rect.height * this.rpxRatio
              } else {
                console.warn('未能获取操场尺寸，将沿用默认值')
              }
              if (typeof done === 'function') {
                done()
              }
            })
            .exec()
        }
        
        if (typeof done === 'function') {
          done()
        }
      })
    },
    initChicks() {
      this.destroyMatterWorld()
      this.engine = Engine.create()
      this.engine.world.gravity.x = this.gravityVector.x
      this.engine.world.gravity.y = this.gravityVector.y
      this.engine.world.gravity.scale = 0.003  // 进一步增加重力，让小鸡下落更快
      this.chickBodies = this.createChickBodies()
      const bounds = this.createWorldBounds()
      this.dragConstraint = Constraint.create({
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: 0 },
        length: 0,
        stiffness: 0.04,
        damping: 0.18,
        render: { visible: false },
      })
      Composite.add(this.engine.world, [...this.chickBodies, ...bounds, this.dragConstraint])
      this.syncChicksFromBodies()
    },
    createChickBodies() {
      const count = CHICK_EXPRESSIONS.length
      // 在屏幕可见区域底部附近分布小鸡
      const startY = this.playgroundHeight * 0.5  // 从屏幕50%高度开始
      const visibleHeight = this.playgroundHeight * 0.4  // 在40%的垂直范围内分布
      return CHICK_EXPRESSIONS.map((expression, index) => {
        const body = Bodies.circle(
          Math.random() * (this.playgroundWidth - CHICK_RADIUS * 4) + CHICK_RADIUS * 2,
          Math.random() * (visibleHeight - CHICK_RADIUS * 4) + startY,
          CHICK_RADIUS,
          {
            restitution: 0.45,
            friction: 0.08,
            frictionAir: 0.005,  // 进一步减少空气阻力
            density: 0.0025,     // 进一步增加密度
            slop: 0.2,
          }
        )
        body.__id = `chick-${index}`
        body.__expression = expression
        return body
      })
    },
    createWorldBounds() {
      const width = this.playgroundWidth
      const height = this.playgroundHeight * 0.9  // 设置物理边界在屏幕90%高度处，更靠近底部
      const floor = Bodies.rectangle(width / 2, height + 40, width, 80, {
        isStatic: true,
        restitution: 0.2,
        friction: 0.1,
      })
      const leftWall = Bodies.rectangle(-40, height / 2, 80, height * 2, { isStatic: true })
      const rightWall = Bodies.rectangle(width + 40, height / 2, 80, height * 2, { isStatic: true })
      const topWall = Bodies.rectangle(width / 2, -40, width, 80, { isStatic: true })
      return [floor, leftWall, rightWall, topWall]
    },
    syncChicksFromBodies() {
      if (!this.chickBodies.length) return
      this.chicks = this.chickBodies.map((body) => ({
        id: body.__id,
        expression: body.__expression,
        x: body.position.x,
        y: body.position.y,
        radius: body.circleRadius || CHICK_RADIUS,
      }))
      
      // 调试信息：输出小鸡位置
      // console.log('小鸡位置:', this.chicks);
    },
    startPhysics() {
      if (!this.engine || this.frameId) return
      const step = () => {
        if (!this.engine) return
        Engine.update(this.engine, FRAME_INTERVAL)
        this.syncChicksFromBodies()
        this.frameId = requestFrame(step)
      }
      this.frameId = requestFrame(step)
    },
    stopPhysics() {
      if (this.frameId) {
        cancelFrame(this.frameId)
        this.frameId = null
      }
    },
    destroyMatterWorld() {
      this.stopPhysics()
      if (this.engine) {
        Composite.clear(this.engine.world, false)
        Engine.clear(this.engine)
      }
      this.engine = null
      this.chickBodies = []
      this.dragConstraint = null
    },
    getTouchPoint(touch) {
      if (!touch) return null
      if (!this.playgroundRect) {
        return {
          x: touch.pageX * this.rpxRatio,
          y: touch.pageY * this.rpxRatio,
        }
      }
      const relativeX = (touch.pageX - this.playgroundRect.left) * this.rpxRatio
      const relativeY = (touch.pageY - this.playgroundRect.top) * this.rpxRatio
      return {
        x: this.clamp(relativeX, 0, this.playgroundWidth),
        y: this.clamp(relativeY, 0, this.playgroundHeight),
      }
    },
    
    // 全局触摸开始事件
    handleGlobalTouchStart(event) {
      if (!this.chickBodies.length) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      
      // 检查是否点击到了小鸡
      const hits = Query.point(this.chickBodies, point)
      if (!hits.length) return
      
      const body = hits[0]
      body.isDragging = true
      this.activeChickId = body.__id
      this.dragSnapshot = {
        lastPoint: point,
        lastTime: Date.now(),
        velocity: { x: 0, y: 0 },
      }
      
      // 阻止默认行为和冒泡
      event.preventDefault()
      event.stopPropagation()
    },
    
    // 全局触摸移动事件
    handleGlobalTouchMove(event) {
      if (!this.activeChickId || !this.dragSnapshot) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      
      // 查找正在拖拽的小鸡
      const body = this.chickBodies.find(b => b.__id === this.activeChickId)
      if (!body) return
      
      // 直接设置小鸡的位置
      Body.setPosition(body, point)
      
      const now = Date.now()
      const dt = Math.max(now - this.dragSnapshot.lastTime, 16)
      this.dragSnapshot.velocity = {
        x: (point.x - this.dragSnapshot.lastPoint.x) / dt,
        y: (point.y - this.dragSnapshot.lastPoint.y) / dt,
      }
      this.dragSnapshot.lastPoint = point
      this.dragSnapshot.lastTime = now
      
      // 阻止默认行为和冒泡
      event.preventDefault()
      event.stopPropagation()
    },
    
    // 全局触摸结束事件
    handleGlobalTouchEnd(event) {
      if (this.activeChickId) {
        // 查找正在拖拽的小鸡
        const body = this.chickBodies.find(b => b.__id === this.activeChickId)
        if (body) {
          body.isDragging = false
          if (this.dragSnapshot && this.dragSnapshot.velocity) {
            Body.setVelocity(body, {
              x: this.dragSnapshot.velocity.x * 30,
              y: this.dragSnapshot.velocity.y * 30,
            })
          }
        }
      }
      this.resetDragState()
      
      // 阻止默认行为和冒泡
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }
    },

    resetDragState() {
      this.activeChickId = null
      this.dragSnapshot = null
    },
    getChickStyle(chick) {
      const left = (chick.x || 0) - (chick.radius || CHICK_RADIUS)
      const top = (chick.y || 0) - (chick.radius || CHICK_RADIUS)
      return `transform: translate3d(${left}rpx, ${top}rpx, 0);`
    },
    startAccelerometer() {
      if (this.accelerometerHandler) return
      try {
        uni.startAccelerometer({ interval: 'game' })
        this.accelerometerHandler = (res) => {
          const gx = res.x
          const gy = -res.y
          const magnitude = Math.sqrt(gx * gx + gy * gy) || 1
          const normalizedX = gx / magnitude
          const normalizedY = gy / magnitude
          this.gravityVector = {
            x: normalizedX,
            y: normalizedY,
          }
          if (this.engine) {
            this.engine.world.gravity.x = normalizedX
            this.engine.world.gravity.y = normalizedY
          }
        }
        uni.onAccelerometerChange(this.accelerometerHandler)
      } catch (error) {
        console.warn('当前设备不支持重力感应，保留默认重力方向', error)
      }
    },
    stopAccelerometer() {
      if (this.accelerometerHandler && uni.offAccelerometerChange) {
        uni.offAccelerometerChange(this.accelerometerHandler)
      }
      this.accelerometerHandler = null
      if (uni.stopAccelerometer) {
        uni.stopAccelerometer()
      }
    },
    handleWeChatLogin() {
      this.triggerEntrance('已连接微信')
    },
    handleGuestLogin() {
      this.triggerEntrance('以游客模式体验')
    },
    
    // 视频加载错误处理
    handleVideoError(err) {
      console.error('视频加载失败:', err)
      this.videoError = true
      // 如果视频加载失败，显示默认背景色
      uni.showToast({
        title: '视频加载失败，显示默认背景',
        icon: 'none'
      })
      
      // 记录详细错误信息
      if (err && err.detail) {
        console.error('视频错误详情:', err.detail)
        
        // 添加更多调试信息
        if (err.detail.errMsg) {
          console.error('具体错误信息:', err.detail.errMsg)
        }
      }
      
      // 输出当前视频源路径
      console.error('当前视频源路径:', this.videoSrc)
    },
    
    // 视频播放准备完成
    handleVideoLoaded() {
      // console.log('视频加载完成')
      this.videoError = false
    },
    
    // 初始化Canvas动画
    initCanvasAnimation() {
      try {
        // 获取Canvas上下文
        const ctx = uni.createCanvasContext('loginCanvas', this)
        
        // 设置圆形背景
        ctx.setFillStyle('#f6c08f')
        ctx.beginPath()
        ctx.arc(210, 210, 200, 0, 2 * Math.PI)
        ctx.fill()
        
        // 绘制小鸡图案
        this.drawChick(ctx)
        
        // 绘制完成
        ctx.draw()
      } catch (error) {
        console.warn('Canvas动画初始化失败:', error)
      }
    },
    
    // 绘制小鸡图案
    drawChick(ctx) {
      // 绘制身体
      ctx.setFillStyle('#FFD700')
      ctx.beginPath()
      ctx.arc(210, 210, 80, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制头部
      ctx.setFillStyle('#FFD700')
      ctx.beginPath()
      ctx.arc(210, 150, 50, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制眼睛
      ctx.setFillStyle('#000')
      ctx.beginPath()
      ctx.arc(195, 140, 8, 0, 2 * Math.PI)
      ctx.arc(225, 140, 8, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制嘴巴
      ctx.setFillStyle('#FF8C00')
      ctx.beginPath()
      ctx.moveTo(210, 160)
      ctx.lineTo(230, 170)
      ctx.lineTo(210, 180)
      ctx.closePath()
      ctx.fill()
      
      // 绘制翅膀（使用arc代替ellipse）
      ctx.setFillStyle('#FFA500')
      ctx.beginPath()
      ctx.arc(180, 210, 25, 0, 2 * Math.PI)
      ctx.fill()
    },
    triggerEntrance(message) {
      uni.showToast({
        title: message,
        icon: 'none',
      })
      if (!this.hasEntered) {
        this.hasEntered = true
      }
      if (this.loginTimer) {
        clearTimeout(this.loginTimer)
      }
      this.loginTimer = setTimeout(() => {
        this.navigateToHome()
      }, 620)
    },
    navigateToHome() {
      uni.reLaunch({
        url: '/pages/index/index',
      })
    },
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
  },
}
</script>

<style>
.page,
.screen {
  height: 100vh;
  min-height: 100vh;
  padding: 48rpx 48rpx 120rpx;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-screen {
  padding-top: 120rpx;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

.login-screen--entered .content-panel {
  margin-top: 340rpx;
}

.hero-wrapper {
  position: absolute;
  top: 360rpx;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: transform 0.7s cubic-bezier(0.19, 1, 0.22, 1), top 0.7s cubic-bezier(0.19, 1, 0.22, 1),
    left 0.7s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 5;
  width: 420rpx;
  height: 420rpx;
}

.hero-video, .video-placeholder {
  width: 420rpx;
  height: 420rpx;
  border-radius: 220rpx;
  background: #f6c08f;
  box-shadow: 0 30rpx 60rpx rgba(0, 0, 0, 0.18);
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
}

.video-placeholder {
  background: linear-gradient(135deg, #f6c08f, #ff9a4d);
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.login-screen--entered .hero-wrapper {
  top: 132rpx;
  left: 64rpx;
  transform: translate(0, 0) scale(0.58);
  transform-origin: top left;
}

.hero-name {
  margin-top: 24rpx;
  font-size: 56rpx;
  font-weight: 600;
  letter-spacing: 10rpx;
  color: #3a210e;
}

.hero-tagline {
  margin-top: 12rpx;
  font-size: 28rpx;
  letter-spacing: 6rpx;
  color: rgba(58, 33, 14, 0.65);
}

.content-panel {
  width: 100%;
  margin-top: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  transition: margin-top 0.6s ease;
}

.top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64rpx;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.login-screen--entered .top-bar {
  opacity: 1;
}

.brand-badge {
  min-width: 160rpx;
}

.login-screen:not(.login-screen--entered) .brand-title {
  opacity: 0;
}

.brand-title {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 6rpx;
  color: #2b1407;
  transition: opacity 0.3s ease;
}

.top-icons {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.icon-button {
  font-size: 32rpx;
  color: #2b1407;
}

.login-panel {
  width: 100%;
  padding: 60rpx 48rpx;
  border-radius: 56rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 40rpx 80rpx rgba(140, 78, 26, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
}

.login-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #3a210e;
}

.login-subtitle {
  font-size: 28rpx;
  color: rgba(58, 33, 14, 0.7);
  text-align: center;
  line-height: 44rpx;
}

.login-button {
  width: 100%;
  height: 104rpx;
  line-height: 104rpx;
  border-radius: 80rpx;
  font-size: 32rpx;
  border: none;
}

.login-button--wechat {
  background: linear-gradient(130deg, #2f1b0d, #000000);
  color: #ffffff;
  box-shadow: 0 24rpx 40rpx rgba(0, 0, 0, 0.18);
}

.login-button--ghost {
  background: transparent;
  border: 2rpx solid rgba(58, 33, 14, 0.7);
  color: #3a210e;
}

.login-tip {
  font-size: 24rpx;
  color: rgba(58, 33, 14, 0.6);
  text-align: center;
}

button::after {
  border: none;
}

.playground {
  width: 100%;
  flex: 1;
  margin-top: 36rpx;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}
  
.playground.chick-dragging-active {
  pointer-events: auto;
}

.chick-playground {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.playground-floor {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: 40rpx;
  height: 30rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 40rpx;
  filter: blur(4rpx);
}

.mini-chick {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #050505;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-chick::after {
  content: '';
  position: absolute;
  width: 60rpx;
  height: 36rpx;
  top: 20rpx;
  left: 16rpx;
  background: radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.25), transparent);
  border-radius: 50%;
  opacity: 0.5;
}

.mini-chick-face {
  width: 100%;
  height: 100%;
  position: relative;
}

.mini-chick-eye {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ffffff;
  top: 18rpx;
}

.mini-chick-eye::after {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #000000;
  top: 4rpx;
  left: 4rpx;
}

.mini-chick-eye--left {
  left: 16rpx;
}

.mini-chick-eye--right {
  right: 16rpx;
}

.mini-chick-beak {
  position: absolute;
  width: 18rpx;
  height: 12rpx;
  background: #ffba4b;
  border-radius: 50% 50% 60% 60%;
  bottom: 16rpx;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: inset 0 -1rpx 0 rgba(0, 0, 0, 0.15);
}

.mini-chick-mouth {
  position: absolute;
  width: 30rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 186, 75, 0.9);
  bottom: 16rpx;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
}

.mini-chick-brow {
  position: absolute;
  width: 12rpx;
  height: 2rpx;
  background: #ffffff;
  top: 12rpx;
  opacity: 0;
}

.mini-chick-brow--left {
  left: 16rpx;
}

.mini-chick-brow--right {
  right: 16rpx;
}

.mini-chick--playground {
  width: 70rpx;
  height: 70rpx;
  box-shadow: 0 12rpx 20rpx rgba(0, 0, 0, 0.2);
}

.mini-chick--wink .mini-chick-eye--right {
  height: 6rpx;
  top: 42rpx;
  background: #ffffff;
  border-radius: 999rpx;
}

.mini-chick--wink .mini-chick-eye--right::after {
  width: 0;
  height: 0;
}

.mini-chick--laugh .mini-chick-mouth {
  opacity: 1;
  height: 18rpx;
  width: 40rpx;
  bottom: 18rpx;
}

.mini-chick--focus .mini-chick-brow {
  opacity: 1;
  transform-origin: left center;
}

.mini-chick--focus .mini-chick-brow--left {
  transform: rotate(-12deg);
}

.mini-chick--focus .mini-chick-brow--right {
  transform: rotate(12deg);
}

.mini-chick--side-eye .mini-chick-eye--left::after {
  left: 10rpx;
}

.mini-chick--side-eye .mini-chick-eye--right::after {
  left: 2rpx;
}

.mini-chick--blink .mini-chick-eye--left {
  height: 6rpx;
  top: 42rpx;
  background: #ffffff;
}

.mini-chick--blink .mini-chick-eye--left::after {
  width: 0;
  height: 0;
}

.mini-chick--cheer .mini-chick-mouth {
  opacity: 1;
  height: 22rpx;
  width: 34rpx;
  border-radius: 50% 50% 60% 60%;
  bottom: 18rpx;
}

.mini-chick--smile .mini-chick-mouth {
  opacity: 1;
}

/* 新增表情样式 */
.mini-chick--sleepy .mini-chick-eye {
  height: 8rpx;
  top: 38rpx;
  background: #ffffff;
  border-radius: 999rpx;
}

.mini-chick--sleepy .mini-chick-eye::after {
  width: 0;
  height: 0;
}

.mini-chick--sleepy .mini-chick-mouth {
  opacity: 0.6;
  height: 10rpx;
  width: 20rpx;
  bottom: 20rpx;
  border-radius: 0;
}

.mini-chick--surprised .mini-chick-eye {
  width: 30rpx;
  height: 30rpx;
  top: 24rpx;
}

.mini-chick--surprised .mini-chick-eye::after {
  width: 16rpx;
  height: 16rpx;
  top: 7rpx;
  left: 7rpx;
}

.mini-chick--surprised .mini-chick-mouth {
  opacity: 1;
  height: 20rpx;
  width: 20rpx;
  bottom: 16rpx;
  border-radius: 50%;
  background: #ffba4b;
}

.mini-chick--love .mini-chick-eye {
  background: #ff6b9d;
}

.mini-chick--love .mini-chick-eye::after {
  width: 0;
  height: 0;
  border-radius: 50%;
  background: transparent;
  border: 6rpx solid #ffffff;
  top: 6rpx;
  left: 6rpx;
}

.mini-chick--love .mini-chick-cheek {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  background: #ff6b9d;
  border-radius: 50%;
  top: 36rpx;
  opacity: 0.8;
}

.mini-chick--love .mini-chick-cheek--left {
  left: 8rpx;
}

.mini-chick--love .mini-chick-cheek--right {
  right: 8rpx;
}

.mini-chick--angry .mini-chick-brow {
  opacity: 1;
  background: #ff0000;
  height: 6rpx;
}

.mini-chick--angry .mini-chick-brow--left {
  left: 24rpx;
  transform: rotate(20deg);
}

.mini-chick--angry .mini-chick-brow--right {
  right: 24rpx;
  transform: rotate(-20deg);
}

.mini-chick--angry .mini-chick-mouth {
  opacity: 1;
  height: 12rpx;
  width: 24rpx;
  bottom: 18rpx;
  border-radius: 0 0 999rpx 999rpx;
  background: #ff0000;
}

.mini-chick--cool::before {
  content: '';
  position: absolute;
  width: 60rpx;
  height: 20rpx;
  background: #000000;
  top: 24rpx;
  left: 18rpx;
  border-radius: 10rpx;
  opacity: 0.8;
  z-index: 1;
}

.mini-chick--cool .mini-chick-eye {
  opacity: 0.8;
}

.playful-chick {
  position: absolute;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease;
  z-index: 101;
  pointer-events: auto;
  /* 确保小鸡可见 */
  visibility: visible !important;
  opacity: 1 !important;
}

.playful-chick--dragging {
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.35);
}

@keyframes walker-bob {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes flap {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(6deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes tail {
  0% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(4deg);
  }
  100% {
    transform: rotate(-6deg);
  }
}

@keyframes step {
  0% {
    transform: rotate(8deg);
  }
  50% {
    transform: rotate(-6deg);
  }
  100% {
    transform: rotate(8deg);
  }
}

@keyframes shadow {
  0% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.82);
  }
  100% {
    transform: scaleX(1);
  }
}
</style>
