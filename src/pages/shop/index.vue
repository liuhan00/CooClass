<template>
  <view class="shop-container">
    <!-- 页面顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">咕咕商店</text>
      <view class="nav-right">
        <view class="user-coins">
          <text class="coin-icon">💰</text>
          <text class="coin-count">{{ userInfo.coins || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 商品分类导航 -->
    <view class="category-nav">
      <scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          class="category-item"
          :class="{ 'category-item--active': activeCategory === index }"
          @tap="switchCategory(index)"
        >
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 商品列表 -->
    <scroll-view class="goods-list" scroll-y="true" @scrolltolower="loadMore">
      <view class="goods-item" v-for="(item, index) in currentGoodsList" :key="item.foodId || index">
        <view class="goods-image">
          <image :src="item.icon" mode="aspectFill"></image>
        </view>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">{{ item.description }}</text>
          <view class="goods-stats">
            <text class="exp-value">+{{ item.expValue }}经验值</text>
            <text class="rarity" :class="`rarity--${item.rarity}`">{{ item.rarityText }}</text>
          </view>
        </view>
        <view class="goods-action">
          <text class="goods-price">¥ {{ item.price }}</text>
          <button 
            class="buy-button" 
            :class="{ 'buy-button--disabled': userInfo.coins < item.price }"
            :disabled="userInfo.coins < item.price"
            @tap="buyItem(item)"
          >
            {{ userInfo.coins < item.price ? '金币不足' : '购买' }}
          </button>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view class="loading-more" v-if="loadingMore">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-else-if="noMoreData">
        <text>没有更多商品了</text>
      </view>
    </scroll-view>

    <!-- 购买确认弹窗 -->
    <view class="buy-modal" v-if="showBuyModal">
      <view class="modal-overlay" @tap="closeBuyModal"></view>
      <view class="modal-content">
        <text class="modal-title">确认购买</text>
        <view class="modal-body">
          <view class="modal-item">
            <image :src="selectedItem.icon" class="modal-item-image" mode="aspectFill"></image>
            <view class="modal-item-info">
              <text class="modal-item-name">{{ selectedItem.name }}</text>
              <text class="modal-item-desc">{{ selectedItem.description }}</text>
              <text class="modal-item-price">价格: {{ selectedItem.price }} 金币</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-cancel-btn" @tap="closeBuyModal">取消</button>
          <button class="modal-confirm-btn" @tap="confirmBuy">确认购买</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request, { getFoodsList, getUserFoodInventory, purchaseFood } from '@/utils/request.js'

export default {
  data() {
    return {
      userInfo: {
        coins: 0
      },
      categories: [
        { id: 'all', name: '全部' },
        { id: 'normal', name: '普通' },
        { id: 'special', name: '特殊' },
        { id: 'limited', name: '限量' }
      ],
      activeCategory: 0,
      allGoodsList: [],
      currentGoodsList: [],
      loadingMore: false,
      noMoreData: false,
      showBuyModal: false,
      selectedItem: null
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadGoodsList();
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 加载用户信息
    async loadUserInfo() {
      try {
        const token = uni.getStorageSync('token');
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 这里应该调用获取用户信息的API，暂时使用模拟数据
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo && userInfo.coins !== undefined) {
          this.userInfo.coins = userInfo.coins;
        } else {
          // 模拟获取用户金币信息
          this.userInfo.coins = 100; // 模拟数据
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    },

    // 加载商品列表
    async loadGoodsList() {
      try {
        uni.showLoading({
          title: '加载中...'
        });

        const response = await getFoodsList();
        if (response.statusCode === 200 && response.data.code === 200) {
          // 添加稀有度文本
          const goodsWithRarityText = response.data.data.map(item => {
            return {
              ...item,
              rarityText: this.getRarityText(item.rarity),
              category: item.category || 'normal'
            };
          });

          this.allGoodsList = goodsWithRarityText;
          this.filterGoodsList();
        } else {
          uni.showToast({
            title: '获取商品列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载商品列表失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 获取稀有度文本
    getRarityText(rarity) {
      const rarityMap = {
        'common': '普通',
        'uncommon': '罕见',
        'rare': '稀有',
        'epic': '史诗',
        'legendary': '传说'
      };
      return rarityMap[rarity] || '普通';
    },

    // 过滤商品列表
    filterGoodsList() {
      if (this.activeCategory === 0) {
        // 全部商品
        this.currentGoodsList = [...this.allGoodsList];
      } else {
        const category = this.categories[this.activeCategory].id;
        this.currentGoodsList = this.allGoodsList.filter(item => item.category === category);
      }
    },

    // 切换商品分类
    switchCategory(index) {
      this.activeCategory = index;
      this.filterGoodsList();
    },

    // 加载更多（暂未实现分页）
    loadMore() {
      // 这里可以实现分页加载
    },

    // 购买商品
    buyItem(item) {
      if (this.userInfo.coins < item.price) {
        uni.showToast({
          title: '金币不足',
          icon: 'none'
        });
        return;
      }

      this.selectedItem = item;
      this.showBuyModal = true;
    },

    // 关闭购买弹窗
    closeBuyModal() {
      this.showBuyModal = false;
      this.selectedItem = null;
    },

    // 确认购买
    async confirmBuy() {
      if (!this.selectedItem) return;

      try {
        uni.showLoading({
          title: '购买中...'
        });

        // 调用购买API
        const purchaseData = {
          foodId: this.selectedItem.foodId,
          quantity: 1 // 默认购买1个
        };
        
        const response = await purchaseFood(purchaseData);
        
        if (response.statusCode === 200 && response.data.code === 200) {
          // 购买成功，更新金币
          this.userInfo.coins = response.data.data?.remainingCoins || (this.userInfo.coins - this.selectedItem.price);
          
          uni.showToast({
            title: '购买成功',
            icon: 'success'
          });

          // 更新本地存储的用户信息
          let userInfo = uni.getStorageSync('userInfo') || {};
          userInfo.coins = this.userInfo.coins;
          uni.setStorageSync('userInfo', userInfo);

          this.closeBuyModal();
        } else {
          uni.showToast({
            title: response.data.message || '购买失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('购买失败:', error);
        uni.showToast({
          title: '购买失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
  }
}
</script>

<style>
page {
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  min-height: 100vh;
}

.shop-container {
  flex: 1;
  background: linear-gradient(180deg, #fff8f0 0%, #ffe4c5 50%, #ffd7b0 100%);
  min-height: 100vh;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  margin-top: 40rpx;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333333;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.user-coins {
  display: flex;
  align-items: center;
}

.coin-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.coin-count {
  font-size: 28rpx;
  color: #FF9800;
  font-weight: bold;
}

/* 商品分类导航 */
.category-nav {
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-scroll {
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin-right: 20rpx;
  border-radius: 30rpx;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
}

.category-item--active {
  background-color: #FF9800;
  color: #ffffff;
}

.category-name {
  font-size: 28rpx;
  color: #666666;
}

.category-item--active .category-name {
  color: #ffffff;
}

/* 商品列表 */
.goods-list {
  flex: 1;
  padding: 20rpx 30rpx;
  height: calc(100vh - 200rpx);
  box-sizing: border-box;
}

.goods-item {
  display: flex;
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 15rpx;
  overflow: hidden;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.goods-image image {
  width: 100%;
  height: 100%;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0; /* 防止flex元素溢出 */
}

.goods-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.goods-desc {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.goods-stats {
  display: flex;
  align-items: center;
}

.exp-value {
  font-size: 24rpx;
  color: #4CAF50;
  background-color: #e8f5e9;
  padding: 4rpx 12rpx;
  border-radius: 15rpx;
  margin-right: 15rpx;
}

.rarity {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 15rpx;
}

.rarity--common {
  color: #666666;
  background-color: #f5f5f5;
}

.rarity--uncommon {
  color: #4CAF50;
  background-color: #e8f5e9;
}

.rarity--rare {
  color: #2196F3;
  background-color: #e3f2fd;
}

.rarity--epic {
  color: #9C27B0;
  background-color: #f3e5f5;
}

.rarity--legendary {
  color: #FF9800;
  background-color: #fff3e0;
}

.goods-action {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  min-width: 120rpx;
  max-width: 25%;
  flex-shrink: 0;
}

.goods-price {
  font-size: 28rpx;
  color: #FF5722;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.buy-button {
  width: 100rpx;
  height: 60rpx;
  background-color: #FF9800;
  color: #ffffff;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buy-button--disabled {
  background-color: #cccccc;
}

/* 加载提示 */
.loading-more,
.no-more {
  text-align: center;
  padding: 30rpx;
  color: #999999;
  font-size: 28rpx;
}

/* 购买确认弹窗 */
.buy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  z-index: 1001;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
}

.modal-body {
  margin-bottom: 40rpx;
}

.modal-item {
  display: flex;
  align-items: center;
}

.modal-item-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 15rpx;
  margin-right: 20rpx;
}

.modal-item-info {
  flex: 1;
}

.modal-item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.modal-item-desc {
  font-size: 24rpx;
  color: #999999;
  display: block;
  margin-bottom: 10rpx;
}

.modal-item-price {
  font-size: 26rpx;
  color: #FF5722;
  font-weight: bold;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
}

.modal-cancel-btn,
.modal-confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  margin: 0 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-cancel-btn {
  background-color: #cccccc;
  color: #ffffff;
}

.modal-confirm-btn {
  background-color: #FF9800;
  color: #ffffff;
}
</style>