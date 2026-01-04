<template>
  <view class="container">
    <!-- 动态小鸡区域 -->
    <view class="chicken-area">
      <view 
        class="chicken-container"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
      >
        <!-- 使用与首页相同的小鸡物理引擎 -->
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
      
      <!-- 倒计时显示 -->
      <view class="countdown-display">
        <text class="countdown-text">{{ formatTime(countdown) }}</text>
      </view>
      
      <!-- 提示文字 -->
      <view class="hint-text">中断专注小鸡会挂掉哦</view>
    </view>
    
    <!-- 控制按钮区域 -->
    <view class="controls-area">
      <!-- 正在计时状态 - 显示暂停和结束按钮 -->
      <view v-if="isTiming" class="control-buttons">
        <button class="control-btn btn-end" @tap="endTimer">
          <view class="btn-icon btn-icon-end"></view>
        </button>
        <button class="control-btn btn-pause" @tap="pauseTimer">
          <view class="btn-icon btn-icon-pause"></view>
        </button>
      </view>
      
      <!-- 暂停状态 - 显示继续按钮 -->
      <view v-else class="control-buttons">
        <button class="control-btn btn-resume" @tap="startTimer">
          <view class="btn-icon btn-icon-resume"></view>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import Matter from 'matter-js'
import { startFocus, endFocus } from '@/utils/request.js'

const { Engine, Bodies, Body, Composite, Constraint, Query } = Matter

const FRAME_INTERVAL = 1000 / 60
const CHICK_RADIUS = 35
const CHICK_EXPRESSIONS = ['calm', 'focus', 'wink', 'laugh', 'side-eye', 'smile', 'blink', 'cheer', 'sleepy', 'surprised', 'love', 'angry', 'cool']

const requestFrame =
  typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => setTimeout(callback, 16)

const cancelFrame =
  typeof globalThis !== 'undefined' && typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame.bind(globalThis)
    : (timer) => clearTimeout(timer)

export default {
  data() {
    return {
      // 倒计时时间（秒）
      countdown: 75 * 60, // 默认75分钟，从首页设置传递过来
      // 是否正在计时
      isTiming: false,
      // 计时器ID
      timer: null,
      // 页面来源参数
      fromPage: '',
      
      // 专注相关数据
      focusId: null,
      startTime: null,
      scene: '学习', // 专注场景，默认为学习
      tagId: null, // 标签ID，从首页传递过来
      
      // 小鸡物理引擎相关数据
      chicks: [],
      chickBodyMap: {},
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
      frameId: null
    }
  },
  
  onLoad(options) {
    // 接收从首页传递的参数
    if (options.duration) {
      // options.duration 现在是以分钟为单位的，需要转换为秒作为倒计时初始值
      this.countdown = parseInt(options.duration) * 60; // 将分钟转换为秒作为倒计时初始值
    }
    
    // 接收场景参数
    if (options.scene) {
      this.scene = decodeURIComponent(options.scene);
    }
    
    // 接收标签ID参数
    console.log('接收到的options:', options);
    if (options.tagId && options.tagId !== 'undefined' && options.tagId !== 'null') {
      this.tagId = parseInt(options.tagId);
      console.log('解析后的tagId:', this.tagId);
    } else {
      console.log('options中没有有效的tagId字段或tagId为undefined/null');
    }
    
    if (options.from) {
      this.fromPage = options.from;
    }
    
    this.cacheDeviceRatio()
  },
  
  onReady() {
    this.measurePlayground(() => {
      this.initChicks()
      this.startPhysics()
      // 页面加载完成后自动开始计时
      this.startTimer()
    })
  },
  
  onShow() {
    this.startPhysics()
  },
  
  onHide() {
    this.stopPhysics()
  },
  
  onUnload() {
    this.stopPhysics()
    this.destroyMatterWorld()
    
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
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
        } catch (error) {
          console.warn('获取屏幕信息失败，将使用默认值', error)
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
      this.engine.world.gravity.scale = 0.003
      this.engine.timing.timeScale = 1.0
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
      const startY = this.playgroundHeight * 0.5
      const visibleHeight = this.playgroundHeight * 0.4
      this.chickBodyMap = {}
      return CHICK_EXPRESSIONS.map((expression, index) => {
        const body = Bodies.circle(
          Math.random() * (this.playgroundWidth - CHICK_RADIUS * 4) + CHICK_RADIUS * 2,
          Math.random() * (visibleHeight - CHICK_RADIUS * 4) + startY,
          CHICK_RADIUS,
          {
            restitution: 0.45,
            friction: 0.08,
            frictionAir: 0.005,
            density: 0.0025,
            slop: 0.2,
          }
        )
        const chickId = `chick-${index}`
        this.chickBodyMap[chickId] = {
          id: chickId,
          expression: expression
        }
        return body
      })
    },
    
    createWorldBounds() {
      const width = this.playgroundWidth
      const height = this.playgroundHeight * 0.9
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
      this.chicks = this.chickBodies.map((body) => {
        const chickInfo = this.chickBodyMap[`chick-${this.chickBodies.indexOf(body)}`] || {};
        return {
          id: chickInfo.id || `chick-${this.chickBodies.indexOf(body)}`,
          expression: chickInfo.expression || 'calm',
          x: body.position.x,
          y: body.position.y,
          radius: body.circleRadius || CHICK_RADIUS,
        }
      })
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
    
    getChickStyle(chick) {
      const left = (chick.x || 0) - (chick.radius || CHICK_RADIUS)
      const top = (chick.y || 0) - (chick.radius || CHICK_RADIUS)
      return `transform: translate3d(${left}rpx, ${top}rpx, 0);`
    },
    
    // 触摸事件处理
    handleTouchStart(event) {
      if (!this.chickBodies.length) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      
      // 检查是否点击到了小鸡
      const hits = Query.point(this.chickBodies, point)
      if (!hits.length) return
      
      const body = hits[0]
      body.isDragging = true
      const chickIndex = this.chickBodies.indexOf(body);
      this.activeChickId = `chick-${chickIndex}`
      this.dragSnapshot = {
        lastPoint: point,
        lastTime: Date.now(),
        velocity: { x: 0, y: 0 },
      }
      
      event.preventDefault()
      event.stopPropagation()
    },
    
    handleTouchMove(event) {
      if (!this.activeChickId || !this.dragSnapshot) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      
      const chickInfo = this.chickBodyMap[this.activeChickId];
      const bodyIndex = Object.keys(this.chickBodyMap).indexOf(this.activeChickId);
      const body = this.chickBodies[bodyIndex]
      if (!body) return
      
      Body.setPosition(body, point)
      
      const now = Date.now()
      const dt = Math.max(now - this.dragSnapshot.lastTime, 16)
      this.dragSnapshot.velocity = {
        x: (point.x - this.dragSnapshot.lastPoint.x) / dt,
        y: (point.y - this.dragSnapshot.lastPoint.y) / dt,
      }
      this.dragSnapshot.lastPoint = point
      this.dragSnapshot.lastTime = now
      
      event.preventDefault()
      event.stopPropagation()
    },
    
    handleTouchEnd(event) {
      if (this.activeChickId) {
        const chickInfo = this.chickBodyMap[this.activeChickId];
        const bodyIndex = Object.keys(this.chickBodyMap).indexOf(this.activeChickId);
        const body = this.chickBodies[bodyIndex]
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
      this.activeChickId = null
      this.dragSnapshot = null
      
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }
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
    
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    
    // 格式化时间显示 (MM:SS)
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 开始计时
    async startTimer() {
      // 记录开始时间
      this.startTime = Date.now();
      
      try {
        // 调用后端开始专注API
        const requestData = {
          duration: parseInt(this.countdown / 60), // 以分钟为单位发送给后端
          startTime: this.startTime
        };
        
        // 如果有标签ID，则使用tagId字段
        console.log('当前tagId值:', this.tagId);
        if (this.tagId) {
          requestData.tagId = this.tagId; // 传递标签ID
          console.log('已添加tagId到请求数据:', this.tagId);
        } else {
          console.log('tagId为空或未定义，不添加tagId字段');
        }
        
        // 如果有标签ID，则包含在请求中
        console.log('准备发送的请求数据:', requestData);
        if (this.tagId) {
          requestData.tagId = this.tagId;
          console.log('添加了tagId到请求中:', this.tagId);
        } else {
          console.log('没有找到tagId，不会添加到请求中');
        }
        
        const response = await startFocus(requestData);
        console.log('后端返回的响应:', response);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          this.focusId = response.data.data.focusId; // 假设后端返回focusId
          console.log('开始专注成功', response.data);
        } else {
          console.error('开始专注失败:', response.data);
          uni.showToast({
            title: response.data.message || '开始专注失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('开始专注请求失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
      
      this.isTiming = true;
      
      // 启动计时器
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          // 时间到，自动结束
          this.finishTimer();
        }
      }, 1000);
    },
    
    // 暂停计时
    pauseTimer() {
      this.isTiming = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    
    // 结束计时（手动结束）
    async endTimer() {
      this.isTiming = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      try {
        // 调用后端结束专注API
        const response = await endFocus({
          focusId: this.focusId,
          endTime: Date.now()
        });
        
        if (response.statusCode === 200 && response.data.code === 200) {
          console.log('结束专注成功', response.data);
        } else {
          console.error('结束专注失败:', response.data);
          uni.showToast({
            title: response.data.message || '结束专注失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('结束专注请求失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
      
      // 跳转到小鸡死亡页面
      uni.navigateTo({
        url: '/pages/chicken-dead/index'
      });
    },
    
    // 完成计时（时间自然结束）
    async finishTimer() {
      this.isTiming = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      try {
        // 调用后端结束专注API
        const response = await endFocus({
          focusId: this.focusId,
          endTime: Date.now()
        });
        
        if (response.statusCode === 200 && response.data.code === 200) {
          console.log('结束专注成功', response.data);
          // 专注完成，显示成功提示
          uni.showToast({
            title: '专注完成！',
            icon: 'success'
          });
        } else {
          console.error('结束专注失败:', response.data);
          uni.showToast({
            title: response.data.message || '专注完成但记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('结束专注请求失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
      
      // 返回首页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  
  // 页面卸载时清除计时器
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5; /* 与其他页面一致的背景色 */
  padding: 40rpx;
  box-sizing: border-box;
}

/* 小鸡区域 */
.chicken-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.chicken-container {
  width: 100%;
  height: 300rpx;
  position: relative;
  margin-bottom: 60rpx;
  overflow: hidden;
}

/* 小鸡样式 - 与首页保持一致 */
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
  visibility: visible !important;
  opacity: 1 !important;
}

.playful-chick--dragging {
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.35);
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

.mini-chick-cheek {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  background: #ff6b9d;
  border-radius: 50%;
  top: 36rpx;
  opacity: 0;
}

.mini-chick-cheek--left {
  left: 8rpx;
}

.mini-chick-cheek--right {
  right: 8rpx;
}

.mini-chick--playground {
  width: 70rpx;
  height: 70rpx;
  box-shadow: 0 12rpx 20rpx rgba(0, 0, 0, 0.2);
}

/* 小鸡表情样式 - 与首页保持一致 */
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
  opacity: 0.8;
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

/* 倒计时显示 */
.countdown-display {
  margin-bottom: 30rpx;
}

.countdown-text {
  font-size: 64rpx;
  font-weight: bold;
  color: #333333;
  font-family: 'Courier New', monospace;
}

/* 提示文字 */
.hint-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 60rpx;
}

/* 控制按钮区域 */
.controls-area {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
}

.control-buttons {
  display: flex;
  gap: 40rpx;
}

.control-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
}

.btn-resume {
  background-color: #000000;
  color: #ffffff;
}

.btn-pause {
  background-color: #000000;
  color: #ffffff;
}

.btn-end {
  background-color: #ff4757;
  color: #ffffff;
}

.btn-icon {
  width: 48rpx;
  height: 48rpx;
}

/* 结束按钮图标 */
.btn-icon-end {
  position: relative;
}

.btn-icon-end::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #ffffff;
  border-radius: 8rpx;
}

/* 暂停按钮图标 */
.btn-icon-pause {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 48rpx;
  height: 48rpx;
}

.btn-icon-pause::before,
.btn-icon-pause::after {
  content: '';
  width: 16rpx;
  height: 48rpx;
  background-color: #ffffff;
  border-radius: 4rpx;
}

/* 恢复按钮图标 */
.btn-icon-resume {
  position: relative;
  width: 0;
  height: 0;
  border-top: 24rpx solid transparent;
  border-left: 48rpx solid #ffffff;
  border-bottom: 24rpx solid transparent;
  margin-left: 8rpx;
}
</style>