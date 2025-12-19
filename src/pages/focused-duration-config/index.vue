<template>
  <view class="container">
    <!-- 初始设置状态 -->
    <view class="setup-state" v-if="!isTiming">
      <!-- 标题区 -->
      <view class="title-section">
        <text class="main-title">正计时模式</text>
        <text class="subtitle">从0开始正计时，专注记录可以在时间轴视图中查看</text>
      </view>
      
      <!-- 时间轴刻度区 -->
      <view class="timeline-section">
        <text class="timeline-label">正计时</text>
        <scroll-view 
          class="timeline-scroll" 
          scroll-x="true" 
          :scroll-left="scrollLeft" 
          @scroll="onScroll"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <view class="timeline-container">
            <view class="timeline">
              <!-- 刻度线 -->
              <view 
                v-for="tick in ticks" 
                :key="'tick-' + tick.value" 
                class="tick" 
                :class="{ 'tick--long': tick.isLong }"
                :style="{ left: tick.position + 'px' }"
              ></view>
              <!-- 数字标签 -->
              <view 
                v-for="tick in ticks.filter(t => t.isLong)" 
                :key="'label-' + tick.value" 
                class="tick-label" 
                :style="{ left: tick.position + 'px' }"
              >
                {{ tick.label }}
              </view>
              <!-- 选中指示器 -->
              <view class="selected-indicator" :style="{ left: selectedIndicatorPosition + 'px' }"></view>
            </view>
          </view>
        </scroll-view>
        <view class="time-display">{{ selectedTime }} 分钟</view>
      </view>
      
      <!-- 底部按钮 -->
      <view class="bottom-section">
        <button class="complete-button" @tap="startTiming">完成</button>
      </view>
    </view>
    
    <!-- 实时计时状态 -->
    <view class="timing-state" v-else>
      <!-- 标题区 -->
      <view class="title-section">
        <text class="main-title">正计时模式</text>
        <text class="subtitle">从0开始正计时，专注记录可以在时间轴视图中查看</text>
      </view>
      
      <!-- 时间轴刻度区 -->
      <view class="timeline-section">
        <text class="timeline-label">正计时</text>
        <scroll-view 
          class="timeline-scroll" 
          scroll-x="true" 
          :scroll-left="scrollLeft" 
          @scroll="onScroll"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <view class="timeline-container">
            <view class="timeline">
              <!-- 刻度线 -->
              <view 
                v-for="tick in ticks" 
                :key="'tick-' + tick.value" 
                class="tick" 
                :class="{ 'tick--long': tick.isLong }"
                :style="{ left: tick.position + 'px' }"
              ></view>
              <!-- 数字标签 -->
              <view 
                v-for="tick in ticks.filter(t => t.isLong)" 
                :key="'label-' + tick.value" 
                class="tick-label" 
                :style="{ left: tick.position + 'px' }"
              >
                {{ tick.label }}
              </view>
              <!-- 选中指示器 -->
              <view class="selected-indicator" :style="{ left: selectedIndicatorPosition + 'px' }"></view>
            </view>
          </view>
        </scroll-view>
        <view class="time-display">{{ selectedTime }} 分钟</view>
      </view>
      
      <!-- 底部按钮 -->
      <view class="bottom-section">
        <button class="complete-button" @tap="stopTiming">完成</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isTiming: false, // 是否正在计时
      minutes: 0, // 当前计时分钟数
      selectedTime: 25, // 默认选中时间（分钟）
      scrollLeft: 0, // 滚动位置
      startX: 0, // 触摸起始位置
      startScrollLeft: 0, // 触摸开始时的滚动位置
      timelineWidth: 3600, // 时间轴总宽度（像素）
      minuteInterval: 1, // 每分钟一个刻度
      tickInterval: 5, // 每5分钟一个长刻度
      maxTime: 180, // 最大时间（分钟）
      pixelsPerMinute: 20, // 每分钟占用的像素数
      scrollViewWidth: 300 // scroll-view的宽度（像素）
    }
  },
  computed: {
    // 生成刻度数据
    ticks() {
      const ticks = []
      // 每分钟一个刻度，每5分钟一个长刻度
      for (let i = 0; i <= this.maxTime; i += this.minuteInterval) {
        // 计算刻度位置（像素）
        const position = i * this.pixelsPerMinute
            
        // 判断是否为长刻度（每5分钟）
        const isLongTick = i % this.tickInterval === 0
            
        ticks.push({
          value: i,
          label: isLongTick ? i.toString() : '', // 只有长刻度才显示标签
          position: position,
          isLong: isLongTick
        })
      }
      return ticks
    },
    // 选中指示器位置
    selectedIndicatorPosition() {
      return this.selectedTime * this.pixelsPerMinute
    }
  },
  methods: {
    // 开始计时
    startTiming() {
      // 将选择的时间传递回首页
      uni.navigateBack({
        delta: 1,
        success: () => {
          // 通过事件传递数据
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.$vm) {
            // 格式化时间为 HH:MM 格式
            const hours = Math.floor(this.selectedTime / 60);
            const minutes = this.selectedTime % 60;
            prevPage.$vm.focusDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
        }
      });
    },
    
    // 停止计时
    stopTiming() {
      // 将选择的时间传递回首页
      uni.navigateBack({
        delta: 1,
        success: () => {
          // 通过事件传递数据
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.$vm) {
            // 格式化时间为 HH:MM 格式
            const hours = Math.floor(this.selectedTime / 60);
            const minutes = this.selectedTime % 60;
            prevPage.$vm.focusDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
        }
      });
    },
    
    // 处理滚动事件
    onScroll(e) {
      this.scrollLeft = e.detail.scrollLeft
      // 根据滚动位置计算选中时间
      if (!this.isTiming) {
        // 计算中心位置对应的像素
        const centerPixel = this.scrollLeft + 150; // 150是scroll-view宽度的一半
        // 计算中心位置对应的时间（分钟）
        this.selectedTime = Math.round(centerPixel / this.pixelsPerMinute)
        // 确保时间在有效范围内
        this.selectedTime = Math.min(Math.max(this.selectedTime, 0), this.maxTime)
        // 调整到最近的分钟数
        this.selectedTime = Math.round(this.selectedTime)
      }
    },
    
    // 触摸开始
    onTouchStart(e) {
      this.startX = e.touches[0].pageX
      this.startScrollLeft = this.scrollLeft
    },
    
    // 触摸移动
    onTouchMove(e) {
      if (!this.isTiming) {
        const moveX = e.touches[0].pageX
        const deltaX = this.startX - moveX
        this.scrollLeft = this.startScrollLeft + deltaX
        // 实时计算中心位置对应的时间
        const centerPixel = this.scrollLeft + 150; // 150是scroll-view宽度的一半
        this.selectedTime = Math.round(centerPixel / this.pixelsPerMinute)
        this.selectedTime = Math.min(Math.max(this.selectedTime, 0), this.maxTime)
        this.selectedTime = Math.round(this.selectedTime)
      }
    },
    
    // 触摸结束
    onTouchEnd() {
      // 触摸结束后可以添加吸附效果等
    },
        
    // 滚动到中心位置
    scrollToCenter() {
      // 计算选中时间对应的像素位置
      const selectedPixel = this.selectedTime * this.pixelsPerMinute;
      // 计算需要滚动的距离，使选中时间位于中心
      this.scrollLeft = selectedPixel - 150; // 150是scroll-view宽度的一半
    }
  },
  // 监听选中时间变化
  watch: {
    selectedTime() {
      // 当选中时间变化时，自动滚动到中心
      this.$nextTick(() => {
        this.scrollToCenter();
      });
    }
  },
  // 页面加载完成后初始化
  mounted() {
    // 初始化滚动位置，使默认选中的时间位于可视区域
    this.$nextTick(() => {
      // 计算选中时间对应的像素位置
      const selectedPixel = this.selectedTime * this.pixelsPerMinute;
      // 计算需要滚动的距离，使选中时间位于中心
      this.scrollLeft = selectedPixel - 150; // 150是scroll-view宽度的一半
    });
  },
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
  padding: 60rpx; /* 从40rpx放大到60rpx */
  box-sizing: border-box;
}

/* 标题区样式 */
.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 150rpx; /* 从100rpx放大到150rpx */
  margin-bottom: 150rpx; /* 从100rpx放大到150rpx */
}

.main-title {
  font-size: 72rpx; /* 从48rpx放大到72rpx */
  color: #000000;
  font-weight: bold;
  margin-bottom: 45rpx; /* 从30rpx放大到45rpx */
}

.subtitle {
  font-size: 42rpx; /* 从28rpx放大到42rpx */
  color: #000000;
  text-align: center;
  line-height: 1.5;
}

/* 时间轴刻度区样式 */
.timeline-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.timeline-label {
  font-size: 48rpx; /* 从32rpx放大到48rpx */
  color: #000000;
  margin-bottom: 45rpx; /* 从30rpx放大到45rpx */
  text-align: center;
}

.timeline-scroll {
  width: 100%;
  height: 150rpx; /* 从100rpx放大到150rpx */
  white-space: nowrap;
  position: relative;
  overflow: hidden; /* 隐藏滚动条 */
}

.timeline-container {
  position: relative;
  width: 3600px; /* 与timelineWidth保持一致 */
  height: 100%;
}

.timeline {
  position: relative;
  height: 150rpx; /* 从100rpx放大到150rpx */
  width: 100%;
}

.tick {
  position: absolute;
  top: 45rpx; /* 从30rpx调整 */
  transform: translateX(-50%);
  color: #000000;
  min-width: 60rpx; /* 从40rpx放大到60rpx */
  text-align: center;
  height: 30rpx; /* 从20rpx放大到30rpx */
  border-left: 6rpx solid #000000; /* 从4rpx放大到6rpx */
}

.tick--long {
  height: 60rpx; /* 从40rpx放大到60rpx */
  font-weight: bold;
  top: 30rpx; /* 从20rpx调整 */
  border-left: 9rpx solid #000000; /* 从6rpx放大到9rpx */
}

.tick-label {
  position: absolute;
  top: 105rpx; /* 从70rpx调整 */
  transform: translateX(-50%);
  font-size: 36rpx; /* 从24rpx放大到36rpx */
  color: #000000;
  min-width: 60rpx; /* 从40rpx放大到60rpx */
  text-align: center;
}

/* 选中指示器 */
.selected-indicator {
  position: absolute;
  top: 30rpx; /* 从20rpx调整 */
  width: 6rpx; /* 从4rpx放大到6rpx */
  height: 60rpx; /* 从40rpx放大到60rpx */
  background-color: #000000;
  transform: translateX(-50%);
  z-index: 10;
}

.time-display {
  text-align: center;
  font-size: 54rpx; /* 从36rpx放大到54rpx */
  color: #000000;
  font-weight: bold;
  margin-top: 30rpx; /* 从20rpx放大到30rpx */
}

/* 计时显示区样式 */
.timer-display {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.timer-number {
  font-size: 180rpx; /* 从120rpx放大到180rpx */
  color: #000000;
  font-weight: bold;
}

/* 底部按钮区样式 */
.bottom-section {
  display: flex;
  justify-content: center;
  margin-top: 150rpx; /* 从100rpx放大到150rpx */
}

.complete-button {
  width: 300rpx; /* 从200rpx放大到300rpx */
  height: 120rpx; /* 从80rpx放大到120rpx */
  background-color: #000000;
  color: #ffffff;
  border-radius: 60rpx; /* 从40rpx放大到60rpx */
  font-size: 48rpx; /* 从32rpx放大到48rpx */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>