<template>
  <view class="container">
    <!-- Tab导航 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'profile' }"
        @tap="switchInternalTab('profile')"
      >
        <text class="tab-text">小鸡档案</text>
      </view>
      <view 
        class="tab" 
        :class="{ 'tab--active': activeTab === 'schedule' }"
        @tap="switchInternalTab('schedule')"
      >
        <text class="tab-text">时光日程</text>
      </view>
    </view>
    
    <!-- Tab内容 -->
    <view class="tab-content">
      <!-- 小鸡档案Tab -->
      <view v-if="activeTab === 'profile'" class="profile-tab">
        <!-- 可展开的角色基本信息和小鸡信息 -->
        <view class="profile-section character-info-expandable">
          <view class="character-header" @tap="toggleChickenInfo">
            <view class="character-name-container">
              <text class="character-name" @tap.stop="editChickenName">{{ chickenInfo.nickname }}</text>
              <text class="character-level">Lv.{{ chickenInfo.level }}</text>
            </view>
            <view class="expand-icon" :class="{ 'expand-icon--rotated': showDetailedChickenInfo }">
              <text>﹀</text>
            </view>
          </view>
          <view class="progress-container">
            <view class="progress-bar-container">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: (chickenInfo.expCurrent / chickenInfo.expTotal * 100) + '%' }"></view>
              </view>
              <text class="progress-text">{{ chickenInfo.expCurrent }}/{{ chickenInfo.expTotal }}</text>
              <!-- 升级按钮，当经验值满时显示 -->
              <button v-if="chickenInfo.expCurrent >= chickenInfo.expTotal && chickenInfo.expTotal > 0" 
                class="upgrade-btn" 
                @tap="upgradeChicken">
                升级
              </button>
            </view>
          </view>
          <view class="character-stats">
            <view class="stat-item">
              <text class="stat-label">年龄</text>
              <text class="stat-value">{{ chickenInfo.days }}天</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">体重</text>
              <text class="stat-value">{{ chickenInfo.weight }} kg</text>
            </view>
          </view>
          
          <!-- 展开的小鸡详细信息 -->
          <view class="chicken-stats-detail" :class="{ 'chicken-stats-detail--visible': showDetailedChickenInfo }">
            <view class="chicken-stats-grid">
              <view class="stat-item">
                <text class="stat-label">小鸡名称</text>
                <text class="stat-value">{{ chickenStats.name || '无名小鸡' }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">成长阶段</text>
                <text class="stat-value">{{ chickenStats.growthStage || '未知' }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">等级</text>
                <text class="stat-value">{{ chickenStats.level || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">经验值</text>
                <text class="stat-value">{{ chickenStats.exp || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">快乐度</text>
                <text class="stat-value">{{ chickenStats.happiness || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">健康度</text>
                <text class="stat-value">{{ chickenStats.health || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">饥饿度</text>
                <text class="stat-value">{{ chickenStats.hunger || 0 }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">品种</text>
                <text class="stat-value">{{ chickenStats.breed || '未知' }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="profile-section feed-stats-section">
          <view class="section-header" @tap="toggleFeedDetails">
            <text class="section-title">喂养记录</text>
            <view class="expand-icon" :class="{ 'expand-icon--rotated': showFeedDetails }">
              <text>﹀</text>
            </view>
          </view>
          <view class="feed-stats-container" :class="{ 'feed-stats-container--visible': showFeedDetails }">
            <view class="stats-summary">
              <view class="stat-item-large">
                <text class="stat-label-large">总喂食次数</text>
                <text class="stat-value-large">{{ feedStats.totalFeedCount || 0 }}</text>
              </view>
              <view class="stat-item-large">
                <text class="stat-label-large">总快乐度提升</text>
                <text class="stat-value-large">{{ feedStats.totalHappinessGained || 0 }}</text>
              </view>
              <view class="stat-item-large">
                <text class="stat-label-large">总经验获得</text>
                <text class="stat-value-large">{{ feedStats.totalExpGained || 0 }}</text>
              </view>
            </view>
            
            <view class="recent-feeds">
              <text class="section-subtitle">近期喂养</text>
              <view class="feed-item" v-for="(feed, index) in feedStats.recentFeeds || []" :key="index">
                <view class="feed-icon">{{ getFoodIcon(feed.foodName) }}</view>
                <view class="feed-info">
                  <text class="feed-food">{{ feed.foodName }} ×{{ feed.quantity }}</text>
                  <text class="feed-details">+{{ feed.happinessGained }}快乐 +{{ feed.expGained }}经验</text>
                </view>
                <view class="feed-time">{{ formatDateTime(feed.createTime) }}</view>
              </view>
              
              <view v-if="!(feedStats.recentFeeds && feedStats.recentFeeds.length)" class="empty-feeds">
                <text class="empty-text">暂无喂养记录</text>
              </view>
            </view>
            
            <view class="food-stats">
              <text class="section-subtitle">食物统计</text>
              <view class="food-stat-item" v-for="(count, foodName) in feedStats.foodStatistics || {}" :key="foodName">
                <text class="food-name">{{ foodName }}</text>
                <text class="food-count">{{ count }}</text>
              </view>
              
              <view v-if="!(feedStats.foodStatistics && Object.keys(feedStats.foodStatistics).length)" class="empty-food-stats">
                <text class="empty-text">暂无食物统计</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 治疗记录部分 -->
        <view class="profile-section medicine-history-section">
          <view class="section-header" @tap="toggleMedicineDetails">
            <text class="section-title">治疗记录</text>
            <view class="expand-icon" :class="{ 'expand-icon--rotated': showMedicineDetails }">
              <text>﹀</text>
            </view>
          </view>
          <view class="medicine-history-container" :class="{ 'medicine-history-container--visible': showMedicineDetails }">
            <view class="stats-summary">
              <view class="stat-item-large">
                <text class="stat-label-large">总治疗次数</text>
                <text class="stat-value-large">{{ medicineStats.totalMedicineCount || 0 }}</text>
              </view>
              <view class="stat-item-large">
                <text class="stat-label-large">总效果提升</text>
                <text class="stat-value-large">{{ medicineStats.totalEffectGained || 0 }}</text>
              </view>
            </view>
            
            <view class="recent-medicines">
              <text class="section-subtitle">近期治疗</text>
              <view class="medicine-item" v-for="(medicine, index) in medicineStats.recentMedicines || []" :key="index">
                <view class="medicine-icon">💊</view>
                <view class="medicine-info-flex">
                  <view class="medicine-info">
                    <text class="medicine-name">{{ medicine.medicineName }} ×{{ medicine.quantity || 1 }}</text>
                    <text class="medicine-details">+{{ medicine.effectValue }}{{ getEffectTypeName(medicine.effectType) }}</text>
                  </view>
                  <view class="medicine-time-small">{{ formatDateTime(medicine.createTime) }}</view>
                </view>
              </view>
              
              <view v-if="!(medicineStats.recentMedicines && medicineStats.recentMedicines.length)" class="empty-medicines">
                <text class="empty-text">暂无治疗记录</text>
              </view>
            </view>
            
            <view class="medicine-stats">
              <text class="section-subtitle">药品统计</text>
              <view class="medicine-stat-item" v-for="(count, medicineName) in medicineStats.medicineStatistics || {}" :key="medicineName">
                <view class="medicine-name-and-count">
                  <text class="medicine-name-small">{{ medicineName }}</text>
                  <text class="medicine-count-right">{{ count }}</text>
                </view>
              </view>
              
              <view v-if="!(medicineStats.medicineStatistics && Object.keys(medicineStats.medicineStatistics).length)" class="empty-medicine-stats">
                <text class="empty-text">暂无药品统计</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="profile-section chat-section">
          <view class="section-header">
            <text class="section-title">与小鸡聊天</text>
          </view>
          <view class="chat-container">
            <scroll-view 
              class="chat-messages" 
              id="chatMessages" 
              scroll-y="true" 
              :scroll-top="chatScrollTop"
              :scroll-with-animation="true"
            >
              <view class="message-item" v-for="(msg, index) in chatMessages" :key="index" :class="{ 'user-message': msg.sender === 'user', 'chicken-message': msg.sender === 'chicken' }">
                <view class="message-content">
                  <text class="message-text">{{ msg.text }}</text>
                  <text class="message-time">{{ msg.time }}</text>
                </view>
              </view>
            </scroll-view>
            <view class="chat-input-area">
              <input 
                class="chat-input" 
                v-model="currentMessage" 
                placeholder="对小鸡说点什么吧~" 
                @confirm="sendChatMessage"
              />
              <button class="send-button" @tap="sendChatMessage">发送</button>
            </view>
          </view>
        </view>
        
        
      </view>
      
      <!-- 时光日程Tab -->
      <view v-if="activeTab === 'schedule'" class="schedule-tab">
        
        <!-- 三行两列表格布局 -->
        <view class="schedule-table">
          
          <!-- 倒数日行 -->
          <view class="table-row">
            <view class="table-cell title-cell">
              <text class="section-title">倒数日</text>
            </view>
            <view class="table-cell content-cell countdown-cell">
              <scroll-view class="scroll-container" scroll-y="true" show-scrollbar="true" enable-back-to-top="true" scroll-with-animation="true">
                <view class="schedule-list">
                  <view v-for="schedule in countdownSchedules" :key="schedule.id" class="record-card countdown-record">
                    <view class="icon-area">
                      <view class="couple-icon" :style="{ backgroundColor: schedule.themeColor }"></view>
                    </view>
                    <view class="info-area">
                      <text class="main-text">{{ schedule.title }}</text>
                      <text class="date-text">{{ schedule.targetDate }}</text>
                      <view class="days-area">
                        <text class="days-number">{{ schedule.daysLeft }}</text>
                        <view class="days-unit">
                          <text class="unit-text">DAYS</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 如果没有倒数日日程，显示提示信息 -->
                <view v-if="countdownSchedules.length === 0" class="empty-schedule">
                  <text class="empty-text">暂无倒数日日程</text>
                </view>
              </scroll-view>
            </view>
          </view>
          
          <!-- 纪念日行 -->
          <view class="table-row">
            <view class="table-cell title-cell">
              <text class="section-title">纪念日</text>
            </view>
            <view class="table-cell content-cell memorial-cell">
              <scroll-view class="scroll-container" scroll-y="true" show-scrollbar="true" enable-back-to-top="true" scroll-with-animation="true">
                <view class="schedule-list">
                  <view v-for="schedule in anniversarySchedules" :key="schedule.id" class="record-card memorial-record">
                    <view class="icon-area">
                      <view class="smiley-icon" :style="{ backgroundColor: schedule.themeColor }"></view>
                    </view>
                    <view class="info-area">
                      <text class="main-text">{{ schedule.title }}</text>
                      <text class="date-text">{{ schedule.targetDate }}</text>
                      <view class="days-area">
                        <text class="days-number">{{ schedule.daysSince }}</text>
                        <view class="days-unit">
                          <text class="unit-text">DAYS</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 如果没有纪念日日程，显示提示信息 -->
                <view v-if="anniversarySchedules.length === 0" class="empty-schedule">
                  <text class="empty-text">暂无纪念日日程</text>
                </view>
              </scroll-view>
            </view>
          </view>
          
          <!-- 每日任务行 (内容区域更大) -->
          <view class="task-row">
            <view class="table-cell title-cell">
              <text class="section-title">每日任务</text>
            </view>
            <view class="table-cell content-cell task-cell">
              <view class="task-content">
                <scroll-view class="task-scroll-container" scroll-y="true" show-scrollbar="true" enable-back-to-top="true">
                  <!-- 未完成的任务 -->
                  <view class="task-list">
                    <view class="task-item" v-for="task in uncompletedTasks" :key="task.id">
                      <view class="task-info">
                        <text class="task-title">{{ task.title }}</text>
                        <text class="task-desc">{{ task.description }}</text>
                      </view>
                      <view class="task-reward">
                        <button class="task-complete-btn" :class="{ 'completed': task.completed, 'claimed': task.status === 'claimed' }" @tap.stop="claimTaskReward(task)">
                          {{ task.status === 'claimed' ? '已领取' : (task.completed ? '领取奖励' : '未完成') }}
                        </button>
                      </view>
                    </view>
                    
                    <!-- 已完成的任务 -->
                    <view class="task-item completed-task" v-for="task in completedTasks" :key="task.id">
                      <view class="task-info">
                        <text class="task-title completed">{{ task.title }}</text>
                        <text class="task-desc completed">{{ task.description }}</text>
                      </view>
                      <view class="task-reward">
                        <button class="task-complete-btn" :class="{ 'completed': task.completed, 'claimed': task.status === 'claimed' }" @tap.stop="claimTaskReward(task)">
                          {{ task.status === 'claimed' ? '已领取' : (task.completed ? '领取奖励' : '未完成') }}
                        </button>
                      </view>
                    </view>
                    
                    <!-- 如果没有每日任务，显示提示信息 -->
                    <view v-if="dailyTasks.length === 0" class="empty-task">
                      <text class="empty-text">暂无每日任务</text>
                    </view>
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 添加按钮 -->
        <view class="add-button" @tap="goToCreatePage">
          <text class="plus-icon">+</text>
        </view>
      </view>
    </view>
    
    <!-- 名称编辑弹窗 -->
    <view class="name-edit-modal" v-if="showNameEditModal">
      <view class="name-edit-modal-overlay" @tap="closeNameEditModal"></view>
      <view class="name-edit-modal-content">
        <text class="name-edit-modal-title">修改小鸡名称</text>
        <input 
          class="name-edit-input" 
          v-model="newNickname" 
          placeholder="请输入新的小鸡名称" 
          @confirm="confirmNameEdit"
          maxlength="20"
        />
        <view class="name-edit-modal-buttons">
          <button class="modal-button cancel-button" @tap="closeNameEditModal">取消</button>
          <button class="modal-button confirm-button" @tap="confirmNameEdit">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getSchedules, request, getChickenStats, interactWithChicken, levelUpChicken, getChickenFeedStats, getMedicineList, getMedicineHistory, getTodayMissions, claimMissionReward, getMissionStats } from '@/utils/request.js';
import { getColorByNumber } from '@/utils/colorUtils.js';

export default {
  data() {
    return {
      activeTab: 'profile', // 默认激活小鸡档案tab
      chickenInfo: {
        nickname: '小咕',
        level: 0,
        expCurrent: 0,
        expTotal: 0,
        days: 0,
        weight: 0,
        focusHours: 0,
        focusDays: 0
      },
      showNameEditModal: false,
      newNickname: '',
      // 聊天相关数据
      chatMessages: [],
      currentMessage: '',
      chatScrollTop: 0,
      // 日程相关数据
      countdownSchedules: [], // 倒数日日程列表
      anniversarySchedules: [], // 纪念日日程列表
      loadingSchedules: false, // 是否正在加载日程
      // 每日任务相关数据
      dailyTasks: [], // 从后端获取的每日任务列表
      uncompletedTasks: [], // 未完成的任务
      completedTasks: [], // 已完成的任务
      missionStats: {}, // 任务统计信息
      loadingMissions: false, // 任务加载状态
      scrollTop: 0, // 滚动位置

      // 小鸡统计数据
      chickenStats: {}, // 小鸡统计信息
      showDetailedChickenInfo: false, // 是否显示详细小鸡信息
      // 喂养记录数据
      feedStats: {}, // 喂养统计信息
      showFeedDetails: false, // 是否显示喂养详情
      // 治疗记录数据
      medicineStats: {}, // 治疗统计信息
      showMedicineDetails: false // 是否显示治疗详情
    }
  },
  
  async onLoad() {
    // 初始化聊天消息
    this.chatMessages = [
      {
        text: '你好！我是小咕，很高兴和你聊天！',
        sender: 'chicken',
        time: this.formatTime(new Date())
      }
    ];
    
    // 获取小鸡统计数据
    await this.loadChickenStats();
    
    // 获取喂养记录
    await this.loadFeedStats();
    
    // 获取每日任务
    await this.loadDailyTasks();
    
    // 获取治疗记录
    await this.loadMedicineHistory();
  },
  
  methods: {
    // 加载喂养记录
    async loadFeedStats() {
      try {
        const response = await getChickenFeedStats();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          this.feedStats = response.data.data || {};
        } else {
          console.error('获取喂养记录失败:', response);
          uni.showToast({
            title: response.data.message || '获取喂养记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取喂养记录时出错:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    },
    
    // 加载治疗记录
    async loadMedicineHistory() {
      try {
        const response = await getMedicineHistory();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          const rawMedicineHistory = response.data.data || [];
          
          // 获取药品列表，用于获取药品名称
          const medicineListResponse = await getMedicineList();
          let allMedicines = [];
          if (medicineListResponse.statusCode === 200 && medicineListResponse.data.code === 200) {
            const medicineData = medicineListResponse.data.data;
            allMedicines = Array.isArray(medicineData.list) ? medicineData.list : (Array.isArray(medicineData) ? medicineData : []);
          }
          
          // 处理治疗记录数据
          const processedHistory = rawMedicineHistory.map(record => {
            // 根据 medicineId 查找药品名称
            const medicine = allMedicines.find(med => med.medicineId === record.medicineId);
            return {
              ...record,
              medicineName: medicine ? medicine.name : '未知药品',
              createTime: record.useTime || record.createTime // 使用 useTime 作为显示时间
            };
          });
          
          // 计算统计数据
          const totalMedicineCount = processedHistory.length;
          const totalEffectGained = processedHistory.reduce((sum, record) => sum + (record.effectValue || 0), 0);
          
          // 按药品名称统计
          const medicineStatistics = {};
          processedHistory.forEach(record => {
            const name = record.medicineName;
            medicineStatistics[name] = (medicineStatistics[name] || 0) + 1;
          });
          
          this.medicineStats = {
            totalMedicineCount,
            totalEffectGained,
            recentMedicines: processedHistory,
            medicineStatistics
          };
        } else {
          console.error('获取治疗记录失败:', response);
          uni.showToast({
            title: response.data.message || '获取治疗记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取治疗记录时出错:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    },
    
    // 获取效果类型的中文名称
    getEffectTypeName(effectType) {
      const effectTypes = {
        'energy': '能量',
        'health': '健康',
        'happiness': '快乐',
        'exp': '经验',
        'strength': '体力',
        'focus': '专注',
        'growth': '成长'
      };
      
      return effectTypes[effectType] || effectType;
    },
    
    // 切换喂养详情显示
    toggleFeedDetails() {
      this.showFeedDetails = !this.showFeedDetails;
    },
    
    // 切换治疗详情显示
    toggleMedicineDetails() {
      this.showMedicineDetails = !this.showMedicineDetails;
    },
    
    // 获取食物图标
    getFoodIcon(foodName) {
      const foodIcons = {
        '谷物饼干': '🌾',
        '蔬菜': '🥬',
        '水果': '🍎',
        '虫子': '🐛',
        '小鱼': '🐟',
        '面包': '🍞',
        '米饭': '🍚',
        '肉类': '🍗',
        '奶制品': '🥛',
        '零食': '🍿',
        '糖果': '🍬',
        '坚果': '🥜',
        '沙拉': '🥗',
        '汤': '🍲',
        '鸡蛋': '🥚',
        '默认': '🍗'
      };
      
      return foodIcons[foodName] || foodIcons['默认'];
    },
    
    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      
      try {
        const date = new Date(dateTimeStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hour}:${minute}`;
      } catch (error) {
        console.error('日期格式化错误:', error);
        return dateTimeStr;
      }
    },
    
    // 切换小鸡详细信息显示
    toggleChickenInfo() {
      this.showDetailedChickenInfo = !this.showDetailedChickenInfo;
    },
    
    // 加载小鸡统计数据
    async loadChickenStats() {
      try {
        const response = await getChickenStats();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          this.chickenStats = response.data.data || {};
          
          // 同步数据到 chickenInfo 以确保视图显示真实数据
          this.chickenInfo.level = this.chickenStats.level || 0;
          // 计算当前等级的经验值（每100经验值为一个等级）
          // 如果知道升级所需经验，使用该值作为当前等级的总经验
          if (this.chickenStats.expToNextLevel) {
            // 保持原始经验值，用于升级判断
            const rawExp = this.chickenStats.exp;
            // 当经验值达到或超过升级所需经验时，显示为满值（100）
            this.chickenInfo.expCurrent = Math.min(rawExp % this.chickenStats.expToNextLevel, 100);
            // 如果当前经验值正好等于升级所需经验，则显示为100%
            if (rawExp >= this.chickenStats.expToNextLevel && rawExp % this.chickenStats.expToNextLevel === 0) {
              this.chickenInfo.expCurrent = this.chickenStats.expToNextLevel;
            }
            this.chickenInfo.expTotal = this.chickenStats.expToNextLevel;
          } else {
            // 如果不知道升级所需经验，默认每100经验值升一级
            const rawExp = this.chickenStats.exp;
            // 当经验值达到或超过100时，显示为满值（100）
            this.chickenInfo.expCurrent = Math.min(rawExp % 100, 100);
            // 如果当前经验值正好是100的倍数且大于0，则显示为100%
            if (rawExp >= 100 && rawExp % 100 === 0) {
              this.chickenInfo.expCurrent = 100;
            }
            this.chickenInfo.expTotal = 100; // 每个等级固定100经验值
          }
          this.chickenInfo.nickname = this.chickenStats.name || '小咕';
          this.chickenInfo.days = this.chickenStats.age || 0;
          this.chickenInfo.weight = this.chickenStats.weight || 0;
        } else {
          console.error('获取小鸡统计数据失败:', response);
        }
      } catch (error) {
        console.error('获取小鸡统计数据时出错:', error);
      }
    },
    
    // 切换内部tab
    switchInternalTab(tab) {
      this.activeTab = tab
      
      // 如果切换到日程tab，则获取日程列表
      if (tab === 'schedule') {
        this.loadSchedules();
      }
      
      // 如果切换到小鸡档案tab，则刷新小鸡统计数据和喂养记录
      if (tab === 'profile') {
        this.loadChickenStats();
        this.loadFeedStats();
      }
    },
    
    // 加载日程列表
    async loadSchedules() {
      if (this.loadingSchedules) return; // 防止重复加载
      
      this.loadingSchedules = true;
      
      try {
        const response = await getSchedules();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          const schedules = response.data.data || [];
          
          // 清空现有数据
          this.countdownSchedules = [];
          this.anniversarySchedules = [];
          
          // 解析日程数据
          schedules.forEach(schedule => {
            // 解析日期
            const targetDate = new Date(schedule.targetDate);
            
            // 计算天数差异
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 设置时间为当天0点
            const targetDateOnly = new Date(targetDate);
            targetDateOnly.setHours(0, 0, 0, 0); // 设置时间为目标日期的0点
            
            // 计算天数差异
            const timeDiff = targetDateOnly.getTime() - today.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            // 格式化日期显示
            const formattedDate = this.formatDateWithWeekday(targetDate);
            
            // 根据类型处理日程
            const scheduleData = {
              id: schedule.scheduleId,
              title: schedule.title,
              description: schedule.description,
              targetDate: formattedDate,
              dayDiff: Math.abs(dayDiff), // 显示绝对值
              isPast: dayDiff < 0, // 是否是过去的日期
              isCompleted: schedule.isCompleted,
              themeColor: getColorByNumber(schedule.themeColor),
              themeColorNumber: schedule.themeColor,
              originalDate: targetDate,
              originalDayDiff: dayDiff // 保存原始天数差异用于判断
            };
            
            if (schedule.type === 'countdown') {
              // 倒数日：显示距离目标日期还有多少天
              scheduleData.daysLeft = dayDiff > 0 ? dayDiff : 0;
              this.countdownSchedules.push(scheduleData);
            } else if (schedule.type === 'anniversary') {
              // 纪念日：显示从目标日期到今天已经过去了多少天
              scheduleData.daysSince = dayDiff <= 0 ? Math.abs(dayDiff) : 0;
              this.anniversarySchedules.push(scheduleData);
            }
          });
        } else {
          console.error('获取日程列表失败:', response);
          uni.showToast({
            title: '获取日程失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载日程时出错:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.loadingSchedules = false;
      }
    },
          
    // 升级小鸡
    async upgradeChicken() {
      try {
        uni.showLoading({
          title: '升级中...'
        });
              
        const response = await levelUpChicken();
              
        if (response.statusCode === 200 && response.data.code === 200) {
          uni.showToast({
            title: '升级成功！',
            icon: 'success'
          });
                
          // 重新加载小鸡统计数据以更新等级信息
          await this.loadChickenStats();
        } else {
          uni.showToast({
            title: response.data.message || '升级失败',
            icon: 'none'
          });
          console.error('升级小鸡失败:', response);
        }
      } catch (error) {
        console.error('升级小鸡请求失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 格式化日期为 YYYY.MM.DD 星期X 的格式
    formatDateWithWeekday(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[date.getDay()];
      
      return `${year}.${month}.${day} ${weekday}`;
    },
    
    // 跳转到创建页面
    goToCreatePage() {
      // 这里可以传递参数区分默认选中状态
      uni.navigateTo({
        url: '/pages/create-time/index' // 假设创建页面路径
      })
    },
    
    // 编辑小鸡名称
    editChickenName() {
      this.showNameEditModal = true;
      this.newNickname = this.chickenInfo.nickname;
    },
    
    // 关闭名称编辑弹窗
    closeNameEditModal() {
      this.showNameEditModal = false;
    },
    
    // 确认修改名称
    async confirmNameEdit() {
      if (this.newNickname.trim() !== '') {
        try {
          // 调用小鸡重命名接口
          const response = await request({
            url: '/api/chicken/rename',
            method: 'POST',
            data: {
              newName: this.newNickname.trim()
            }
          });
          
          if (response.statusCode === 200 && response.data.code === 200) {
            // 更新本地显示的昵称
            this.chickenInfo.nickname = this.newNickname.trim();
            
            // 添加昵称修改通知
            this.chatMessages.push({
              text: '昵称已更新为：' + this.chickenInfo.nickname,
              sender: 'chicken',
              time: this.formatTime(new Date())
            });
            
            uni.showToast({
              title: '名称修改成功',
              icon: 'success'
            });
          } else {
            console.error('重命名失败:', response);
            uni.showToast({
              title: response.data.message || '重命名失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('重命名请求失败:', error);
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
        } finally {
          this.showNameEditModal = false;
        }
      } else {
        uni.showToast({
          title: '名称不能为空',
          icon: 'none'
        });
      }
    },
    
    // 格式化时间
    formatTime(date) {
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${hour}:${minute}`;
    },
    
    // 发送聊天消息
    async sendChatMessage() {
      if (!this.currentMessage.trim()) {
        return;
      }
      
      // 添加用户消息
      const userMessage = {
        text: this.currentMessage,
        sender: 'user',
        time: this.formatTime(new Date())
      };
      this.chatMessages.push(userMessage);
      
      // 清空输入框
      const message = this.currentMessage;
      this.currentMessage = '';
      
      // 调用小鸡互动接口 - 和小鸡聊天
      try {
        const response = await interactWithChicken({
          interactionType: 'talk'
        });
        
        if (response.statusCode === 200 && response.data.code === 200) {
          console.log('小鸡聊天互动成功:', response.data.message);
        } else {
          console.error('小鸡聊天互动失败:', response);
        }
      } catch (error) {
        console.error('调用小鸡聊天互动接口失败:', error);
      }
      
      // 模拟小鸡回复
      setTimeout(() => {
        const responses = [
          '咕咕咕~ 你说得对！',
          '真有趣，能再告诉我多一点吗？',
          '我最喜欢听你说话了！',
          '专注学习真是一件快乐的事情呢！',
          '今天你学到了什么新知识吗？',
          '我们一起加油吧！',
          '你真是个有趣的人呢！',
          '我陪着你，一起成长吧！',
          '你今天的专注时长很棒哦！',
          '继续保持专注，你一定可以的！'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const chickenMessage = {
          text: randomResponse,
          sender: 'chicken',
          time: this.formatTime(new Date())
        };
        this.chatMessages.push(chickenMessage);
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 1000);
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        // 更新scrollTop以滚动到底部
        const timestamp = new Date().getTime();
        this.chatScrollTop = timestamp; // 使用时间戳作为唯一值来触发滚动
      });
    },
    
    // 完成任务
    completeTask(task) {
      if (task.completed) return; // 如果任务已完成，则不执行
      
      // 更新任务状态
      task.completed = true;
      
      // 显示奖励提示
      uni.showToast({
        title: `任务完成！获得${task.reward}谷物币`,
        icon: 'success',
        duration: 2000
      });
      
      // 这里可以添加增加谷物币的逻辑
      this.updateUserCoins(task.reward);
    },
    
    // 更新用户谷物币
    updateUserCoins(reward) {
      // 这里可以调用API更新用户谷物币
      console.log(`用户获得${reward}谷物币`);
      
      // 如果有用户信息，可以更新本地存储
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        userInfo.coins = (userInfo.coins || 0) + reward;
        uni.setStorageSync('userInfo', userInfo);
      }
    },
    
    // 加载每日任务
    async loadDailyTasks() {
      if (this.loadingMissions) return; // 防止重复加载
      
      this.loadingMissions = true;
      
      try {
        const response = await getTodayMissions();
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 处理任务数据
          const tasks = response.data.data || [];
          
          // 转换后端数据格式为页面使用的格式
          this.dailyTasks = tasks.map(task => ({
            id: task.missionId || task.id,
            title: task.title || task.name || '任务',
            description: task.description || '任务描述',
            reward: task.reward || task.coins || 0,
            completed: task.completed || task.isCompleted || false,
            status: task.status || 'available' // 任务状态：available, completed, claimed
          }));
          
          // 分离已完成和未完成的任务
          this.separateTasks();
          
          console.log('获取每日任务成功:', this.dailyTasks);
        } else {
          console.error('获取每日任务失败:', response.data);
          uni.showToast({
            title: response.data.message || '获取任务失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载每日任务时出错:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.loadingMissions = false;
      }
    },
    
    // 领取任务奖励
    async claimTaskReward(task) {
      if (task.completed !== true || task.status === 'claimed') {
        uni.showToast({
          title: '任务未完成或奖励已领取',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({
          title: '领取中...'
        });
        
        const response = await claimMissionReward(task.id);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          uni.showToast({
            title: `奖励领取成功！获得${task.reward}谷物币`,
            icon: 'success'
          });
          
          // 更新任务状态
          task.status = 'claimed';
          task.completed = true; // 标记为已完成
          
          // 更新用户金币
          this.updateUserCoins(task.reward);
          
          // 重新分离任务列表
          this.updateTaskStatus();
        } else {
          uni.showToast({
            title: response.data.message || '领取失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('领取任务奖励失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 刷新任务
    async refreshTasks() {
      await this.loadDailyTasks();
    },
    
    // 分离已完成和未完成的任务
    separateTasks() {
      this.uncompletedTasks = this.dailyTasks.filter(task => !task.completed);
      this.completedTasks = this.dailyTasks.filter(task => task.completed);
    },
    
    // 更新任务状态后重新分离
    updateTaskStatus() {
      this.separateTasks();
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
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





.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 30rpx;
  text-align: center;
  border-bottom: 6rpx solid transparent;
}

.tab--active {
  border-bottom-color: #000000;
}

.tab-text {
  font-size: 32rpx;
  color: #666666;
}

.tab--active .tab-text {
  color: #000000;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.profile-tab,
.schedule-tab {
  padding: 30rpx;
}

.profile-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}



.growth-chart {
  height: 300rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: #999999;
  font-size: 28rpx;
}

.focus-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #000000;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}


.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}


/* 角色信息样式 */
.character-info {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  color: #333333;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e0e0e0;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.character-name-container {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.character-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
}

.character-level {
  font-size: 28rpx;
  background-color: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  color: #666666;
}



.progress-container {
  margin-bottom: 20rpx;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.progress-bar {
  height: 20rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
  flex: 1;
}

.progress-fill {
  height: 100%;
  background-color: rgba(255, 107, 139, 0.7);
  border-radius: 10rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666666;
}

.upgrade-btn {
  margin-left: 20rpx;
  padding: 8rpx 20rpx;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.character-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 5rpx;
}

.stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #000000;
}

/* 角色基本信息可展开区域 */
.character-info-expandable {
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.expand-icon {
  font-size: 32rpx;
  color: #999;
  transition: transform 0.3s ease;
}

.expand-icon--rotated {
  transform: rotate(180deg);
}

.chicken-stats-detail {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.chicken-stats-detail--visible {
  max-height: 1000rpx; /* 足够大的值以容纳内容 */
}

.chicken-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

/* 聊天界面样式 */
.chat-section {
  padding: 30rpx;
  min-height: 400rpx;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 350rpx;
}

.chat-messages {
  flex: 1;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  max-height: 250rpx; /* 设置最大高度，为输入框留出空间 */
  min-height: 100rpx; /* 确保最小高度 */
}

.message-item {
  margin-bottom: 20rpx;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
}

.user-message .message-content {
  background-color: #4CAF50;
  color: white;
  border-radius: 20rpx 8rpx 20rpx 20rpx;
  padding: 15rpx;
}

.chicken-message {
  align-self: flex-start;
}

.chicken-message .message-content {
  background-color: #f0f0f0;
  color: #333333;
  border-radius: 8rpx 20rpx 20rpx 20rpx;
  padding: 15rpx;
}

.message-text {
  display: block;
  margin-bottom: 5rpx;
}

.message-time {
  font-size: 20rpx;
  color: #999;
  text-align: right;
}

.chat-input-area {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.chat-input {
  flex: 1;
  height: 60rpx;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.send-button {
  width: 80rpx;
  height: 60rpx;
  background-color: #333;
  color: white;
  border-radius: 30rpx;
  font-size: 24rpx;
  line-height: 60rpx;
}

/* 时光日程样式 */

.empty-schedule {
  padding: 40rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

.section-title {
  font-size: 28rpx;
  font-weight: normal;
  color: #666666;
  margin: 20rpx 0;
  display: block;
  text-align: left;
}

/* 三行两列表格布局 */
.schedule-table {
  display: flex;
  flex-direction: column;
  height: 110vh; /* 增加总高度以适应新的行高度 */
  gap: 0;
  padding: 20rpx 0;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%); /* 确保背景色正确 */
}

.table-row {
  display: flex;
  gap: 20rpx;
  height: 30vh; /* 增加高度以完全显示一个项目 */
  margin-bottom: 20rpx; /* 添加底部间距 */
  background-color: #ffffff; /* 添加背景色 */
  border-radius: 20rpx; /* 添加圆角 */
  padding: 10rpx; /* 添加内边距 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 每日任务行需要更大的高度 */
.task-row {
  display: flex;
  gap: 20rpx;
  height: 60vh; /* 每日任务行固定高度 */
  margin-bottom: 20rpx; /* 添加底部间距 */
  background-color: #ffffff; /* 添加背景色 */
  border-radius: 20rpx; /* 添加圆角 */
  padding: 10rpx; /* 添加内边距 */
  overflow: hidden; /* 防止内容溢出 */
}

.table-cell {
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20rpx; /* 保持圆角 */
}

.title-cell {
  flex: 0 0 15%; /* 标题单元格固定宽度 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 20rpx;
}

.content-cell {
  flex: 1; /* 内容单元格占用剩余空间 */
  min-width: 0; /* 确保flex项目不会溢出 */
}

.table-cell.countdown-cell, .table-cell.memorial-cell {
  height: 18vh; /* 指定高度18vh */
  padding: 0 !important; /* 强制覆盖table-cell的padding */
  box-shadow: none !important; /* 移除阴影 */
  margin: 0 !important; /* 移除可能的margin */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-cell {
  height: 54vh; /* 调整任务区域高度，与18vh的日程区域保持协调 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  height: 100%; /* 设置为父容器的100% */
}

.table-cell.countdown-cell .scroll-container, .table-cell.memorial-cell .scroll-container {
  padding: 0;
  margin: 0;
  height: 100% !important;
  min-height: 100%;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.task-scroll-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

.task-list {
  display: flex;
  flex-direction: column;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.task-item:last-child {
  border-bottom: none;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.task-desc {
  font-size: 24rpx;
  color: #999999;
}

.task-title.completed {
  color: #999999;
  text-decoration: line-through;
}

.task-desc.completed {
  color: #cccccc;
  text-decoration: line-through;
}

.completed-task {
  opacity: 0.7;
}

.task-reward {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.reward-text {
  font-size: 24rpx;
  color: #FF6B8B;
  margin-bottom: 10rpx;
}

.task-complete-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.task-complete-btn.completed {
  background-color: #999999;
}

.task-complete-btn.claimed {
  background-color: #FFD700; /* 金色表示已领取 */
  color: #333333;
}

.empty-task {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.countdown-record, .memorial-record {
  min-height: auto;
}

.countdown-record:last-child, .memorial-record:last-child {
  margin-bottom: 0;
}

.schedule-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 20rpx; /* 为最后一个元素提供底部间距 */
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
}

.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 96rpx;
  height: 96rpx;
  background-color: #333333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.add-button:active {
  background-color: #000000;
}

.plus-icon {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: bold;
}

/* 喂养记录样式 */
.feed-stats-section {
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.feed-stats-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.feed-stats-container--visible {
  max-height: 2000rpx; /* 足够大的值以容纳内容 */
}

.medicine-history-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.medicine-history-container--visible {
  max-height: 2000rpx; /* 足够大的值以容纳内容 */
}

.stats-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stat-item-large {
  text-align: center;
  flex: 1;
  padding: 0 10rpx;
}

.stat-label-large {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.stat-value-large {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.section-subtitle {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin: 20rpx 0 15rpx 0;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.feed-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.feed-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 60rpx;
  text-align: center;
}

.feed-info {
  flex: 1;
}

.feed-food {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 5rpx;
}

.feed-details {
  font-size: 24rpx;
  color: #999999;
}

.feed-time {
  font-size: 24rpx;
  color: #999999;
  white-space: nowrap;
  margin-left: 20rpx;
}

.empty-feeds {
  padding: 40rpx 0;
  text-align: center;
}

.food-stats {
  margin-top: 20rpx;
}

.food-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.food-name {
  font-size: 28rpx;
  color: #333333;
}

.food-count {
  font-size: 28rpx;
  color: #666666;
  font-weight: bold;
}

.empty-food-stats {
  padding: 40rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

/* 名称编辑弹窗样式 */
.name-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.name-edit-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.name-edit-modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.name-edit-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 30rpx;
  width: 100%;
}

.name-edit-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-bottom: 40rpx;
  box-sizing: border-box;
}

.name-edit-modal-buttons {
  display: flex;
  width: 100%;
  justify-content: space-between;
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

.medicine-name-and-count {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.medicine-name-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 10rpx;
}

.medicine-name-small {
  font-size: 24rpx;
  color: #666666;
  flex: 1;
  margin-right: 10rpx;
}

.medicine-count-right {
  font-size: 28rpx;
  color: #666666;
  font-weight: bold;
  text-align: right;
  min-width: 60rpx;
}

.medicine-info-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.medicine-time-small {
  font-size: 24rpx;
  color: #999999;
  text-align: right;
  margin-left: 20rpx;
  white-space: nowrap;
}
</style>