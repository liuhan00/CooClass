<template>
  <view class="screen focus-screen">
    <view class="top-bar">
      <text class="brand-title">{{ brandName }}</text>
      <view class="top-icons">
        <text class="icon-button">···</text>
        <text class="icon-button">◎</text>
      </view>
    </view>

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

    <view class="playground" @touchstart.stop @touchmove.stop @touchend.stop>
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
          :class="{ 'playful-chick--dragging': chick.isDragging }"
          :style="getChickStyle(chick)"
          :data-id="chick.id"
          @touchstart.stop.prevent="handleChickTouchStart"
          @touchmove.stop.prevent="handleChickTouchMove"
          @touchend.stop.prevent="handleChickTouchEnd"
          @touchcancel.stop.prevent="handleChickTouchEnd"
        >
          <view
            class="mini-chick mini-chick--playground"
            :class="`mini-chick--${chick.expression}`"
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
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const GRAVITY_FORCE = 1800
const DAMPING = 0.984
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
      physicsTimer: null,
      accelerometerHandler: null,
      rpxRatio: 1,
      playgroundWidth: 654,
      playgroundHeight: 520,
    }
  },
  onLoad() {
    this.cacheDeviceRatio()
    this.initChicks()
    this.createStripFaces()
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
    initChicks() {
      const count = CHICK_EXPRESSIONS.length
      const spacing = count > 1 ? (this.playgroundWidth - 260) / (count - 1) : 0
      const startY = this.playgroundHeight - 170
      this.chicks = CHICK_EXPRESSIONS.map((expression, index) => ({
        id: `chick-${index}`,
        expression,
        x: 130 + index * spacing,
        y: startY + Math.random() * 20,
        vx: 0,
        vy: 0,
        radius: 45,
        isDragging: false,
      }))
    },
    createStripFaces() {
      this.chickStrip = CHICK_EXPRESSIONS.map((expression, index) => ({
        id: `strip-${index}`,
        expression,
      }))
    },
    getChickStyle(chick) {
      return `transform: translate3d(${chick.x}rpx, ${chick.y}rpx, 0);`
    },
    handleChickTouchStart(event) {
      const id = event.currentTarget.dataset.id
      const chick = this.chicks.find((item) => item.id === id)
      const touch = event.touches && event.touches[0]
      if (!chick || !touch) return
      chick.isDragging = true
      chick.vx = 0
      chick.vy = 0
      this.activeChickId = id
      this.dragSnapshot = {
        startX: touch.pageX,
        startY: touch.pageY,
        chickStartX: chick.x,
        chickStartY: chick.y,
        time: Date.now(),
      }
    },
    handleChickTouchMove(event) {
      if (!this.activeChickId || !this.dragSnapshot) return
      const chick = this.chicks.find((item) => item.id === this.activeChickId)
      const touch = event.touches && event.touches[0]
      if (!chick || !touch) return
      const deltaX = (touch.pageX - this.dragSnapshot.startX) * this.rpxRatio
      const deltaY = (touch.pageY - this.dragSnapshot.startY) * this.rpxRatio
      const maxX = this.playgroundWidth - chick.radius * 2
      const maxY = this.playgroundHeight - chick.radius * 2
      chick.x = this.clamp(this.dragSnapshot.chickStartX + deltaX, 0, maxX)
      chick.y = this.clamp(this.dragSnapshot.chickStartY + deltaY, 0, maxY)
    },
    handleChickTouchEnd(event) {
      if (!this.activeChickId || !this.dragSnapshot) {
        this.resetDragState()
        return
      }
      const chick = this.chicks.find((item) => item.id === this.activeChickId)
      if (!chick) {
        this.resetDragState()
        return
      }
      const touch = (event.changedTouches && event.changedTouches[0]) || {
        pageX: this.dragSnapshot.startX,
        pageY: this.dragSnapshot.startY,
      }
      const elapsed = Math.max(Date.now() - this.dragSnapshot.time, 16)
      const velocityScale = 900 / elapsed
      chick.vx = (touch.pageX - this.dragSnapshot.startX) * this.rpxRatio * velocityScale
      chick.vy = (touch.pageY - this.dragSnapshot.startY) * this.rpxRatio * velocityScale
      chick.isDragging = false
      this.resetDragState()
    },
    resetDragState() {
      this.activeChickId = null
      this.dragSnapshot = null
    },
    startPhysics() {
      if (this.physicsTimer) return
      this.physicsTimer = setInterval(() => {
        this.stepPhysics()
      }, 16)
    },
    stopPhysics() {
      if (!this.physicsTimer) return
      clearInterval(this.physicsTimer)
      this.physicsTimer = null
    },
    stepPhysics() {
      const dt = 0.016
      const gravityX = this.gravityVector.x * GRAVITY_FORCE
      const gravityY = this.gravityVector.y * GRAVITY_FORCE
      const maxX = this.playgroundWidth
      const maxY = this.playgroundHeight
      this.chicks.forEach((chick) => {
        if (chick.isDragging) return
        chick.vx += gravityX * dt
        chick.vy += gravityY * dt
        chick.vx *= DAMPING
        chick.vy *= DAMPING
        chick.x += chick.vx * dt
        chick.y += chick.vy * dt
        const limitX = maxX - chick.radius * 2
        const limitY = maxY - chick.radius * 2
        if (chick.x < 0) {
          chick.x = 0
          chick.vx *= -0.65
        } else if (chick.x > limitX) {
          chick.x = limitX
          chick.vx *= -0.65
        }
        if (chick.y < 0) {
          chick.y = 0
          chick.vy *= -0.65
        } else if (chick.y > limitY) {
          chick.y = limitY
          chick.vy *= -0.65
        }
      })
    },
    startAccelerometer() {
      if (this.accelerometerHandler) return
      try {
        uni.startAccelerometer({ interval: 'game' })
        this.accelerometerHandler = (res) => {
          const gx = res.x
          const gy = -res.y
          const magnitude = Math.sqrt(gx * gx + gy * gy) || 1
          this.gravityVector = {
            x: gx / magnitude,
            y: gy / magnitude,
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
  padding: 80rpx 48rpx 120rpx;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.focus-screen {
  padding-top: 56rpx;
}

.top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
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

.brand-title {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 6rpx;
  color: #101010;
}

.walker-stage {
  width: 100%;
  height: 300rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 28rpx;
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

.pill {
  width: 420rpx;
  padding: 24rpx 36rpx;
  background-color: #f7f7f7;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
  border: 2rpx solid #101010;
}

.pill-icon {
  font-size: 28rpx;
  color: #3a3a3a;
}

.pill-text {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #1a1a1a;
}

.pill-arrow {
  font-size: 32rpx;
  color: #1a1a1a;
}

.duration-value {
  flex: 1;
  text-align: center;
  font-size: 48rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.start-button {
  width: 440rpx;
  height: 112rpx;
  line-height: 112rpx;
  margin-top: 24rpx;
  border-radius: 80rpx;
  background-color: #000000;
  color: #ffffff;
  font-size: 34rpx;
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
