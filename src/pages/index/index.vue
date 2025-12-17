<template>
  <view class="screen focus-screen" :class="{ 'focus-screen--entered': hasEntered }">
    <view class="hero-wrapper">
      <view class="walker-stage">
        <view class="walker">
          <view class="walker-shadow"></view>
          <view class="walker-tail">
            <view
              v-for="index in 4"
              :key="`tail-${index}`"
              class="walker-tail-fluff"
              :class="`walker-tail-fluff--${index}`"
            ></view>
          </view>
          <view class="walker-body">
            <view class="walker-fuzz walker-fuzz--top"></view>
            <view class="walker-fuzz walker-fuzz--bottom"></view>
            <view class="walker-wing"></view>
          </view>
          <view class="walker-head">
            <view class="walker-eye">
              <view class="walker-eye-inner"></view>
              <view class="walker-eye-spark"></view>
            </view>
            <view class="walker-beak"></view>
          </view>
          <view class="walker-leg walker-leg--front"></view>
          <view class="walker-leg walker-leg--back"></view>
        </view>
      </view>
      <text class="hero-name">{{ brandName }}</text>
      <text class="hero-tagline">小鸡陪你专注成长</text>
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

      <view class="focus-panel">
        <view class="pill scene-pill" @tap="handleSceneTap">
          <text class="pill-icon">📍</text>
          <text class="pill-text">{{ focusScene }}</text>
          <text class="pill-arrow">›</text>
        </view>

        <view class="pill duration-pill" @tap="handleDurationTap">
          <text class="duration-value">{{ focusDuration }}</text>
          <text class="pill-arrow">›</text>
        </view>

        <button class="start-button" type="default" @tap="handleStartFocus">
          开始
        </button>
      </view>
    </view>

    <view
      class="playground"
      @touchstart.stop.prevent="handlePlaygroundTouchStart"
      @touchmove.stop.prevent="handlePlaygroundTouchMove"
      @touchend.stop.prevent="handlePlaygroundTouchEnd"
      @touchcancel.stop.prevent="handlePlaygroundTouchEnd"
    >
      <view class="chick-playground">
        <view class="playground-floor"></view>
        <scroll-view class="chick-row" scroll-x enable-flex>
          <view
            v-for="stripChick in chickStrip"
            :key="stripChick.id"
            class="mini-chick"
            :class="`mini-chick--${stripChick.expression}`"
          >
            <view class="mini-chick-face">
              <view class="mini-chick-eye mini-chick-eye--left"></view>
              <view class="mini-chick-eye mini-chick-eye--right"></view>
              <view class="mini-chick-beak"></view>
              <view class="mini-chick-mouth"></view>
              <view class="mini-chick-brow mini-chick-brow--left"></view>
              <view class="mini-chick-brow mini-chick-brow--right"></view>
            </view>
          </view>
        </scroll-view>
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
const CHICK_RADIUS = 54

const requestFrame =
  typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => setTimeout(callback, 16)

const cancelFrame =
  typeof globalThis !== 'undefined' && typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame.bind(globalThis)
    : (timer) => clearTimeout(timer)

const CHICK_EXPRESSIONS = ['calm', 'focus', 'wink', 'laugh', 'side-eye', 'smile', 'blink', 'cheer']

export default {
  data() {
    return {
      brandName: '咕咕学时',
      focusScene: '阅读',
      focusDuration: '75:00',
      chicks: [],
      chickStrip: [],
      activeChickId: null,
      dragSnapshot: null,
      gravityVector: { x: 0, y: 1 },
      rpxRatio: 1,
      playgroundWidth: 654,
      playgroundHeight: 520,
      playgroundRect: null,
      engine: null,
      dragConstraint: null,
      chickBodies: [],
      frameId: null,
      hasEntered: false,
      accelerometerHandler: null,
    }
  },
  onLoad() {
    this.cacheDeviceRatio()
    this.createStripFaces()
  },
  onReady() {
    this.measurePlayground(() => {
      this.initChicks()
      this.startPhysics()
    })
  },
  onShow() {
    this.startPhysics()
    this.startAccelerometer()
  },
  onHide() {
    this.stopPhysics()
    this.stopAccelerometer()
  },
  onUnload() {
    this.stopPhysics()
    this.stopAccelerometer()
    this.destroyMatterWorld()
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
      })
    },
    initChicks() {
      this.destroyMatterWorld()
      this.engine = Engine.create()
      this.engine.world.gravity.x = this.gravityVector.x
      this.engine.world.gravity.y = this.gravityVector.y
      this.engine.world.gravity.scale = 0.0018
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
      const usableWidth = Math.max(this.playgroundWidth - CHICK_RADIUS * 2, CHICK_RADIUS * 2)
      const spacing = count > 1 ? usableWidth / (count - 1) : 0
      const startY = this.playgroundHeight - CHICK_RADIUS - 40
      return CHICK_EXPRESSIONS.map((expression, index) => {
        const body = Bodies.circle(
          CHICK_RADIUS + index * spacing,
          startY + Math.random() * 30,
          CHICK_RADIUS,
          {
            restitution: 0.45,
            friction: 0.08,
            frictionAir: 0.012,
            density: 0.0016,
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
      const height = this.playgroundHeight
      const floor = Bodies.rectangle(width / 2, height + 40, width, 80, {
        isStatic: true,
        restitution: 0.2,
        friction: 0.1,
      })
      const leftWall = Bodies.rectangle(-40, height / 2, 80, height * 2, { isStatic: true })
      const rightWall = Bodies.rectangle(width + 40, height / 2, 80, height * 2, { isStatic: true })
      return [floor, leftWall, rightWall]
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
    handlePlaygroundTouchStart(event) {
      if (!this.dragConstraint || !this.chickBodies.length) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      const hits = Query.point(this.chickBodies, point)
      if (!hits.length) return
      const body = hits[0]
      body.isDragging = true
      this.activeChickId = body.__id
      this.dragConstraint.bodyB = body
      this.dragConstraint.pointA = point
      this.dragSnapshot = {
        lastPoint: point,
        lastTime: Date.now(),
        velocity: { x: 0, y: 0 },
      }
    },
    handlePlaygroundTouchMove(event) {
      if (!this.dragConstraint || !this.dragConstraint.bodyB || !this.dragSnapshot) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      const now = Date.now()
      const dt = Math.max(now - this.dragSnapshot.lastTime, 16)
      this.dragSnapshot.velocity = {
        x: (point.x - this.dragSnapshot.lastPoint.x) / dt,
        y: (point.y - this.dragSnapshot.lastPoint.y) / dt,
      }
      this.dragSnapshot.lastPoint = point
      this.dragSnapshot.lastTime = now
      this.dragConstraint.pointA = point
    },
    handlePlaygroundTouchEnd() {
      if (this.dragConstraint && this.dragConstraint.bodyB) {
        const body = this.dragConstraint.bodyB
        body.isDragging = false
        if (this.dragSnapshot && this.dragSnapshot.velocity) {
          Body.setVelocity(body, {
            x: this.dragSnapshot.velocity.x * 30,
            y: this.dragSnapshot.velocity.y * 30,
          })
        }
        this.dragConstraint.bodyB = null
      }
      this.resetDragState()
    },
    resetDragState() {
      this.activeChickId = null
      this.dragSnapshot = null
    },
    createStripFaces() {
      this.chickStrip = CHICK_EXPRESSIONS.map((expression, index) => ({
        id: `strip-${index}`,
        expression,
      }))
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
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    handleSceneTap() {
      uni.showToast({
        title: '场景选择即将开放',
        icon: 'none',
      })
    },
    handleDurationTap() {
      uni.showToast({
        title: '敬请期待时长配置',
        icon: 'none',
      })
    },
    handleStartFocus() {
      uni.showToast({
        title: '开始专注',
        icon: 'none',
      })
    },
  },
}
</script>

<style>
.page,
.screen {
  min-height: 100vh;
  padding: 48rpx 48rpx 120rpx;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.focus-screen {
  padding-top: 80rpx;
}

.focus-screen--entered .content-panel {
  margin-top: 300rpx;
}

.hero-wrapper {
  position: absolute;
  top: 320rpx;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.7s cubic-bezier(0.19, 1, 0.22, 1), top 0.7s cubic-bezier(0.19, 1, 0.22, 1),
    left 0.7s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 5;
}

.focus-screen--entered .hero-wrapper {
  top: 72rpx;
  left: 64rpx;
  transform: translate(0, 0) scale(0.55);
  transform-origin: top left;
}

.hero-name {
  margin-top: 24rpx;
  font-size: 56rpx;
  font-weight: 600;
  letter-spacing: 10rpx;
  color: #050505;
}

.hero-tagline {
  margin-top: 12rpx;
  font-size: 28rpx;
  letter-spacing: 6rpx;
  color: #8a8a8a;
}

.content-panel {
  width: 100%;
  margin-top: 460rpx;
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

.focus-screen--entered .top-bar {
  opacity: 1;
}

.brand-badge {
  min-width: 160rpx;
}

.focus-screen:not(.focus-screen--entered) .brand-title {
  opacity: 0;
}

.brand-title {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 6rpx;
  color: #101010;
  transition: opacity 0.3s ease;
}

.top-icons {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.icon-button {
  font-size: 32rpx;
  color: #1a1a1a;
}

.focus-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.pill {
  width: 440rpx;
  padding: 26rpx 38rpx;
  background-color: #f7f7f7;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
  border: 2rpx solid #101010;
}

.pill-icon {
  font-size: 28rpx;
  color: #3a3a3a;
}

.pill-text {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #1a1a1a;
}

.pill-arrow {
  font-size: 32rpx;
  color: #1a1a1a;
}

.duration-value {
  flex: 1;
  text-align: center;
  font-size: 52rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.start-button {
  width: 460rpx;
  height: 120rpx;
  line-height: 120rpx;
  border-radius: 90rpx;
  background-color: #000000;
  color: #ffffff;
  font-size: 36rpx;
  box-shadow: 0 24rpx 50rpx rgba(0, 0, 0, 0.18);
}

.playground {
  width: 100%;
  flex: 1;
  margin-top: 36rpx;
  position: relative;
  touch-action: none;
}

.chick-playground {
  position: absolute;
  inset: 0;
  border-radius: 52rpx 52rpx 0 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.06));
  overflow: hidden;
}

.playground-floor {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: 100rpx;
  height: 30rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 40rpx;
  filter: blur(4rpx);
}

.chick-row {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 16rpx;
  padding: 8rpx 18rpx;
  min-height: 110rpx;
  border-radius: 999rpx;
  border: 3rpx solid #050505;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  gap: 18rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.08);
  z-index: 5;
}

.mini-chick {
  width: 86rpx;
  height: 86rpx;
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
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  background: #ffffff;
  top: 28rpx;
}

.mini-chick-eye::after {
  content: '';
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #000000;
  top: 6rpx;
  left: 6rpx;
}

.mini-chick-eye--left {
  left: 26rpx;
}

.mini-chick-eye--right {
  right: 26rpx;
}

.mini-chick-beak {
  position: absolute;
  width: 28rpx;
  height: 18rpx;
  background: #ffba4b;
  border-radius: 50% 50% 60% 60%;
  bottom: 26rpx;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: inset 0 -2rpx 0 rgba(0, 0, 0, 0.15);
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
  width: 20rpx;
  height: 4rpx;
  background: #ffffff;
  top: 20rpx;
  opacity: 0;
}

.mini-chick-brow--left {
  left: 28rpx;
}

.mini-chick-brow--right {
  right: 28rpx;
}

.mini-chick--playground {
  width: 108rpx;
  height: 108rpx;
  box-shadow: 0 18rpx 30rpx rgba(0, 0, 0, 0.2);
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

.playful-chick {
  position: absolute;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease;
  z-index: 4;
}

.playful-chick--dragging {
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.35);
}

.walker-stage {
  width: 100%;
  height: 320rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.walker {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  animation: walker-bob 2.8s ease-in-out infinite;
}

.walker-shadow {
  position: absolute;
  width: 140rpx;
  height: 28rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.12);
  bottom: 12rpx;
  left: 50%;
  transform: translateX(-50%);
  filter: blur(2rpx);
  animation: shadow 1.6s ease-in-out infinite;
}

.walker-body {
  position: absolute;
  width: 170rpx;
  height: 140rpx;
  border-radius: 65% 60% 55% 45%;
  background: linear-gradient(140deg, #0f0f0f, #000000 70%);
  bottom: 40rpx;
  left: 16rpx;
}

.walker-fuzz {
  position: absolute;
  background: #050505;
  opacity: 0.92;
}

.walker-fuzz--top {
  width: 70rpx;
  height: 50rpx;
  border-radius: 50%;
  top: -6rpx;
  left: 12rpx;
}

.walker-fuzz--bottom {
  width: 90rpx;
  height: 60rpx;
  border-radius: 50%;
  bottom: -10rpx;
  left: -8rpx;
}

.walker-wing {
  position: absolute;
  width: 68rpx;
  height: 70rpx;
  border-radius: 60% 60% 40% 40%;
  background: linear-gradient(160deg, #090909, #1a1a1a);
  right: 22rpx;
  top: 46rpx;
  animation: flap 2s ease-in-out infinite;
}

.walker-head {
  position: absolute;
  width: 128rpx;
  height: 128rpx;
  border-radius: 60% 60% 55% 55%;
  background: linear-gradient(120deg, #101010, #000000 80%);
  right: -12rpx;
  top: -10rpx;
}

.walker-eye {
  position: absolute;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #ffffff;
  top: 42rpx;
  right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.walker-eye-inner {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #000000;
}

.walker-eye-spark {
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ffffff;
  top: 10rpx;
  right: 10rpx;
}

.walker-beak {
  position: absolute;
  width: 34rpx;
  height: 24rpx;
  border-radius: 20rpx;
  background: #f6b042;
  top: 76rpx;
  right: -6rpx;
  transform: rotate(-2deg);
  box-shadow: inset 0 -3rpx 0 rgba(0, 0, 0, 0.2);
}

.walker-tail {
  position: absolute;
  left: -28rpx;
  bottom: 104rpx;
  display: flex;
  gap: 6rpx;
}

.walker-tail-fluff {
  width: 30rpx;
  height: 36rpx;
  border-radius: 60% 0 60% 60%;
  background: #050505;
  transform-origin: right center;
  animation: tail 1.4s ease-in-out infinite;
}

.walker-tail-fluff--1 {
  transform: rotate(-24deg);
}

.walker-tail-fluff--2 {
  transform: rotate(-12deg);
  height: 38rpx;
  animation-delay: 0.1s;
}

.walker-tail-fluff--3 {
  transform: rotate(-4deg);
  animation-delay: 0.2s;
}

.walker-tail-fluff--4 {
  transform: rotate(6deg);
  animation-delay: 0.3s;
}

.walker-leg {
  position: absolute;
  width: 12rpx;
  height: 80rpx;
  background: #000000;
  bottom: 6rpx;
  border-radius: 999rpx;
  transform-origin: top center;
  animation: step 0.9s ease-in-out infinite;
}

.walker-leg--front {
  right: 68rpx;
}

.walker-leg--back {
  right: 36rpx;
  opacity: 0.7;
  animation-delay: 0.25s;
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
