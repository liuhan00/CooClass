<template>
  <view class="screen focus-screen" :class="{ 'focus-screen--entered': hasEntered }">
    <view class="hero-wrapper">
      <view class="walker-stage" @tap="openChickenInfoModal">
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
            <!-- 额外的羽毛细节 -->
            <view class="walker-fuzz-detail walker-fuzz-detail--1"></view>
            <view class="walker-fuzz-detail walker-fuzz-detail--2"></view>
            <view class="walker-fuzz-detail walker-fuzz-detail--3"></view>
          </view>
          <view class="walker-head">
            <view class="walker-eye">
              <view class="walker-eye-inner"></view>
              <view class="walker-eye-spark"></view>
            </view>
            <view class="walker-beak"></view>
          </view>
          <view class="walker-leg-group walker-leg-group--front">
            <view class="walker-leg">
              <view class="walker-thigh"></view>
              <view class="walker-shin"></view>
              <view class="walker-foot"></view>
            </view>
          </view>
          <view class="walker-leg-group walker-leg-group--back">
            <view class="walker-leg">
              <view class="walker-thigh"></view>
              <view class="walker-shin"></view>
              <view class="walker-foot"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 喂食按钮 -->
      <view class="feed-button" @tap="feedChicken">
        <text class="feed-icon">🍗</text>
        <text class="feed-text">喂食</text>
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

    <!-- 标签选择弹窗 -->
    <view class="tag-selector-modal" v-if="showTagSelector">
      <view class="tag-selector-overlay" @tap="closeTagSelector"></view>
      <view class="tag-selector-container">
        <view class="tag-selector-header">
          <text class="tag-selector-title">选择标签</text>
          <view class="more-options-button" @tap="toggleEditMode" v-if="!isEditingTags">
            <text class="dot"></text>
            <text class="dot"></text>
            <text class="dot"></text>
          </view>
          <view class="confirm-edit-button" @tap="confirmEditTags" v-else>
            <text class="checkmark">✓</text>
          </view>
        </view>
        <view class="tag-selector-content">
          <view class="new-tag-button" @tap="createNewTag">
            <text class="plus-icon">+</text>
            <text class="new-tag-text">新标签</text>
          </view>
          <view class="tags-container" :class="{ 'tags-container--editing': isEditingTags }">
            <text class="edit-mode-hint" v-if="isEditingTags">点击标签修改名称</text>
            <view 
              v-for="(tag, index) in tags" 
              :key="index"
              class="tag-item" 
              :class="{ 'tag-item--selected': tag.selected && !isEditingTags, 'tag-item--editing': isEditingTags && editingTagIndex === index }"
              @tap="isEditingTags ? startEditTagName(index) : selectTag(index)"
            >
              <view class="tag-dot" :style="{ backgroundColor: getColorByNumber(tag.colorNumber) }"></view>
              <input 
                v-if="isEditingTags && editingTagIndex === index" 
                class="tag-input" 
                v-model="editingTagName" 
                @confirm="finishEditTagName"
              />
              <text class="tag-text" v-else>{{ tag.name }}</text>
              <view class="delete-tag-button" v-if="isEditingTags" @tap.stop="showDeleteConfirm(index)">
                <text class="minus">-</text>
              </view>
              <view class="confirm-edit-tag-button" v-if="isEditingTags && editingTagIndex === index" @tap.stop="finishEditTagName">
                <text class="checkmark-large">✓</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view class="delete-confirm-modal" v-if="showDeleteConfirmDialog">
      <view class="delete-confirm-overlay" @tap="cancelDelete"></view>
      <view class="delete-confirm-container">
        <text class="delete-confirm-text">确定要删除标签吗？删除后，标签包含的专注数据也会被删除</text>
        <view class="delete-confirm-buttons">
          <button class="delete-button" @tap="confirmDeleteTag">删除</button>
          <button class="cancel-button" @tap="cancelDelete">取消</button>
        </view>
      </view>
    </view>
    
    <!-- 喂食弹窗 -->
    <view class="feed-modal" v-if="showFeedModal">
      <view class="feed-overlay" @tap="closeFeedModal"></view>
      <view class="feed-container">
        <!-- 顶部导航栏 -->
        <view class="feed-header">
          <view class="back-button" @tap="closeFeedModal">
            <text class="back-icon">‹</text>
          </view>
          <text class="feed-title">选择零食</text>
        </view>
        
        <!-- 零食选项列表 -->
        <scroll-view class="snacks-list" scroll-y="true">
          <view 
            v-for="(snack, index) in snacks" 
            :key="index"
            class="snack-item"
          >
            <view class="snack-icon" :class="`snack-icon--${snack.type}`">{{ snack.icon }}
              <text class="snack-exp">{{ snack.cost }}</text>
            </view>
            <view class="snack-info">
              <text class="snack-name">{{ snack.name }}</text>
              <text class="snack-quantity">拥有 {{ snack.quantity }}</text>
            </view>
            <button 
              class="feed-snack-button" 
              :class="{ 'feed-snack-button--disabled': snack.quantity < snack.cost }"
              :disabled="snack.quantity < snack.cost"
              @tap="feedSnack(snack)"
            >
              喂食
            </button>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 创建标签对话框 -->
    <view class="create-tag-modal" v-if="showCreateTagDialog">
      <view class="create-tag-overlay" @tap="cancelCreateTag"></view>
      <view class="create-tag-container">
        <text class="create-tag-title">创建新标签</text>
        <input 
          class="tag-name-input" 
          placeholder="请输入标签名称" 
          v-model="newTagName" 
          maxlength="10"
        />
        <view class="create-tag-buttons">
          <button class="create-button" @tap="confirmCreateTag">创建</button>
          <button class="cancel-button" @tap="cancelCreateTag">取消</button>
        </view>
      </view>
    </view>

    <view
      class="playground"
      :class="{ 'chick-dragging-active': activeChickId }"
      @touchstart="handlePlaygroundTouchStart"
      @touchmove="handlePlaygroundTouchMove"
      @touchend="handlePlaygroundTouchEnd"
      @touchcancel="handlePlaygroundTouchEnd"
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
            </view>
          </view>
        </view>
      </view>
    </view>





  <view class="chicken-info-modal" v-if="showChickenInfoModal">
    <view class="chicken-info-overlay" @tap="closeChickenInfoModal"></view>
    <view class="chicken-info-container">
      <view class="chicken-info-header">
        <text class="chicken-nickname">{{ chickenInfo.nickname }}</text>
      </view>
      <view class="chicken-stats">
        <view class="stat-item">
          <text class="stat-label">当前等级</text>
          <text class="stat-value">{{ chickenInfo.level }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">已养天数</text>
          <text class="stat-value">{{ chickenInfo.days }}天</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">金币数量</text>
          <text class="stat-value">{{ chickenInfo.coins }}</text>
        </view>
      </view>
      <view class="chicken-info-footer">
        <button class="view-details-button" @tap="goToTimeModule">查看详情</button>
      </view>
    </view>
  </view>
  
  <!-- 我的页面内容 -->
  <scroll-view v-if="showProfilePage" class="profile-page" scroll-y="true">
    <!-- 用户信息区 (Header) -->
    <view class="user-header">
      <view class="user-avatar">
        <image class="avatar-img" src="/static/logo.png" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <text class="username">用户名</text>
        <text class="user-id">ID: 123456789</text>
      </view>
    </view>

    <!-- 账号设置区块 -->
    <view class="settings-section">
      <text class="section-title">账号设置</text>
      <view class="setting-item" @tap="goToProfileEdit">
        <view class="setting-content">
          <text class="setting-title">账号资料</text>
          <text class="setting-desc">换头像、昵称、简介、生日</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="setting-item" @tap="showLogoutModal = true">
        <view class="setting-content">
          <text class="setting-title">注销账号</text>
          <text class="setting-desc">会清空您所有的记录, 谨慎处理哦</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="setting-item" @tap="showExitModal = true">
        <view class="setting-content">
          <text class="setting-title">退出登录</text>
          <text class="setting-desc">退出APP, 依然会保留数据</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 支持我们区块 -->
    <view class="support-section">
      <text class="section-title">支持我们</text>
      <view class="support-item">
        <view class="support-icon">🍊</view>
        <view class="support-content">
          <text class="support-title">加群交群</text>
          <text class="support-desc">一起开始自律吧</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="support-item">
        <view class="support-icon">❤️</view>
        <view class="support-content">
          <text class="support-title">给我们评分</text>
          <text class="support-desc">小小的鼓励一下我们</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="support-item">
        <view class="support-icon">✨</view>
        <view class="support-content">
          <text class="support-title">新功能许愿</text>
          <text class="support-desc">任何愿望都可以告诉我们, 说不定就会实现呢</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="support-item">
        <view class="support-icon">🍎</view>
        <view class="support-content">
          <text class="support-title">和朋友分享</text>
          <text class="support-desc">坚持的道路上多一个人一起努力</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 更多区块 -->
    <view class="more-section">
      <text class="section-title">更多</text>
      <view class="more-item">
        <view class="more-content">
          <text class="more-title">联系我们</text>
          <text class="more-desc">您可以通过客服邮箱联系我们</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="more-item">
        <view class="more-content">
          <text class="more-title">用户协议</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="more-item">
        <view class="more-content">
          <text class="more-title">隐私政策</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
    
    <!-- 注销账号确认弹窗 -->
    <view class="logout-modal" v-if="showLogoutModal">
      <view class="logout-modal-overlay" @tap="closeLogoutModal"></view>
      <view class="logout-modal-content">
        <text class="logout-modal-title">注销账号</text>
        <text class="logout-modal-content-text">注销账号会清空您的所有记录，并且不可恢复，谨慎处理哦</text>
        <view class="logout-modal-buttons">
          <button class="modal-button cancel-button" @tap="closeLogoutModal">取消</button>
          <button class="modal-button confirm-button" @tap="confirmLogout">注销</button>
        </view>
      </view>
    </view>
    
    <!-- 退出登录确认弹窗 -->
    <view class="exit-modal" v-if="showExitModal">
      <view class="exit-modal-overlay" @tap="closeExitModal"></view>
      <view class="exit-modal-content">
        <text class="exit-modal-title">退出登录</text>
        <text class="exit-modal-content-text">是否确认退出账号</text>
        <view class="exit-modal-buttons">
          <button class="modal-button cancel-button" @tap="closeExitModal">取消</button>
          <button class="modal-button confirm-button" @tap="confirmExit">退出</button>
        </view>
      </view>
    </view>
  </scroll-view>


  </view>
</template>

<script>
import Matter from 'matter-js'
import { getFocusTags, createFocusTag, updateFocusTag, deleteFocusTag } from '@/utils/request.js'

const { Engine, Bodies, Body, Composite, Constraint, Query } = Matter

const FRAME_INTERVAL = 1000 / 60  // 使用推荐的60fps以避免警告
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
      focusScene: '阅读',
      focusDuration: '75:00',
      // 小鸡信息
      chickenInfo: {
        nickname: '小咕',
        level: 13,
        days: 24,
        weight: 1.0,
        expCurrent: 715,
        expTotal: 1000
      },
      showChickenInfoModal: false, // 是否显示小鸡信息弹窗,
      showFeedModal: false, // 是否显示喂食弹窗
      // 零食数据
      snacks: [
        { name: '三文鱼', type: 'salmon', icon: '🐟', cost: 50, quantity: 34 },
        { name: '牛排', type: 'steak', icon: '🥩', cost: 50, quantity: 50 },
        { name: '巧克力', type: 'chocolate', icon: '🍫', cost: 50, quantity: 100 },
        { name: '烤鸡腿', type: 'chicken', icon: '🍗', cost: 25, quantity: 10 },
        { name: '布丁', type: 'pudding', icon: '🍮', cost: 25, quantity: 4 },
        { name: '汉堡', type: 'burger', icon: '🍔', cost: 25, quantity: 5 }
      ],
      chicks: [],
      chickBodyMap: {}, // 存储body与chick信息的映射
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
      showProfilePage: false, // 是否显示我的页面
      showLogoutModal: false, // 是否显示注销账号弹窗
      showExitModal: false, // 是否显示退出登录弹窗
      showTagSelector: false, // 是否显示标签选择器
      isEditingTags: false, // 是否处于标签编辑模式
      editingTagName: '', // 正在编辑的标签名称
      editingTagIndex: -1, // 正在编辑的标签索引
      showDeleteConfirmDialog: false, // 是否显示删除确认弹窗
      deletingTagIndex: -1, // 正在删除的标签索引
      showCreateTagDialog: false, // 是否显示创建标签对话框
      newTagName: '', // 新标签名称
      COLOR_MAP: { // 颜色映射表
        "1": "#FFCCCC",
        "2": "#CCFFCC", 
        "3": "#CCCCFF",
        "4": "#FFFFCC",
        "5": "#FFCCFF"
      },
      tags: [
        { name: '阅读', colorNumber: 1, selected: true },
        { name: '健身', colorNumber: 2, selected: false },
        { name: '工作', colorNumber: 3, selected: false },
        { name: '专注', colorNumber: 4, selected: false }
      ],

      
      
    }
  },
  onLoad() {
    this.cacheDeviceRatio()
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
    
    // 从本地存储获取用户设置的专注时长
    const savedDuration = uni.getStorageSync('focusDuration');
    if (savedDuration) {
      this.focusDuration = savedDuration;
    }
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
      // 在屏幕可见区域底部附近分布小鸡
      const startY = this.playgroundHeight * 0.8  // 从屏幕80%高度开始，更靠近底部
      const visibleHeight = this.playgroundHeight * 0.15  // 在15%的垂直范围内分布，让小鸡更靠近底部
      // 重置映射表
      this.chickBodyMap = {}
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
        // 使用映射表存储chick信息，避免直接在body对象上添加属性
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
      const height = this.playgroundHeight * 0.95  // 设置物理边界在屏幕95%高度处，更靠近底部
      const floor = Bodies.rectangle(width / 2, height + 20, width, 80, {
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
        // 从映射表中获取chick信息
        const chickInfo = this.chickBodyMap[`chick-${this.chickBodies.indexOf(body)}`] || {};
        return {
          id: chickInfo.id || `chick-${this.chickBodies.indexOf(body)}`,
          expression: chickInfo.expression || 'calm',
          x: body.position.x,
          y: body.position.y,
          radius: body.circleRadius || CHICK_RADIUS,
        }
      })
      
      // 减少日志输出频率，避免刷屏
      // console.log('主页小鸡位置更新:', this.chicks.length, '只小鸡');
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
    handlePlaygroundTouchStart(event) {
      console.log('开始拖拽主页小鸡');
      if (!this.chickBodies.length) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      
      // 检查是否点击到了小鸡
      const hits = Query.point(this.chickBodies, point)
      if (!hits.length) return
      
      const body = hits[0]
      body.isDragging = true
      // 通过chickBodyMap找到对应的chickId
      const chickIndex = this.chickBodies.indexOf(body);
      this.activeChickId = `chick-${chickIndex}`
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
    handlePlaygroundTouchMove(event) {
      if (!this.activeChickId || !this.dragSnapshot) return
      const touch = event.touches && event.touches[0]
      const point = this.getTouchPoint(touch)
      if (!point) return
      
      // 查找正在拖拽的小鸡
      const chickInfo = this.chickBodyMap[this.activeChickId];
      const bodyIndex = Object.keys(this.chickBodyMap).indexOf(this.activeChickId);
      const body = this.chickBodies[bodyIndex];
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
      
      // 添加调试信息输出
      console.log('主页小鸡拖拽中:', point.x, point.y);
    },
    
    // 全局触摸结束事件
    handlePlaygroundTouchEnd(event) {
      console.log('结束拖拽主页小鸡');
      if (this.activeChickId) {
        // 查找正在拖拽的小鸡
        const chickInfo = this.chickBodyMap[this.activeChickId];
        const bodyIndex = Object.keys(this.chickBodyMap).indexOf(this.activeChickId);
        const body = this.chickBodies[bodyIndex];
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
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    handleSceneTap() {
      // 打开标签选择器
      this.showTagSelectorModal()
    },
    handleDurationTap() {
      // 跳转到专注时长配置页面
      uni.navigateTo({
        url: '/pages/focused-duration-config/index'
      })
    },

    // 显示小鸡信息弹窗
    openChickenInfoModal() {
      this.showChickenInfoModal = true
    },

    // 关闭小鸡信息弹窗
    closeChickenInfoModal() {
      this.showChickenInfoModal = false
    },
        

        


    handleStartFocus() {
      // 获取选中的标签作为场景
      const selectedTag = this.tags.find(tag => tag.selected);
      const scene = selectedTag ? selectedTag.name : this.focusScene;
      
      // 跳转到专注计时页面，传递当前设置的专注时长和场景
      // 将 HH:MM 格式转换为分钟数
      const timeParts = this.focusDuration.split(':');
      const durationInMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
      
      uni.navigateTo({
        url: `/pages/focused-timer/index?duration=${durationInMinutes}&scene=${encodeURIComponent(scene)}&from=home`
      })
    },
    

    
    // 显示标签选择器
    async showTagSelectorModal() {
      // 从后端获取标签列表
      await this.loadTagsFromServer();
      this.showTagSelector = true
    },
    
    // 从服务器加载标签列表
    async loadTagsFromServer() {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        const response = await getFocusTags();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 将服务器返回的标签转换为页面使用的格式
          const serverTags = response.data.data || [];
          this.tags = serverTags.map(tag => ({
            name: tag.tagName,
            colorNumber: tag.colorNumber || 1, // 使用后端返回的颜色编号
            selected: false // 默认不选中
          }));
          
          console.log('成功加载标签列表:', this.tags);
        } else {
          console.error('获取标签列表失败:', response.data);
          uni.showToast({
            title: response.data.message || '获取标签失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载标签列表失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    

    
    // 关闭标签选择器
    closeTagSelector() {
      this.showTagSelector = false
      this.isEditingTags = false
      this.editingTagIndex = -1
      this.editingTagName = ''
      this.showDeleteConfirmDialog = false
      this.deletingTagIndex = -1
      this.showCreateTagDialog = false
      this.newTagName = ''
    },
    
    // 关闭注销弹窗
    closeLogoutModal() {
      this.showLogoutModal = false;
    },
    
    // 确认注销
    confirmLogout() {
      uni.showToast({
        title: '账号已注销',
        icon: 'none'
      });
      // 这里可以调用注销账号的API
      // api.logoutAccount();
      
      // 关闭弹窗
      this.showLogoutModal = false;
      
      // 可以跳转到登录页面
      // uni.redirectTo({
      //   url: '/pages/login/index'
      // });
    },
    
    // 关闭退出弹窗
    closeExitModal() {
      this.showExitModal = false;
    },
    
    // 确认退出登录
    confirmExit() {
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      });
      
      // 关闭弹窗
      this.showExitModal = false;
      
      // 可以跳转到登录页面
      // uni.redirectTo({
      //   url: '/pages/login/index'
      // });
    },
    
    // 选择标签
    selectTag(index) {
      // 取消之前选中的标签
      this.tags.forEach(tag => tag.selected = false)
      // 选中当前标签
      this.tags[index].selected = true
      // 更新场景名称
      this.focusScene = this.tags[index].name
      // 关闭选择器
      this.closeTagSelector()
    },
    
    // 创建新标签
    async createNewTag() {
      if (this.isEditingTags) {
        uni.showToast({
          title: '请先完成当前编辑',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: '创建中...'
        });
        
        // 创建默认标签名称
        const newTagName = '新标签';
        const response = await createFocusTag({ tagName: newTagName }); // 只传递tagName，颜色由后端分配
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 重新加载标签列表以获取新创建的标签
          await this.loadTagsFromServer();
          
          // 选中新创建的标签
          const newTag = this.tags.find(tag => tag.name === newTagName);
          if (newTag) {
            // 取消之前选中的标签
            this.tags.forEach(tag => tag.selected = false);
            // 选中新标签
            newTag.selected = true;
          }
          
          uni.showToast({
            title: '标签创建成功',
            icon: 'success'
          });
        } else {
          console.error('创建标签失败:', response.data);
          uni.showToast({
            title: response.data.message || '创建标签失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('创建标签失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 切换编辑模式
    toggleEditMode() {
      this.isEditingTags = true
    },
    
    // 确认编辑标签
    confirmEditTags() {
      this.isEditingTags = false
      this.editingTagIndex = -1
      this.editingTagName = ''
    },
    
    // 开始编辑标签名称
    startEditTagName(index) {
      this.editingTagIndex = index
      this.editingTagName = this.tags[index].name
    },
    
    // 完成编辑标签名称
    async finishEditTagName() {
      if (this.editingTagIndex >= 0 && this.editingTagName.trim() !== '') {
        try {
          uni.showLoading({
            title: '更新中...'
          });
          
          // 获取完整的标签列表以找到标签ID
          const response = await getFocusTags();
          
          if (response.statusCode === 200 && response.data.code === 200) {
            const allTags = response.data.data || [];
            const tagToUpdate = allTags.find(tag => tag.tagName === this.tags[this.editingTagIndex].name);
            
            if (tagToUpdate) {
              const updateResponse = await updateFocusTag(tagToUpdate.tagId, { tagName: this.editingTagName.trim() });
              
              if (updateResponse.statusCode === 200 && updateResponse.data.code === 200) {
                // 重新加载标签列表以获取最新的标签数据
                await this.loadTagsFromServer();
                
                uni.showToast({
                  title: '标签更新成功',
                  icon: 'success'
                });
              } else {
                console.error('更新标签失败:', updateResponse.data);
                uni.showToast({
                  title: updateResponse.data.message || '更新标签失败',
                  icon: 'none'
                });
              }
            } else {
              uni.showToast({
                title: '未找到要更新的标签',
                icon: 'none'
              });
            }
          }
        } catch (error) {
          console.error('更新标签失败:', error);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        } finally {
          this.editingTagIndex = -1;
          this.editingTagName = '';
          uni.hideLoading();
        }
      } else {
        this.editingTagIndex = -1;
        this.editingTagName = '';
      }
    },
    
    // 根据颜色编号获取颜色值
    getColorByNumber(colorNumber) {
      return this.COLOR_MAP[colorNumber] || this.COLOR_MAP["1"]; // 默认返回第一个颜色
    },
    
    // 显示删除确认弹窗
    showDeleteConfirm(index) {
      this.deletingTagIndex = index
      this.showDeleteConfirmDialog = true
    },
    
    // 确认删除标签
    async confirmDeleteTag() {
      if (this.deletingTagIndex >= 0) {
        try {
          uni.showLoading({
            title: '删除中...'
          });
          
          // 获取完整的标签列表以找到标签ID
          const response = await getFocusTags();
          
          if (response.statusCode === 200 && response.data.code === 200) {
            const allTags = response.data.data || [];
            const tagToDelete = allTags.find(tag => tag.tagName === this.tags[this.deletingTagIndex].name);
            
            if (tagToDelete) {
              const deleteResponse = await deleteFocusTag(tagToDelete.tagId);
              
              if (deleteResponse.statusCode === 200 && deleteResponse.data.code === 200) {
                // 重新加载标签列表以获取最新的标签数据
                await this.loadTagsFromServer();
                
                // 如果当前没有标签被选中，选中第一个标签（如果存在）
                if (!this.tags.some(tag => tag.selected) && this.tags.length > 0) {
                  this.tags[0].selected = true;
                  this.focusScene = this.tags[0].name;
                }
                
                uni.showToast({
                  title: '标签删除成功',
                  icon: 'success'
                });
              } else {
                console.error('删除标签失败:', deleteResponse.data);
                uni.showToast({
                  title: deleteResponse.data.message || '删除标签失败',
                  icon: 'none'
                });
              }
            } else {
              uni.showToast({
                title: '未找到要删除的标签',
                icon: 'none'
              });
            }
          }
        } catch (error) {
          console.error('删除标签失败:', error);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        } finally {
          // 重置状态
          this.deletingTagIndex = -1;
          this.showDeleteConfirmDialog = false;
          uni.hideLoading();
        }
      }
    },
    
    // 取消删除
    cancelDelete() {
      this.deletingTagIndex = -1
      this.showDeleteConfirmDialog = false
    },
        
    // 确认创建新标签
    async confirmCreateTag() {
      if (this.newTagName.trim() === '') {
        uni.showToast({
          title: '请输入标签名称',
          icon: 'none'
        })
        return
      }
          
      try {
        uni.showLoading({
          title: '创建中...'
        });
        
        // 创建标签并发送到后端
        const response = await createFocusTag({ 
          tagName: this.newTagName.trim() 
        });
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 重新加载标签列表以获取新创建的标签
          await this.loadTagsFromServer();
          
          // 选中新创建的标签
          const newTag = this.tags.find(tag => tag.name === this.newTagName.trim());
          if (newTag) {
            // 取消之前选中的标签
            this.tags.forEach(tag => tag.selected = false);
            // 选中新标签
            newTag.selected = true;
          }
          
          // 重置状态
          this.newTagName = '';
          this.showCreateTagDialog = false;
          
          uni.showToast({
            title: '标签创建成功',
            icon: 'success'
          });
        } else {
          console.error('创建标签失败:', response.data);
          uni.showToast({
            title: response.data.message || '创建标签失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('创建标签失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
        
    // 取消创建标签
    cancelCreateTag() {
      this.newTagName = ''
      this.showCreateTagDialog = false
    },
    
    // 切换时光模块Tab
    
    

    
    // 喂食小鸡
    feedChicken() {
      this.showFeedModal = true
    },
    
    // 关闭喂食弹窗
    closeFeedModal() {
      this.showFeedModal = false
    },
    
    // 喂食零食
    feedSnack(snack) {
      if (snack.quantity < snack.cost) {
        uni.showToast({
          title: `道具不足，无法喂食${snack.name}`,
          icon: 'none'
        })
        return
      }
      
      // 减少道具数量
      snack.quantity -= snack.cost
      
      // 增加小鸡经验值
      this.chickenInfo.expCurrent += snack.cost
      
      uni.showToast({
        title: `喂食${snack.name}成功，获得${snack.cost}点经验值`,
        icon: 'none'
      })
      
      // 检查是否升级
      if (this.chickenInfo.expCurrent >= this.chickenInfo.expTotal) {
        this.chickenInfo.level++
        this.chickenInfo.expCurrent -= this.chickenInfo.expTotal
        this.chickenInfo.expTotal = Math.floor(this.chickenInfo.expTotal * 1.2) // 下一级经验需求增加20%
        
        uni.showToast({
          title: `恭喜！小鸡升级到Lv.${this.chickenInfo.level}！`,
          icon: 'none'
        })
      }
    },
    
    // 统计模块方法
    

    
    // 跳转到资料编辑页面
    goToProfileEdit() {
      uni.navigateTo({
        url: '/pages/profile-edit/index'
      });
    }
  },
}
</script>

<style>
.page,
.screen {
  height: 100vh;
  min-height: 100vh;
  padding: 0 0 100rpx; /* 只保留底部padding以避免被底部导航栏遮挡 */
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.focus-screen {
  padding-top: 80rpx;
}

.profile-page {
  padding: 0 30rpx 30rpx 30rpx;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 100rpx; /* 为底部tab-bar留出空间 */
  z-index: 100;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  box-sizing: border-box;
  overflow-x: hidden;
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

/* 喂食按钮 */
.feed-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 2rpx solid #FF9800;
  border-radius: 40rpx;
  padding: 15rpx 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feed-button:active {
  transform: scale(0.95);
  background-color: rgba(255, 152, 0, 0.1);
}

.feed-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.feed-text {
  font-size: 28rpx;
  color: #FF9800;
  font-weight: bold;
}

/* 喂食弹窗 */
.feed-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
}

.feed-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.feed-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.feed-header {
  display: flex;
  align-items: center;
  height: 80rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e0e0e0;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333333;
}

.feed-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.snacks-list {
  max-height: 600rpx;
}

.snack-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.snack-item:last-child {
  border-bottom: none;
}

.snack-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
  position: relative;
}

.snack-icon--salmon {
  background-color: #FFA500;
}

.snack-icon--steak {
  background-color: #FF0000;
}

.snack-icon--chocolate {
  background-color: #8B4513;
}

.snack-icon--chicken {
  background-color: #FFA500;
}

.snack-icon--pudding {
  background-color: #FFD700;
}

.snack-icon--burger {
  background-color: #8B4513;
}

.snack-exp {
  position: absolute;
  bottom: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  background-color: #FF9800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #ffffff;
}

.snack-info {
  flex: 1;
}

.snack-name {
  font-size: 32rpx;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.snack-quantity {
  font-size: 24rpx;
  color: #666666;
}

.feed-snack-button {
  width: 120rpx;
  height: 60rpx;
  background-color: #cccccc;
  color: #ffffff;
  border-radius: 30rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-snack-button--disabled {
  background-color: #e0e0e0;
  color: #999999;
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
  align-items: stretch; /* 修改为stretch以适应内容宽度 */
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
  width: 20rpx;
  height: 4rpx;
  background: #ffffff;
  top: 20rpx;
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
  background: linear-gradient(135deg, #1a1a1a, #0f0f0f, #050505);
  opacity: 0.92;
  border-radius: 50%;
  box-shadow: inset 2rpx 2rpx 4rpx rgba(255, 255, 255, 0.1),
              inset -2rpx -2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.walker-fuzz--top {
  width: 70rpx;
  height: 50rpx;
  border-radius: 50%;
  top: -6rpx;
  left: 12rpx;
  animation: fuzz-bob 3s ease-in-out infinite;
  animation-delay: 0.5s;
}

.walker-fuzz--bottom {
  width: 90rpx;
  height: 60rpx;
  border-radius: 50%;
  bottom: -10rpx;
  left: -8rpx;
  animation: fuzz-bob 3.5s ease-in-out infinite;
  animation-delay: 1s;
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

/* 额外的羽毛细节 */
.walker-fuzz-detail {
  position: absolute;
  background: linear-gradient(135deg, #222, #111, #0a0a0a);
  border-radius: 50%;
  opacity: 0.8;
  box-shadow: inset 1rpx 1rpx 2rpx rgba(255, 255, 255, 0.1),
              inset -1rpx -1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.walker-fuzz-detail--1 {
  width: 20rpx;
  height: 16rpx;
  top: 40rpx;
  left: 40rpx;
  animation: fuzz-bob 4s ease-in-out infinite;
  animation-delay: 1.5s;
}

.walker-fuzz-detail--2 {
  width: 16rpx;
  height: 12rpx;
  top: 70rpx;
  left: 60rpx;
  animation: fuzz-bob 3.8s ease-in-out infinite;
  animation-delay: 2s;
}

.walker-fuzz-detail--3 {
  width: 18rpx;
  height: 14rpx;
  top: 90rpx;
  left: 20rpx;
  animation: fuzz-bob 4.2s ease-in-out infinite;
  animation-delay: 0.8s;
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
  position: relative;
  width: 16rpx;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.walker-leg-group--front {
  position: absolute;
  right: 68rpx;
  bottom: 6rpx;
  transform-origin: bottom center;
  animation: leg-walk-front 0.9s ease-in-out infinite;
}

.walker-leg-group--back {
  position: absolute;
  right: 36rpx;
  bottom: 6rpx;
  opacity: 0.7;
  transform-origin: bottom center;
  animation: leg-walk-back 0.9s ease-in-out infinite;
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
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-8rpx) rotate(2deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-6rpx) rotate(-2deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
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

/* 小鸡腿部各部分样式 */
.walker-leg {
  position: relative;
  width: 16rpx;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.walker-thigh {
  width: 14rpx;
  height: 30rpx;
  background: linear-gradient(to bottom, #5d4037, #4e342e);
  border-radius: 6rpx 6rpx 0 0;
  position: relative;
  transform-origin: top center;
  /* 前腿的动画 */
  animation: thigh-anim-front 0.9s ease-in-out infinite;
  will-change: transform;
}

.walker-leg-group--back .walker-thigh {
  animation: thigh-anim-back 0.9s ease-in-out infinite;
}

.walker-shin {
  width: 12rpx;
  height: 30rpx;
  background: linear-gradient(to bottom, #4e342e, #3e2723);
  border-radius: 0 0 4rpx 4rpx;
  position: relative;
  margin-top: 2rpx;
  transform-origin: top center;
  /* 前腿的动画 */
  animation: shin-anim-front 0.9s ease-in-out infinite;
  will-change: transform;
}

.walker-leg-group--back .walker-shin {
  animation: shin-anim-back 0.9s ease-in-out infinite;
}

.walker-foot {
  width: 18rpx;
  height: 8rpx;
  background: #333;
  border-radius: 4rpx;
  position: relative;
  margin-top: 4rpx;
  transform-origin: left center;
  /* 前腿的动画 */
  animation: foot-anim-front 0.9s ease-in-out infinite;
  will-change: transform;
}

.walker-leg-group--back .walker-foot {
  animation: foot-anim-back 0.9s ease-in-out infinite;
}

@keyframes foot-step {
  0% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(10deg);
  }
}

/* 整体腿部走路动画 */
@keyframes leg-walk-front {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-2rpx) rotate(0.5deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@keyframes leg-walk-back {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-2rpx) rotate(-0.5deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

/* 腿部走路动画 - 大腿相对静止，小腿和脚部摆动 */
@keyframes thigh-anim-front {
  0% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
  100% { transform: rotate(-2deg); }
}

@keyframes shin-anim-front {
  0% { transform: rotate(-10deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
  100% { transform: rotate(-10deg); }
}

@keyframes foot-anim-front {
  0% { transform: rotate(5deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

@keyframes thigh-anim-back {
  0% { transform: rotate(2deg); }
  50% { transform: rotate(-2deg); }
  100% { transform: rotate(2deg); }
}

@keyframes shin-anim-back {
  0% { transform: rotate(10deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(10deg); }
}

@keyframes foot-anim-back {
  0% { transform: rotate(-5deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}

/* 羽毛摆动动画 */
@keyframes fuzz-bob {
  0% { transform: translate(0, 0) rotate(0); }
  25% { transform: translate(-1rpx, -1rpx) rotate(-0.5deg); }
  50% { transform: translate(0, 0) rotate(0); }
  75% { transform: translate(1rpx, -1rpx) rotate(0.5deg); }
  100% { transform: translate(0, 0) rotate(0); }
}

/* 标签选择器样式 */
.tag-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.tag-selector-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.tag-selector-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #ffffff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 40rpx;
  box-sizing: border-box;
}

.tag-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.tag-selector-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
}

.more-options-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60rpx;
}

.confirm-edit-button {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.confirm-edit-button:active {
  transform: scale(1.1);
  background-color: #333333;
}

.checkmark {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #000000;
  margin: 0 4rpx;
}

.new-tag-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280rpx;
  height: 100rpx;
  background-color: #ffffff;
  border: 2rpx dashed #e0e0e0;
  border-radius: 50rpx;
  margin-bottom: 40rpx;
  transition: all 0.3s ease;
}

.new-tag-button:active {
  background-color: #f0f0f0;
  border-color: #cccccc;
}

.plus-icon {
  font-size: 50rpx;
  color: #000000;
  margin-right: 15rpx;
}

.new-tag-text {
  font-size: 32rpx;
  color: #000000;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  position: relative;
}

.tags-container::before {
  content: '';
  position: absolute;
  top: -20rpx;
  left: 0;
  right: 0;
  height: 2rpx;
  background-color: #e0e0e0;
  display: none;
}

.tags-container--editing::before {
  display: block;
}

.edit-mode-hint {
  width: 100%;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 20rpx;
  font-style: italic;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  background-color: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 40rpx;
  position: relative;
  transition: all 0.3s ease;
}

.tag-item--editing {
  background-color: #f0f0f0;
  border-color: #cccccc;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.delete-tag-button {
  position: absolute;
  top: -15rpx;
  right: -15rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-tag-button:active {
  transform: scale(1.1);
  background-color: #333333;
}

.minus {
  color: #ffffff;
  font-size: 20rpx;
  font-weight: bold;
}

.tag-input {
  flex: 1;
  font-size: 32rpx;
  color: #000000;
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 2rpx solid #000000;
  padding: 10rpx 0;
  margin-right: 20rpx;
  height: 40rpx;
  line-height: 40rpx;
  vertical-align: middle;
}

.confirm-edit-tag-button {
  margin-left: 20rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.confirm-edit-tag-button:active {
  transform: scale(1.1);
  background-color: #333333;
}

.checkmark-large {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
}

.tag-item--selected {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.tag-item--selected .tag-text {
  color: #ffffff;
}

.tag-dot {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  align-self: center;
}

.tag-text {
  font-size: 32rpx;
  color: #000000;
  height: 40rpx;
  line-height: 40rpx;
  vertical-align: middle;
}

/* 删除确认弹窗样式 */
.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
}

.delete-confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.delete-confirm-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-sizing: border-box;
}

.delete-confirm-text {
  font-size: 28rpx;
  color: #000000;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.delete-confirm-buttons {
  display: flex;
  justify-content: space-between;
}

.delete-button {
  flex: 1;
  height: 80rpx;
  background-color: #000000;
  color: #ffffff;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  margin-right: 20rpx;
}

.cancel-button {
  flex: 1;
  height: 80rpx;
  background-color: #e0e0e0;
  color: #000000;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  margin-left: 20rpx;
}

/* 创建标签对话框样式 */
.create-tag-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1002;
}

.create-tag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.create-tag-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-sizing: border-box;
}

.create-tag-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 40rpx;
}

.tag-name-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  margin-bottom: 40rpx;
  box-sizing: border-box;
}

.tag-name-input:focus {
  border-color: #000000;
}

.create-tag-buttons {
  display: flex;
  justify-content: space-between;
}

.create-button {
  flex: 1;
  height: 80rpx;
  background-color: #000000;
  color: #ffffff;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  margin-right: 20rpx;
}

/* 底部导航栏样式 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #ffffff;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
}

.tab-item--active {
  color: #000000;
}

.tab-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 24rpx;
}

/* 小鸡信息弹窗样式 */
.chicken-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.chicken-info-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.chicken-info-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.chicken-info-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.chicken-nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.chicken-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.chicken-info-footer {
  text-align: center;
}

.view-details-button {
  width: 100%;
  height: 80rpx;
  background-color: #000000;
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 时光模块样式 */
.timeline-content {
  flex: 1;
  width: 100%;
  padding: 0;
  margin: 0;
  margin-top: 0 !important;
}

.timeline-content .tabs {
  display: flex;
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e0e0e0;
  margin-bottom: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.timeline-content .tab {
  flex: 1;
  text-align: center;
  padding: 30rpx;
  box-sizing: border-box;
  min-width: 0; /* 防止内容溢出影响宽度 */
  white-space: nowrap; /* 防止文字换行影响宽度 */
  overflow: hidden; /* 防止内容溢出 */
  border-bottom: 6rpx solid transparent;
}

.timeline-content .tab--profile,
.timeline-content .tab--schedule {
  flex: 1;
  min-width: 0;
}

.timeline-content .tab--active {
  border-bottom-color: #000000;
  font-weight: bold;
}

.timeline-content .tab-text {
  font-size: 32rpx;
  color: #666666;
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 防止文字溢出 */
  text-overflow: ellipsis; /* 文字溢出显示省略号 */
}

.timeline-content .tab--active .tab-text {
  color: #000000;
  font-weight: bold;
}

.timeline-content .tab-content {
  /* 样式已移至内联样式 */
  margin-top: 0 !important;
}

.timeline-content .profile-tab,
.timeline-content .schedule-tab {
  padding: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.timeline-content .profile-section,
.timeline-content .schedule-section,
.timeline-content .calendar-section,
.timeline-content .rules-section {
  background-color: #ffffff;
  border-radius: 0;
  padding: 30rpx 48rpx; /* 保持左右padding以匹配页面整体样式 */
  margin-bottom: 0;
  box-shadow: none;
  width: 100%;
  box-sizing: border-box;
}

/* 小鸡基本信息 */
.timeline-content .chicken-basic-info {
  background-color: #ffffff;
  padding: 30rpx 48rpx;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.timeline-content .chicken-info-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.timeline-content .chicken-nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.timeline-content .chicken-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
}

.timeline-content .stat-item {
  text-align: center;
}

.timeline-content .stat-label {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.timeline-content .stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

/* 等级显示 */
.timeline-content .chicken-level {
  font-size: 28rpx;
  color: #666666;
  margin-left: 10rpx;
}

/* 经验值进度条 */
.experience-progress {
  margin: 20rpx 0;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background-color: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666666;
  text-align: right;
}

.timeline-content .section-header {
  margin-bottom: 20rpx;
}

.timeline-content .section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.timeline-content .growth-chart {
  height: 300rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content .chart-placeholder {
  color: #999999;
  font-size: 28rpx;
}

.timeline-content .focus-stats {
  display: flex;
  justify-content: space-around;
}

.timeline-content .stat-item {
  text-align: center;
}

.timeline-content .stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #000000;
}

.timeline-content .stat-label {
  font-size: 24rpx;
  color: #666666;
}

/* 时光日程样式 */
.schedule-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 28rpx;
  font-weight: normal;
  color: #666666;
  margin: 20rpx 48rpx; /* 保持左右margin以匹配页面整体样式 */
  display: block;
  text-align: left;
}

.record-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  padding: 24rpx 48rpx; /* 保持左右padding以匹配页面整体样式 */
  margin-bottom: 0;
  border-bottom: 1rpx solid #EEEEEE;
  width: 100%;
  box-sizing: border-box;
}

.icon-area {
  margin-right: 24rpx;
}

.couple-icon {
  width: 64rpx;
  height: 64rpx;
  background-color: #FF6B8B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.smiley-icon {
  width: 64rpx;
  height: 64rpx;
  background-color: #4ECDC4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-area {
  flex: 1;
}

.main-text {
  font-size: 32rpx;
  font-weight: normal;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.date-text {
  font-size: 24rpx;
  font-weight: normal;
  color: #999999;
  display: block;
  margin-bottom: 20rpx;
}

.days-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.days-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B8B;
}

.memorial-section .days-number {
  color: #4ECDC4;
}

.days-unit {
  text-align: right;
}

.unit-text {
  font-size: 24rpx;
  font-weight: normal;
  color: #999999;
}

.divider {
  height: 1rpx;
  background-color: #EEEEEE;
  margin: 20rpx 0;
  width: calc(100% + 96rpx); /* 横跨整个页面宽度 */
  margin-left: -48rpx; /* 调整位置以对齐页面边缘 */
}

.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx; /* 考虑底部导航栏的高度 */
  width: 96rpx;
  height: 96rpx;
  background-color: #333333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.add-button:active {
  background-color: #000000;
}

.plus-icon {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: bold;
}

/* 统计模块样式 */
.statistics-content {
  height: calc(100vh - var(--window-bottom) - var(--window-top));
  padding: 20rpx;
  box-sizing: border-box;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

/* 确保内容可以完全滚动 */
.statistics-content ::v-deep .uni-scroll-view-content {
  padding-bottom: 40rpx;
}

/* 页面标题 */
.page-header {
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

/* 状态概览区 */
.status-overview {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 专注卡片 */
.focus-cards {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.focus-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.focus-card--today {
  background-color: #000000;
}

.focus-card--total {
  background-color: #ffffff;
  border: 1rpx solid #000000;
}

.card-label {
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.focus-card--today .card-label {
  color: #ffffff;
}

.focus-card--total .card-label {
  color: #000000;
}

.card-value {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.focus-card--today .card-value {
  color: #ffffff;
}

.focus-card--total .card-value {
  color: #000000;
}

.card-unit {
  font-size: 24rpx;
}

.focus-card--today .card-unit {
  color: #cccccc;
}

.focus-card--total .card-unit {
  color: #666666;
}

/* 失败统计 */
.failure-section {
  display: flex;
  justify-content: space-between;
}

.failure-item {
  display: flex;
  flex-direction: column;
}

.failure-label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.failure-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.failure-value--highlight {
  color: #ff0000;
}

/* 近期专注速览 */
.recent-focus-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.dimension-toggle {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
}

.dimension-text {
  font-size: 28rpx;
  color: #333333;
  margin-right: 10rpx;
}

.arrow-icon {
  font-size: 24rpx;
  color: #666666;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

/* 柱状图 */
.bar-chart {
  height: 400rpx;
}

.chart-container {
  display: flex;
  height: 100%;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 60rpx;
  margin-right: 20rpx;
}

.y-label {
  font-size: 20rpx;
  color: #999999;
}

.chart-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.average-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2rpx;
  border-top: 2rpx dashed #ff0000;
  z-index: 1;
}

.bars-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-top: 20rpx;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar {
  width: 40rpx;
  background-color: #000000;
  border-radius: 8rpx 8rpx 0 0;
  margin-bottom: 10rpx;
}

.bird-icon {
  width: 30rpx;
  height: 30rpx;
  background-color: #FF6B8B;
  border-radius: 50%;
  margin-bottom: 10rpx;
  position: relative;
}

.bird-icon::before {
  content: '';
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  background-color: #000000;
  border-radius: 50%;
  top: 8rpx;
  left: 8rpx;
}

.bar-date {
  font-size: 20rpx;
  color: #666666;
}

/* 标签分布 */
.tag-distribution-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 日期导航 */
.date-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
}

.nav-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
  margin: 0 20rpx;
}

.nav-arrow {
  font-size: 36rpx;
  color: #333333;
}

.current-date {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

/* 维度切换 */
.dimension-switch {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.switch-button {
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.switch-button--active {
  background-color: #e0e0e0;
}

.switch-text {
  font-size: 28rpx;
  color: #333333;
}

/* 环形图 */
.ring-chart-container {
  display: flex;
  margin-bottom: 30rpx;
}

.ring-chart {
  width: 300rpx;
  height: 300rpx;
  position: relative;
  margin-right: 40rpx;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.center-label {
  font-size: 24rpx;
  color: #666666;
}

.chart-sectors {
  width: 100%;
  height: 100%;
  position: relative;
}

.sector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.sector--focus {
  clip-path: polygon(50% 50%, 50% 0%, 80% 20%);
  background-color: #4CAF50;
}

.sector--study {
  clip-path: polygon(50% 50%, 80% 20%, 100% 50%);
  background-color: #2196F3;
}

.sector--reading {
  clip-path: polygon(50% 50%, 100% 50%, 80% 80%);
  background-color: #FF9800;
}

.sector--fitness {
  clip-path: polygon(50% 50%, 80% 80%, 50% 100%);
  background-color: #9C27B0;
}

.sector--work {
  clip-path: polygon(50% 50%, 50% 100%, 20% 80%);
  background-color: #F44336;
}

/* 扇区标签 */
.sector-labels {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.label-item {
  display: flex;
  align-items: center;
}

.label-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  margin-right: 15rpx;
}

.label-color--focus {
  background-color: #4CAF50;
}

.label-color--study {
  background-color: #2196F3;
}

.label-color--reading {
  background-color: #FF9800;
}

.label-color--fitness {
  background-color: #9C27B0;
}

.label-color--work {
  background-color: #F44336;
}

.label-text {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
}

.label-value {
  font-size: 28rpx;
  color: #666666;
}

/* 按天查看 */
.daily-view-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 12rpx;
}

.toggle-text {
  font-size: 28rpx;
  color: #333333;
}

.toggle-arrow {
  font-size: 36rpx;
  color: #666666;
}

/* 我的页面样式 */


/* 用户信息区 */
.user-header {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  overflow: hidden;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: normal;
}

/* 区块样式 */
.settings-section,
.support-section,
.more-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  overflow: hidden;
}

.settings-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: normal;
  margin-bottom: 30rpx;
  display: block;
}

/* 设置项样式 */
.setting-item,
.support-item,
.more-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.setting-item:last-child,
.support-item:last-child,
.more-item:last-child {
  border-bottom: none;
}

.setting-content,
.support-content,
.more-content {
  flex: 1;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-all;
}

.setting-title,
.support-title,
.more-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

.setting-desc,
.support-desc,
.more-desc {
  font-size: 26rpx;
  color: #999999;
  font-weight: normal;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

.arrow {
  color: #cccccc;
  font-size: 32rpx;
  margin-left: 20rpx;
  flex-shrink: 0;
  overflow: hidden;
}

/* 支持我们项特殊样式 */
.support-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  width: 60rpx;
}

/* 特殊处理注销账号项 */
.setting-item:first-child .setting-title {
  color: #ff4757;
}

/* 注销账号弹窗样式 */
.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.logout-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.logout-modal-content {
  position: relative;
  width: 100%;
  max-height: 80vh; /* 限制最大高度 */
  background-color: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 50rpx 30rpx 60rpx 30rpx; /* 减少左右内边距 */
  box-sizing: border-box;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; /* 添加滚动 */
}

.logout-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 30rpx;
  width: 100%;
  flex-shrink: 0; /* 防止收缩 */
  word-wrap: break-word; /* 允许文本换行 */
  word-break: break-all; /* 强制换行 */
}

.logout-modal-content-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 50rpx;
  line-height: 1.5;
  width: 100%;
  flex-shrink: 0; /* 防止收缩 */
  word-wrap: break-word; /* 允许文本换行 */
  word-break: break-all; /* 强制换行 */
}

.logout-modal-buttons {
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-shrink: 0; /* 防止收缩 */
  padding: 0 10rpx; /* 添加按钮区域的左右内边距 */
}

/* 退出登录弹窗样式（与注销账号弹窗样式相同） */
.exit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.exit-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.exit-modal-content {
  position: relative;
  width: 100%;
  max-height: 80vh; /* 限制最大高度 */
  background-color: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 50rpx 30rpx 60rpx 30rpx; /* 减少左右内边距 */
  box-sizing: border-box;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; /* 添加滚动 */
}

.exit-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 30rpx;
  width: 100%;
  flex-shrink: 0; /* 防止收缩 */
  word-wrap: break-word; /* 允许文本换行 */
  word-break: break-all; /* 强制换行 */
}

.exit-modal-content-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 50rpx;
  line-height: 1.5;
  width: 100%;
  flex-shrink: 0; /* 防止收缩 */
  word-wrap: break-word; /* 允许文本换行 */
  word-break: break-all; /* 强制换行 */
}

.exit-modal-buttons {
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-shrink: 0; /* 防止收缩 */
  padding: 0 10rpx; /* 添加按钮区域的左右内边距 */
}

.modal-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  margin: 0 10rpx;
  color: #ffffff;
}

.cancel-button {
  background-color: #cccccc; /* 灰色按钮 */
}

.cancel-button:active {
  background-color: #bbbbbb;
}

.confirm-button {
  background-color: #000000; /* 黑色按钮 */
}

.confirm-button:active {
  background-color: #333333;
}

</style>

