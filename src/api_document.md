# 咕咕学时 API 文档

## 1. 接口域名
```
https://api.guguxue.com
```

## 2. 公共请求头
```
Content-Type: application/json
Authorization: Bearer <token>  // 部分接口需要
```

## 3. 状态码说明
| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 接口不存在 |
| 500 | 服务器内部错误 |

## 4. 用户认证接口

### 4.1 微信授权登录
**接口地址：** POST /api/auth/wechat-login

**请求参数：**
```json
{
  "code": "微信登录凭证code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "用户头像URL",
    "gender": "性别 0未知 1男性 2女性",
    "city": "城市",
    "province": "省份",
    "country": "国家"
  }
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "用户身份令牌",
    "userId": "用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "用户头像URL",
    "firstLogin": true/false
  }
}
```

### 4.2 游客登录
**接口地址：** POST /api/auth/guest-login

**请求参数：**
```json
{
  "deviceId": "设备唯一标识"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "用户身份令牌",
    "userId": "用户ID",
    "nickName": "游客用户昵称",
    "avatarUrl": "默认头像URL",
    "firstLogin": true/false
  }
}
```

### 4.3 用户信息获取
**接口地址：** GET /api/auth/user-info

**请求参数：** 无

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": "用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "用户头像URL",
    "level": "用户等级",
    "exp": "当前经验值",
    "expToNextLevel": "升级所需经验值",
    "coins": "谷物币数量",
    "continuousDays": "连续专注天数",
    "totalFocusMinutes": "累计专注分钟数"
  }
}
```

### 4.4 更新用户信息
**接口地址：** PUT /api/auth/user-info

**请求参数：**
```json
{
  "nickName": "用户昵称",
  "avatarUrl": "用户头像URL"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "userId": "用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "用户头像URL"
  }
}
```

## 5. 专注计时接口

### 5.1 开始专注计时
**接口地址：** POST /api/focus/start

**请求参数：**
```json
{
  "duration": "专注时长（分钟）",
  "scene": "专注场景（学习、工作、阅读、运动等）",
  "startTime": "开始时间戳"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "开始专注",
  "data": {
    "focusId": "专注记录ID",
    "duration": "专注时长（分钟）",
    "scene": "专注场景",
    "startTime": "开始时间戳"
  }
}
```

### 5.2 结束专注计时
**接口地址：** POST /api/focus/end

**请求参数：**
```json
{
  "focusId": "专注记录ID",
  "actualDuration": "实际专注时长（分钟）",
  "endTime": "结束时间戳"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "专注结束",
  "data": {
    "focusId": "专注记录ID",
    "duration": "专注时长（分钟）",
    "actualDuration": "实际专注时长（分钟）",
    "coinsEarned": "获得谷物币",
    "expEarned": "获得经验值",
    "isCompleted": "是否完成（实际时长>=80%设定时长）"
  }
}
```

### 5.3 获取专注记录列表
**接口地址：** GET /api/focus/list

**请求参数：**
```json
{
  "page": "页码",
  "size": "每页数量"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "focusId": "专注记录ID",
        "duration": "设定专注时长（分钟）",
        "actualDuration": "实际专注时长（分钟）",
        "scene": "专注场景",
        "startTime": "开始时间戳",
        "endTime": "结束时间戳",
        "coinsEarned": "获得谷物币",
        "expEarned": "获得经验值",
        "isCompleted": "是否完成"
      }
    ],
    "total": "总记录数",
    "page": "当前页码",
    "size": "每页数量"
  }
}
```

### 5.4 获取专注统计信息
**接口地址：** GET /api/focus/stats

**请求参数：**
```json
{
  "period": "统计周期（today, week, month, total）"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalMinutes": "总专注分钟数",
    "completedCount": "完成次数",
    "avgDuration": "平均专注时长",
    "sceneDistribution": {
      "学习": "分钟数",
      "工作": "分钟数",
      "阅读": "分钟数",
      "运动": "分钟数"
    }
  }
}
```

## 6. 小鸡养成接口

### 6.1 获取小鸡信息
**接口地址：** GET /api/chicken/info

**请求参数：** 无

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "chickenId": "小鸡ID",
    "name": "小鸡名字",
    "level": "等级",
    "exp": "当前经验值",
    "expToNextLevel": "升级所需经验值",
    "status": "状态（正常、开心、专注、失落）",
    "lastFeedTime": "上次喂食时间",
    "happiness": "快乐值（0-100）"
  }
}
```

### 6.2 喂养小鸡
**接口地址：** POST /api/chicken/feed

**请求参数：**
```json
{
  "snackId": "零食ID",
  "quantity": "数量"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "喂养成功",
  "data": {
    "chickenId": "小鸡ID",
    "level": "当前等级",
    "exp": "当前经验值",
    "expToNextLevel": "升级所需经验值",
    "status": "状态",
    "reward": {
      "coins": "获得谷物币",
      "items": [
        {
          "itemId": "物品ID",
          "itemName": "物品名称",
          "quantity": "数量"
        }
      ]
    }
  }
}
```


### 6.5 升级小鸡
**接口地址：** POST /api/chicken/level-up

**请求参数：** 无

**响应参数：**
```json
{
  "code": 200,
  "message": "升级成功",
  "data": {
    "chickenId": "小鸡ID",
    "level": "新等级",
    "exp": "当前经验值",
    "expToNextLevel": "下一级所需经验值",
    "rewards": [
      {
        "type": "奖励类型（coins, items, appearance）",
        "value": "奖励值",
        "description": "奖励描述"
      }
    ]
  }
}
```

## 7. 数据统计接口

### 7.1 获取专注统计数据
**接口地址：** GET /api/statistics/focus

**请求参数：**
```json
{
  "period": "统计周期（day, week, month）",
  "startDate": "开始日期（yyyy-MM-dd）",
  "endDate": "结束日期（yyyy-MM-dd）"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalMinutes": "总专注分钟数",
    "completedCount": "完成次数",
    "avgDuration": "平均专注时长",
    "completionRate": "完成率",
    "dailyStats": [
      {
        "date": "日期",
        "minutes": "当日专注分钟数",
        "count": "当日完成次数"
      }
    ],
    "sceneDistribution": {
      "学习": "分钟数",
      "工作": "分钟数",
      "阅读": "分钟数",
      "运动": "分钟数"
    }
  }
}
```

### 7.2 获取小鸡成长数据
**接口地址：** GET /api/statistics/chicken-growth

**请求参数：**
```json
{
  "period": "统计周期（week, month, total）"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "currentLevel": "当前等级",
    "levelUpCount": "升级次数",
    "feedCount": "喂食次数",
    "favoriteSnacks": [
      {
        "snackId": "零食ID",
        "snackName": "零食名称",
        "count": "喂食次数"
      }
    ],
    "levelHistory": [
      {
        "level": "等级",
        "achievedAt": "达成时间",
        "minutesToAchieve": "达到该等级所用专注分钟数"
      }
    ]
  }
}
```

### 7.3 获取成就统计
**接口地址：** GET /api/statistics/achievements

**请求参数：** 无

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalAchievements": "总成就数",
    "unlockedAchievements": "已解锁成就数",
    "unlockRate": "解锁率",
    "rareAchievements": "稀有成就数",
    "recentUnlocked": [
      {
        "achievementId": "成就ID",
        "name": "成就名称",
        "description": "成就描述",
        "unlockedAt": "解锁时间",
        "reward": "奖励内容"
      }
    ]
  }
}
```

### 7.4 生成专注报告
**接口地址：** POST /api/statistics/generate-report

**请求参数：**
```json
{
  "period": "报告周期（week, month）",
  "format": "报告格式（pdf, png）"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "生成成功",
  "data": {
    "reportId": "报告ID",
    "downloadUrl": "下载链接",
    "expiresAt": "过期时间"
  }
}
```

## 8. 零食商店接口

### 8.1 获取商店商品列表
**接口地址：** GET /api/shop/items

**请求参数：**
```json
{
  "category": "分类（normal, rare, special）",
  "page": "页码",
  "size": "每页数量"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "snackId": "零食ID",
        "name": "零食名称",
        "description": "零食描述",
        "price": "价格（谷物币）",
        "category": "分类",
        "expValue": "经验值",
        "stock": "库存",
        "dailyLimit": "每日限制购买数量",
        "isLimited": "是否限量",
        "imageUrl": "图片URL"
      }
    ],
    "total": "总数量",
    "page": "当前页码",
    "size": "每页数量"
  }
}
```

### 8.2 购买零食
**接口地址：** POST /api/shop/purchase

**请求参数：**
```json
{
  "snackId": "零食ID",
  "quantity": "购买数量"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "购买成功",
  "data": {
    "orderId": "订单ID",
    "snackId": "零食ID",
    "name": "零食名称",
    "quantity": "购买数量",
    "totalPrice": "总价",
    "remainingCoins": "剩余谷物币",
    "inventory": [
      {
        "snackId": "零食ID",
        "name": "零食名称",
        "quantity": "拥有数量"
      }
    ]
  }
}
```

### 8.3 获取用户背包物品
**接口地址：** GET /api/shop/inventory

**请求参数：** 无

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "coins": "谷物币数量",
    "items": [
      {
        "snackId": "零食ID",
        "name": "零食名称",
        "description": "零食描述",
        "quantity": "拥有数量",
        "category": "分类",
        "expValue": "经验值",
        "imageUrl": "图片URL"
      }
    ]
  }
}
```

### 8.4 使用零食
**接口地址：** POST /api/shop/use-snack

**请求参数：**
```json
{
  "snackId": "零食ID",
  "quantity": "使用数量"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "使用成功",
  "data": {
    "snackId": "零食ID",
    "name": "零食名称",
    "usedQuantity": "使用数量",
    "remainingQuantity": "剩余数量",
    "effect": "使用效果描述"
  }
}
```

## 9. 成就系统接口

### 9.1 获取成就列表
**接口地址：** GET /api/achievement/list

**请求参数：**
```json
{
  "type": "成就类型（all, unlocked, locked）",
  "page": "页码",
  "size": "每页数量"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "achievementId": "成就ID",
        "name": "成就名称",
        "description": "成就描述",
        "condition": "解锁条件",
        "reward": "奖励内容",
        "rewardDetails": {
          "coins": "谷物币奖励",
          "items": [
            {
              "itemId": "物品ID",
              "itemName": "物品名称",
              "quantity": "数量"
            }
          ]
        },
        "isUnlocked": "是否已解锁",
        "unlockedAt": "解锁时间",
        "rarity": "稀有度（common, rare, epic, legendary）",
        "progress": "进度（0-100）",
        "sortOrder": "排序"
      }
    ],
    "total": "总数量",
    "page": "当前页码",
    "size": "每页数量"
  }
}
```

### 9.2 获取用户成就状态
**接口地址：** GET /api/achievement/user-status

**请求参数：** 无

**响应参数：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalAchievements": "总成就数",
    "unlockedAchievements": "已解锁成就数",
    "unlockRate": "解锁率",
    "rareAchievements": "稀有成就数",
    "points": "成就点数",
    "recentUnlocked": [
      {
        "achievementId": "成就ID",
        "name": "成就名称",
        "description": "成就描述",
        "unlockedAt": "解锁时间",
        "reward": "奖励内容"
      }
    ]
  }
}
```

### 9.3 领取成就奖励
**接口地址：** POST /api/achievement/claim-reward

**请求参数：**
```json
{
  "achievementId": "成就ID"
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "领取成功",
  "data": {
    "achievementId": "成就ID",
    "rewardDetails": {
      "coins": "获得谷物币",
      "items": [
        {
          "itemId": "物品ID",
          "itemName": "物品名称",
          "quantity": "数量"
        }
      ]
    },
    "inventory": [
      {
        "itemId": "物品ID",
        "itemName": "物品名称",
        "quantity": "拥有数量"
      }
    ]
  }
}
```

### 9.4 查询成就解锁进度
**接口地址：** GET /api/achievement/progress

**请求参数：**
```json
{
  "achievementIds": ["成就ID列表"]
}
```

**响应参数：**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "achievementId": "成就ID",
      "progress": "进度（0-100）",
      "currentValue": "当前值",
      "targetValue": "目标值",
      "isCompleted": "是否已完成"
    }
  ]
}
```