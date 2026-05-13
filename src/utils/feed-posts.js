import { getAccountScopedKey } from './account-session'

const STORAGE_KEY = 'travel-feed-posts-v1'
const FIXED_POST_REWARD = 30

const EXTERNAL_POSTS = [
  {
    id: 'external-1',
    authorName: '北京老张',
    authorEmoji: '🧑',
    authorAvatarBg: 'linear-gradient(135deg, #51a2ff 0%, #c27aff 100%)',
    city: '北京市',
    content: 'The Forbidden City is stunning. Red walls and golden roofs are full of history. Highly recommended in the morning when it is cooler and less crowded.',
    imageUrl: '',
    reward: FIXED_POST_REWARD,
    likes: 28,
    comments: 5,
    createdAt: Date.now() - 3600 * 1000 * 24 * 2,
    source: 'external'
  },
  {
    id: 'external-2',
    authorName: '魔都小李',
    authorEmoji: '👨',
    authorAvatarBg: 'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
    city: '上海市',
    content: 'The breeze on the Bund is amazing tonight. Walking by the Huangpu River is super relaxing, and the night view is perfect for photos.',
    imageUrl: '',
    reward: FIXED_POST_REWARD,
    likes: 16,
    comments: 2,
    createdAt: Date.now() - 3600 * 1000 * 15,
    source: 'external'
  }
]

function safeParsePosts(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

function getUserPosts() {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  const raw = uni.getStorageSync(scopedKey)
  return safeParsePosts(raw)
}

function saveUserPosts(posts) {
  const scopedKey = getAccountScopedKey(STORAGE_KEY)
  uni.setStorageSync(scopedKey, JSON.stringify(posts))
}

export function addUserPost(post) {
  const posts = getUserPosts()
  posts.push(post)
  saveUserPosts(posts)
}

export function getAllFeedPosts() {
  const userPosts = getUserPosts()
  return [...EXTERNAL_POSTS, ...userPosts]
    .map((post) => ({
      ...post,
      reward: FIXED_POST_REWARD
    }))
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
}

export function formatFeedDate(timestamp) {
  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) return '刚刚'
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
