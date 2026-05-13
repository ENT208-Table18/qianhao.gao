# 旅行大富翁前端所需后端接口文档

> 适用项目：`uni-preset-vue-vite`  
> 目标：把当前本地存储逻辑替换为后端接口，实现完整账号级数据隔离  
> 文档版本：v1（基于当前前端代码）

## 1. 约定

### 1.1 鉴权
- 登录/注册成功后返回 `accessToken`
- 受保护接口通过请求头携带：`Authorization: Bearer <token>`

### 1.2 统一返回格式
```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- `code = 0` 表示成功
- 非 0 为业务错误（建议定义明确错误码，见文末）

---

## 2. 核心数据模型（与前端字段对齐）

### 2.1 用户基础状态（前端全局依赖）
```json
{
  "userId": "u_123",
  "email": "xxx@example.com",
  "displayName": "旅行爱好者",
  "travelCoins": 1000,
  "litCities": ["苏州", "上海"]
}
```

### 2.2 地图城市点位（8 城）
```json
[
  { "id": 1, "name": "苏州", "latitude": 31.2989, "longitude": 120.5853 },
  { "id": 2, "name": "上海", "latitude": 31.2304, "longitude": 121.4737 },
  { "id": 3, "name": "北京", "latitude": 39.9042, "longitude": 116.4074 },
  { "id": 4, "name": "杭州", "latitude": 30.2741, "longitude": 120.1551 },
  { "id": 5, "name": "广州", "latitude": 23.1291, "longitude": 113.2644 },
  { "id": 6, "name": "成都", "latitude": 30.5728, "longitude": 104.0668 },
  { "id": 7, "name": "拉萨", "latitude": 29.652, "longitude": 91.1721 },
  { "id": 8, "name": "丽江", "latitude": 26.8721, "longitude": 100.226 }
]
```

### 2.3 动态 Post（前端字段）
```json
{
  "id": "post_001",
  "authorId": "u_123",
  "authorName": "我",
  "authorEmoji": "🧑",
  "authorAvatarBg": "linear-gradient(...)",
  "city": "上海市",
  "content": "今晚外滩很美",
  "imageUrl": "https://...",
  "reward": 30,
  "likes": 0,
  "comments": 0,
  "createdAt": 1714587000000,
  "source": "self"
}
```

---

## 3. 接口清单（后端必须实现）

## 3.1 认证

### 3.1.1 注册
- `POST /api/auth/register`
- 请求：
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- 响应（关键要求）：
  - 新账号初始化：`travelCoins = 1000`
  - 新账号初始化：`litCities = ["苏州", "上海"]`
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "userId": "u_001",
    "accessToken": "jwt-token",
    "profile": {
      "travelCoins": 1000,
      "litCities": ["苏州", "上海"]
    }
  }
}
```

### 3.1.2 登录
- `POST /api/auth/login`
- 请求：
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- 响应：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "userId": "u_001",
    "accessToken": "jwt-token"
  }
}
```

---

## 3.2 用户初始化数据（建议聚合接口）

### 3.2.1 获取当前用户完整状态（首屏建议）
- `GET /api/me/bootstrap`
- 作用：一次返回前端高频状态，减少多次请求
- 响应建议：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "user": {
      "userId": "u_001",
      "displayName": "旅行爱好者",
      "travelCoins": 1130,
      "litCities": ["苏州", "上海", "杭州"]
    },
    "followingUserIds": ["u_100", "u_101"],
    "photoAlbums": {
      "上海": [{ "id": "p1", "url": "https://...", "name": "外滩夜景" }],
      "苏州": []
    },
    "propertyOwnedIds": ["2"]
  }
}
```

---

## 3.3 地图 / 城市点亮

### 3.3.1 获取地图城市点位
- `GET /api/map/cities`
- 返回固定 8 城坐标（上文 2.2）

### 3.3.2 点亮城市（服务端校验定位）
- `POST /api/map/light-city`
- 请求：
```json
{
  "cityName": "杭州",
  "userLocation": {
    "latitude": 30.27,
    "longitude": 120.15
  }
}
```
- 服务端规则：
  - 校验用户定位是否在目标城市范围内（建议行政区/围栏判断）
  - 已点亮城市重复请求应幂等返回成功
  - 点亮成功发币：70~250（现有前端逻辑）
- 响应：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "cityName": "杭州",
    "litCities": ["苏州", "上海", "杭州"],
    "coinReward": 120,
    "travelCoins": 1250
  }
}
```

---

## 3.4 旅行币

### 3.4.1 获取余额
- `GET /api/wallet/balance`

### 3.4.2 旅行币流水（推荐）
- `GET /api/wallet/transactions?page=1&pageSize=20`
- 用于后续对账（点亮奖励、发布奖励、房产扣费）

> 说明：前端目前“发布动态 +30”“点亮城市 +70~250”“房产解锁扣币”都依赖余额一致性，必须由后端原子处理。

---

## 3.5 相册（photo-albums）

### 3.5.1 获取相册（仅返回已点亮城市）
- `GET /api/albums`
- 响应建议：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "albums": [
      { "cityKey": "苏州", "city": "苏州市", "photos": [] },
      { "cityKey": "上海", "city": "上海市", "photos": [{ "id": "ph_1", "url": "...", "name": "外滩" }] }
    ]
  }
}
```

### 3.5.2 上传照片到城市
- `POST /api/albums/photos`
- 请求：
```json
{
  "cityKey": "上海",
  "photos": [
    { "url": "https://cdn.xxx/1.jpg", "name": "外滩夜景" }
  ]
}
```
- 服务端规则：
  - 只能上传到当前用户已点亮城市

---

## 3.6 动态（feed-posts）

### 3.6.1 发布动态
- `POST /api/posts`
- 请求：
```json
{
  "city": "上海市",
  "content": "今天拍到了超美夜景",
  "imageUrl": "https://cdn.xxx/1.jpg"
}
```
- 服务端规则：
  - 动态右上角金币固定 `reward = 30`
  - 发布成功给发布者加 30 币（原子事务）

### 3.6.2 动态流列表
- `GET /api/posts/feed`
- 服务端返回建议已按前端规则过滤：
  - 自己发布的动态
  - 已关注用户动态
  - 在“已点亮城市”发布的陌生用户动态

---

## 3.7 关注（follow）

### 3.7.1 获取推荐用户
- `GET /api/users/recommend`

### 3.7.2 获取我的关注列表
- `GET /api/follows`

### 3.7.3 关注用户
- `POST /api/follows/{targetUserId}`

### 3.7.4 取消关注
- `DELETE /api/follows/{targetUserId}`

> 前端当前是保存 `followingUserIds`，后端返回时可直接返回 ID 列表，前端映射 `isFollowed`。

---

## 3.8 房产

### 3.8.1 获取房产列表和我的拥有状态
- `GET /api/properties`
- 返回字段需包含：
  - `id / name / region / requiredCity / price / owned`

### 3.8.2 解锁房产
- `POST /api/properties/{propertyId}/unlock`
- 服务端规则（必须）：
  - `requiredCity` 已点亮才可购买
  - 余额足够才可购买
  - 扣币 + 写入 owned 需原子事务

---

## 4. 与当前前端代码的映射关系

- `travel-coins` 本地存储 -> `/api/wallet/*`
- `city-progress` 本地存储 -> `/api/map/light-city` + `/api/me/bootstrap`
- `feed-posts` 本地存储 -> `/api/posts/*`
- `photo-albums` 本地存储 -> `/api/albums/*`
- `follow` 本地存储 -> `/api/follows/*`
- `property owned`（当前前端内存）-> `/api/properties/*`

---

## 5. 建议错误码（可直接复用）

- `40001` 参数错误
- `40101` 未登录/Token无效
- `40301` 无权限
- `40901` 城市已点亮（幂等可返回成功）
- `40902` 房产已解锁
- `42201` 不在目标城市范围内，禁止点亮
- `42202` 城市未点亮，禁止上传该城市照片
- `42203` 城市未点亮，禁止购买该城市房产
- `42204` 旅行币不足

---

## 6. 最小可上线接口集合（优先级）

第一阶段（必须）：
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me/bootstrap`
- `GET /api/map/cities`
- `POST /api/map/light-city`
- `GET /api/posts/feed`
- `POST /api/posts`
- `GET /api/albums`
- `POST /api/albums/photos`
- `GET /api/follows`
- `POST /api/follows/{targetUserId}`
- `DELETE /api/follows/{targetUserId}`
- `GET /api/properties`
- `POST /api/properties/{propertyId}/unlock`

第二阶段（增强）：
- `GET /api/users/recommend`
- `GET /api/wallet/transactions`

