<template>
  <view class="shop-container">


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
      <view class="goods-item" v-for="(item, index) in currentGoodsList" :key="item.foodId || item.medicineId || index">
        <view class="goods-image">
          <image :src="item.icon" mode="aspectFill"></image>
        </view>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">{{ item.description }}</text>
          <view class="goods-stats">
            <text class="exp-value" v-if="item.expValue">+{{ item.expValue }}经验值</text>
            <text class="rarity" :class="`rarity--${item.rarity}`">{{ item.rarityText }}</text>
          </view>
        </view>
        <view class="goods-action">
          <text class="goods-price">¥ {{ item.price }}</text>
          <button 
            class="buy-button" 
            @tap="buyItem(item)"
          >
            购买
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
import request, { getFoodsList, getUserFoodInventory, purchaseFood, getMedicineList, getUserMedicineInventory, purchaseMedicine } from '@/utils/request.js'

export default {
  data() {
    return {
  
      categories: [
        { id: 'all', name: '全部' },
        { id: 'food', name: '食物' },
        { id: 'medicine', name: '药品' },
        { id: 'special', name: '特殊物品' }
      ],
      activeCategory: 0,
      allFoodsList: [],
      allMedicinesList: [],
      allGoodsList: [],
      currentGoodsList: [],
      loadingMore: false,
      noMoreData: false,
      showBuyModal: false,
      selectedItem: null,
      selectedItemType: 'food' // 区分是食物还是药品
    }
  },

  onLoad() {

    this.loadGoodsList();
  },

  methods: {




    // 加载商品列表
    async loadGoodsList() {
      try {
        uni.showLoading({
          title: '加载中...'
        });

        // 并行加载食物和药品列表
        const [foodsResponse, medicinesResponse] = await Promise.all([
          getFoodsList(),
          getMedicineList()
        ]);

        // 处理食物列表
        console.log('食物API响应:', foodsResponse);
        if (foodsResponse.statusCode === 200 && foodsResponse.data.code === 200) {
          // 检查食物数据结构，可能在 list 字段中
          const foodsRawData = foodsResponse.data.data;
          const foodsData = Array.isArray(foodsRawData.list) ? foodsRawData.list : (Array.isArray(foodsRawData) ? foodsRawData : []);
          console.log('食物数据:', foodsData);
          this.allFoodsList = foodsData.map(item => {
            return {
              ...item,
              type: 'food',
              typeName: '食物',
              // 确保expValue存在
              expValue: item.expValue,
              // 如果没有描述，则提供默认值
              description: item.description || '美味的食物',
              rarityText: this.getRarityText(item.rarity),
              category: item.category || 'food'
            };
          });
        } else {
          console.error('获取食物列表失败:', foodsResponse);
          this.allFoodsList = [];
        }

        // 处理药品列表
        console.log('药品API响应:', medicinesResponse);
        if (medicinesResponse.statusCode === 200 && medicinesResponse.data.code === 200) {
          // 药品列表在 data.list 中
          const medicinesData = Array.isArray(medicinesResponse.data.data.list) ? medicinesResponse.data.data.list : [];
          console.log('药品数据:', medicinesData);
          this.allMedicinesList = medicinesData.map(item => {
            return {
              ...item,
              type: 'medicine',
              typeName: '药品',
              // 药品的特效值显示为效果值
              expValue: item.effectValue,
              // 如果没有描述，则使用效果类型
              description: item.description || item.effectType,
              rarityText: this.getRarityText(item.rarity),
              category: item.category || 'medicine'
            };
          });
        } else {
          console.error('获取药品列表失败:', medicinesResponse);
          this.allMedicinesList = [];
        }

        // 合并所有商品列表
        this.allGoodsList = [...this.allFoodsList, ...this.allMedicinesList];
        console.log('合并后的所有商品列表:', this.allGoodsList);
        console.log('食物列表长度:', this.allFoodsList.length);
        console.log('药品列表长度:', this.allMedicinesList.length);
        this.filterGoodsList();
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
      console.log('当前分类索引:', this.activeCategory);
      console.log('当前分类信息:', this.categories[this.activeCategory]);
      
      if (this.activeCategory === 0) {
        // 全部商品
        this.currentGoodsList = [...this.allGoodsList];
        console.log('显示全部商品，数量:', this.currentGoodsList.length);
      } else {
        const categoryId = this.categories[this.activeCategory].id;
        console.log('分类ID:', categoryId);
        
        if (categoryId === 'food') {
          // 只显示食物
          this.currentGoodsList = [...this.allFoodsList];
          console.log('显示食物商品，数量:', this.currentGoodsList.length);
        } else if (categoryId === 'medicine') {
          // 只显示药品
          this.currentGoodsList = [...this.allMedicinesList];
          console.log('显示药品商品，数量:', this.currentGoodsList.length);
        } else {
          // 显示特定类别商品
          this.currentGoodsList = this.allGoodsList.filter(item => item.category === categoryId);
          console.log('显示特定类别商品，数量:', this.currentGoodsList.length);
        }
      }
      console.log('当前显示的商品列表:', this.currentGoodsList);
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
      this.selectedItem = item;
      this.selectedItemType = item.type || 'food'; // 默认为食物
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

        // 根据商品类型调用不同的购买API
        let response;
        if (this.selectedItemType === 'medicine') {
          // 药品购买
          const purchaseData = {
            medicineId: this.selectedItem.medicineId || this.selectedItem.id,
            quantity: 1 // 默认购买1个
          };
          response = await purchaseMedicine(purchaseData);
        } else {
          // 食物购买
          const purchaseData = {
            foodId: this.selectedItem.foodId || this.selectedItem.id,
            quantity: 1 // 默认购买1个
          };
          response = await purchaseFood(purchaseData);
        }
        
        if (response.statusCode === 200 && response.data.code === 200) {
          
          uni.showToast({
            title: '购买成功',
            icon: 'success'
          });

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
  height: calc(100vh - 120rpx); /* 调整高度，移除顶部导航栏后 */
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