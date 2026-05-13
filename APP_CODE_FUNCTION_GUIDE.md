# App Code Function Guide (Excluding dist)

> Project: `uni-preset-vue-vite`  
> Scope: Explains the responsibilities of the current app's core business code and configurations, **excluding the `dist` directory**.

## 1. Project Overview

This is a travel check-in / travel tycoon app built with uni-app + Vue3. Its core capabilities include:
- Login and registration (frontend demo flow)
- Lighting up cities on the map (with location verification)
- City-based photo management and feed publishing
- Feed visibility rules (follow relationship + lit cities)
- Virtual property unlocking (constrained by lit cities and travel coins)
- Profile page display of travel assets and footprint progress

At present, the app primarily uses local storage for persistence, and applies account-scoped keys so different accounts do not interfere with each other's data.

---

## 2. Startup and Global Entry

### `src/main.js`
- Creates the Vue SSR app and mounts the root component `App.vue`.
- This is the standard uni-app entry point and is responsible for app instance creation.

### `src/App.vue`
- Defines application lifecycle hooks:
  - `onLaunch`
  - `onShow`
  - `onHide`
- Currently only outputs basic logs and does not contain global business logic.

---

## 3. Page Routing and Navigation Config

### `src/pages.json`
- Registers 6 core pages:
  - `pages/index/index` (Login)
  - `pages/map/map` (Map)
  - `pages/photo/photo` (Photos)
  - `pages/feed/feed` (Feed)
  - `pages/property/property` (Property)
  - `pages/profile/profile` (Me)
- Page titles and navigation styles are configured here. All pages use `navigationStyle: "custom"` and render their own top layout.

---

## 4. Page-by-Page Functionality

### `src/pages/index/index.vue` (Login/Register Page)
- Provides mode switching between login and registration.
- Form validation includes:
  - Email format
  - Password length
  - Password confirmation consistency in registration mode
- After successful login/registration, it calls `setCurrentAccountId(email)` to store the current account ID, which becomes the root key for all account-scoped local storage.
- Redirects to the map page after success.
- Social login and forgot-password are currently demo toasts.

### `src/pages/map/map.vue` (Map Page)
- Top area displays:
  - Travel coins
  - Lit-city progress (lit / total)
- Cross-platform map implementation:
  - H5: prioritizes AMap Web JS API (`AMAP_WEB_KEY`)
  - On failure: falls back to a local preview map style
  - Non-H5: uses native uni-app `<map>` component
- Default city dataset contains 8 cities (same as property page): Suzhou, Shanghai, Beijing, Hangzhou, Guangzhou, Chengdu, Lhasa, and Lijiang.
- City lighting logic:
  - On tapping an unlit city, first calls `uni.getLocation`
  - Uses Haversine formula to calculate distance between user location and city center
  - Allows lighting only if distance is within the city's radius threshold
  - On success:
    - `addLitCity(city)`
    - `rewardForCityLight()` to increase travel coins
    - Refreshes map, progress, and coin values
- Search supports both Chinese and English city names and updates map center/zoom accordingly.

### `src/pages/photo/photo.vue` (Photo Page)
- Top stats:
  - Total photos
  - Number of cities (lit cities that currently render albums)
  - Videos (currently static display)
- City album list is generated dynamically from lit cities:
  - Reads lit cities via `getCityProgress()`
  - Keeps only the 8 map-defined cities
  - Uses `buildAlbumsByCities()` to build renderable album data
- Each city card provides:
  - Add Photo: uses `uni.chooseImage`, then stores via `addPhotosToCity`
  - Post Feed: opens a popup to choose a city photo + write content, then publishes a feed post
- After publishing:
  - Adds a post via `addUserPost(...)`
  - Adds 30 coins via `rewardForPost()`
- Supports image preview via `uni.previewImage`.

### `src/pages/feed/feed.vue` (Feed Page)
- Contains three main sections:
  - Recommended users
  - Feed stream (between Recommended and Following)
  - Following user list
- Search bar behavior:
  - Typing a username shows a curtain-style dropdown result list
  - Supports follow/unfollow actions
  - Name matching supports both original names and mapped English names
- Follow state local persistence:
  - Uses `FOLLOWED_USERS_STORAGE_KEY`
  - Applies account isolation via `getAccountScopedKey`
- Feed source: `getAllFeedPosts()`
- Feed visibility rules (core):
  - Self posts: always visible
  - Followed authors: visible
  - Unfollowed authors: visible if post city is lit
- Coin badge is fixed to `+30` for each post.

### `src/pages/property/property.vue` (Property Page)
- Top area displays travel coins and property stats.
- Property set contains 8 fixed properties mapped to 8 cities, each with:
  - `name`, `region`, `price`, `requiredCity`, `owned`
- Unlock prerequisites:
  1. `requiredCity` must already be lit on the map (`canUnlockCity`)
  2. User must have enough travel coins
- On successful unlock:
  - Deducts coins via `spendTravelCoins(price)`
  - Sets `owned = true`
  - Updates owned-property stats
- For unlit cities, it shows a "Not Lit / disabled" visual state and hint text.

### `src/pages/profile/profile.vue` (Profile Page)
- Displays user profile card, upgrade progress, asset stats, achievements, and recent activity.
- Linked with global data:
  - Travel coins: `getTravelCoins()`
  - Footprints: `getCityProgress()` (lit / total)
- Keeps the same global bottom navigation as other pages.

---

## 5. Core Utility Modules (`src/utils`)

### `src/utils/account-session.js`
- Responsibility: manages current account identity and account-scoped storage keys.
- Core methods:
  - `setCurrentAccountId(accountId)`
  - `getCurrentAccountId()` (falls back to `guest` if empty)
  - `getAccountScopedKey(baseKey)` -> `baseKey:accountId`
- This is the foundation for all account-level data isolation.

### `src/utils/city-progress.js`
- Responsibility: manages lit-city progress.
- Key constants:
  - `TOTAL_CITY_COUNT = 8`
  - `DEFAULT_LIT_CITIES = ['苏州', '上海']`
- Core methods:
  - `getLitCities()` (auto-initializes defaults on first read)
  - `setLitCities(cities)`
  - `addLitCity(cityName)`
  - `isCityLit(cityName)`
  - `getCityProgress()`
- Uses account-scoped storage keys so each account has isolated city progress.

### `src/utils/travel-coins.js`
- Responsibility: unified travel-coin balance and reward logic.
- Key constants:
  - `DEFAULT_TRAVEL_COINS = 1000`
  - `REWARD_FOR_POST = 30`
  - `CITY_REWARD_MIN = 70`
  - `CITY_REWARD_MAX = 250`
- Core methods:
  - Query/Set: `getTravelCoins`, `setTravelCoins`
  - Increase/Spend: `addTravelCoins`, `spendTravelCoins`
  - Rewards: `rewardForPost`, `rewardForCityLight`
- Uses account-scoped keys, ensuring an independent wallet per account.

### `src/utils/photo-albums.js`
- Responsibility: manages city-based photo albums.
- Core methods:
  - `getPhotosByCity(cityName)`
  - `addPhotosToCity(cityName, photos)`
  - `buildAlbumsByCities(cities)` (converts city list into page-renderable album structure)
- Normalizes city names consistently (removes `市` suffix) to avoid duplicate keys.
- Storage is account-isolated.

### `src/utils/feed-posts.js`
- Responsibility: manages feed data source (preset external posts + self-created posts).
- Data composition:
  - `EXTERNAL_POSTS`: predefined external posts
  - User-created posts: local storage
- Core methods:
  - `addUserPost(post)`
  - `getAllFeedPosts()` (merge and sort by `createdAt` descending)
  - `formatFeedDate(timestamp)` (date formatting for feed display)
- Enforces fixed reward value of 30 for a unified feed coin standard.
- Storage is account-isolated.

---

## 6. Cloud Function and Backend Placeholder

### `src/uniCloud/cloudfunctions/travel-map/index.js`
- `action = getTravelPoints`:
  - Returns the default 8-city map points (including coordinates and preview positions).
- `action = geocode`:
  - Performs geocoding with AMap REST API (depends on `AMAP_REST_KEY` environment variable).
- Purpose:
  - Allows frontend map points to be fetched via cloud function
  - Reserves an interface shape for future integration with real backend/map services

---

## 7. Design System and Visual Assets

### `src/design-system.json`
- Stores design tokens and UI asset links, including:
  - Color palette and gradients
  - Typography and spacing
  - Shadows and border radius
  - Icon and decoration URLs
- Currently imported directly by the login page. Other pages mostly use their own inline asset objects (also sourced from design assets).

---

## 8. Configuration File Responsibilities

### `src/manifest.json`
- App platform capability configuration (App, mini-programs, permissions, packaging parameters, etc.).
- Currently in a base template state with required cross-platform build fields.

### `package.json` (project root)
- Declares uni-app multi-platform dev/build scripts (H5, mini-programs, quick apps, etc.).
- Manages runtime dependencies (`@dcloudio/*`, `vue`) and build dependencies (`vite`, etc.).

---

## 9. Key Cross-Page Data Linkages

- **Lighting a city on the map** -> updates `city-progress`  
  - Affects map progress display
  - Controls whether city albums appear on the photo page
  - Updates footprint stats on the profile page
  - Controls whether city properties can be purchased on the property page
  - Affects visibility of stranger posts on the feed page

- **Publishing a feed post** -> updates `feed-posts` + `travel-coins`  
  - Post becomes immediately visible in feed (sorted by latest first)
  - Adds 30 coins, and all coin displays sync across pages

- **Account switch (login)** -> changes account-scoped keys  
  - Lit cities, travel coins, albums, posts, and follow state all switch to the selected account's data space

---

## 10. `uni_modules` Directory Notes (Overview)

`src/uni_modules` mainly contains official/community DCloud module code (such as map and uniCloud-related modules), which belongs to dependency implementation layers.  
The project's business logic is primarily concentrated in `src/pages`, `src/utils`, and `src/uniCloud/cloudfunctions/travel-map`, so this document focuses on business code and does not explain `uni_modules` internals file by file.

---

## 11. Current Implementation Characteristics and Boundaries

- The account system is currently a frontend demo login flow: email is used as the account ID anchor, without a real token-based authentication flow.
- Most core data is still implemented with local storage, but the field model is already suitable for backend migration.
- The map supports AMap Web API on H5 and includes a fallback visual mode for network/script failures.
- UI text has been English-localized, while this guide is intended for technical handoff and code understanding.

