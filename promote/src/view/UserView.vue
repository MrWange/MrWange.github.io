<template>
    <a-layout-content class="content">
      <!-- 用户信息卡片 -->
      <a-card class="user-card">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="8">
            <a-avatar :size="100" :src="userStore.state.avatar" />
          </a-col>
          <a-col :xs="24" :sm="16">
            <h2>{{ userStore.state.username }}</h2>
            <p>{{ userStore.state.email }}</p>
            <a-tag color="blue">{{ userStore.state.role }}</a-tag>
            <div class="user-actions">
              <a-button type="primary" @click="showEditModal">编辑资料</a-button>
              <a-button type="default" @click="handleLogout">退出登录</a-button>
            </div>
          </a-col>
        </a-row>
      </a-card>
  
      <!-- 选项卡 -->
      <a-card class="tabs-card">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="activities" tab="最近活动">
            <a-list
              :data-source="activities"
              item-layout="horizontal"
              :loading="activitiesLoading"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta
                    :avatar="item.icon"
                    :title="item.title"
                    :description="item.time"
                  />
                </a-list-item>
              </template>
            </a-list>
            <a-empty v-if="!activitiesLoading && activities.length === 0" description="暂无活动记录" />
          </a-tab-pane>
          
          <a-tab-pane key="notifications" tab="消息通知" :badge="unreadCount || 0">
            <div class="notification-actions">
              <a-space>
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="markAllAsRead"
                  :disabled="notifications.length === 0 || allRead"
                >
                  标记全部已读
                </a-button>
                <a-button 
                  danger
                  size="small" 
                  @click="clearAllNotifications"
                  :disabled="notifications.length === 0"
                >
                  清空所有通知
                </a-button>
                
                <!-- 仅在开发环境显示测试按钮 -->
                <a-button 
                  v-if="isDevelopment"
                  type="dashed" 
                  size="small" 
                  @click="createTestNotification"
                >
                  创建测试通知
                </a-button>
              </a-space>
            </div>
            
            <a-list
              :data-source="notifications"
              item-layout="horizontal"
              :loading="notificationsLoading"
              :pagination="notificationPagination"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: getTypeColor(item.type) }">
                        <component :is="getTypeIcon(item.type)" />
                      </a-avatar>
                    </template>
                    <template #title>
                      <div class="notification-title">
                        <span>{{ item.content }}</span>
                        <a-tag v-if="!item.is_read" color="blue">未读</a-tag>
                      </div>
                    </template>
                    <template #description>
                      <div class="notification-description">
                        <span>{{ formatDate(item.created_at) }}</span>
                        <a-space>
                          <a v-if="!item.is_read" @click="markAsRead(item.id)">标记已读</a>
                          <a v-if="item.related_id" @click="goToRelatedItem(item)">查看</a>
                          <a @click="deleteNotification(item.id)">删除</a>
                        </a-space>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
            <a-empty v-if="!notificationsLoading && notifications.length === 0" description="暂无消息通知" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
  
      <!-- 编辑资料弹窗 -->
      <a-modal
        v-model:visible="editModalVisible"
        title="编辑个人资料"
        @ok="handleEditSubmit"
        :confirmLoading="editLoading"
      >
        <a-form :model="editForm" layout="vertical">
          <a-form-item label="用户名">
            <a-input v-model:value="editForm.name" />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input v-model:value="editForm.email" />
          </a-form-item>
          <a-form-item label="头像">
            <a-input v-model:value="editForm.avatar" placeholder="头像URL" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-layout-content>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  UserOutlined, 
  EditOutlined, 
  LogoutOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CommentOutlined,
  LikeOutlined,
  BellOutlined
} from '@ant-design/icons-vue'
import api from '../services/api'
import { userStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const activitiesLoading = ref(true)
const notificationsLoading = ref(true)
const editModalVisible = ref(false)
const editLoading = ref(false)

// 活跃选项卡
const activeTab = ref('activities')

// 从URL参数获取选项卡
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'notifications') {
    activeTab.value = 'notifications'
  }
}, { immediate: true })

// 用户活动
const activities = ref([])

// 用户通知
const notifications = ref([])

// 通知分页
const notificationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page) => {
    notificationPagination.current = page
    fetchNotifications()
  }
})

// 未读通知数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

// 是否全部已读
const allRead = computed(() => {
  return notifications.value.every(n => n.is_read)
})

// 编辑表单数据
const editForm = reactive({
    name: userStore.state.username,
    email: userStore.state.email,
    avatar: userStore.state.avatar
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  try {
    return new Date(dateString).toLocaleString()
  } catch (e) {
    return dateString
  }
}

// 获取通知类型图标
const getTypeIcon = (type) => {
  const icons = {
    '评论': h(CommentOutlined),
    '点赞': h(LikeOutlined),
    '系统': h(BellOutlined)
  }
  return icons[type] || h(BellOutlined)
}

// 获取通知类型颜色
const getTypeColor = (type) => {
  const colors = {
    '评论': '#1890ff',
    '点赞': '#ff4d4f',
    '系统': '#722ed1'
  }
  return colors[type] || '#1890ff'
}

// 加载用户活动
const loadUserActivities = async () => {
    activitiesLoading.value = true
    try {
        const response = await api.get('/questions/user/attempts', {
            params: { limit: 5 } // 只获取最近5条
        })
        
        // 确保数据存在
        if (response.data && response.data.data && response.data.data.attempts) {
            // 格式化活动记录
            activities.value = response.data.data.attempts.map(attempt => ({
                icon: h(attempt.is_correct ? CheckCircleOutlined : CloseCircleOutlined),
                title: `回答了问题: ${attempt.title}`,
                time: new Date(attempt.attempt_time).toLocaleString(),
                result: attempt.is_correct ? '正确' : '错误'
            }))
        } else {
            activities.value = []
        }
    } catch (error) {
        console.error('获取活动记录失败', error)
        activities.value = []
    } finally {
        activitiesLoading.value = false
    }
}

// 获取通知列表
const fetchNotifications = async () => {
  notificationsLoading.value = true
  try {
    const response = await api.get('/notifications', {
      params: {
        page: notificationPagination.current,
        limit: notificationPagination.pageSize
      }
    })
    
    console.log('获取到通知数据:', response.data)
    
    if (response.data && response.data.notifications) {
      notifications.value = response.data.notifications
      if (response.data.pagination) {
        notificationPagination.total = response.data.pagination.total || 0
      }
    } else {
      notifications.value = []
      notificationPagination.total = 0
    }
    
    // 更新全局未读通知计数
    const unreadCount = notifications.value.filter(n => !n.is_read).length
    window.dispatchEvent(new CustomEvent('notifications-updated', {
      detail: { unreadCount }
    }))
  } catch (error) {
    console.error('获取通知失败', error)
    notifications.value = []
    
    // 检查是否是权限问题
    if (error.response && error.response.status === 401) {
      message.error('获取通知失败，请重新登录')
    } else {
      message.error('获取通知失败，请稍后重试')
    }
  } finally {
    notificationsLoading.value = false
  }
}

// 标记通知为已读
const markAsRead = async (notificationId) => {
  try {
    await api.put(`/notifications/${notificationId}/read`)
    
    // 更新本地通知状态
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.is_read = true
    }
    
    // 更新未读计数
    updateUnreadCount()
    
    message.success('已标记为已读')
  } catch (error) {
    console.error('标记通知失败', error)
    message.error('操作失败，请重试')
  }
}

// 标记全部已读
const markAllAsRead = async () => {
  try {
    await api.put('/notifications/mark-all-read')
    
    // 更新所有通知状态
    notifications.value.forEach(notification => {
      notification.is_read = true
    })
    
    // 更新未读计数
    updateUnreadCount()
    
    message.success('已全部标记为已读')
  } catch (error) {
    console.error('标记全部已读失败', error)
    message.error('操作失败，请重试')
  }
}

// 删除单个通知
const deleteNotification = async (notificationId) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条通知吗？',
    async onOk() {
      try {
        await api.delete(`/notifications/${notificationId}`)
        
        // 从列表中删除通知
        notifications.value = notifications.value.filter(n => n.id !== notificationId)
        
        // 更新未读计数
        updateUnreadCount()
        
        message.success('通知已删除')
      } catch (error) {
        console.error('删除通知失败', error)
        message.error('删除失败，请重试')
      }
    }
  })
}

// 清空所有通知
const clearAllNotifications = async () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有通知吗？此操作不可恢复。',
    async onOk() {
      try {
        await api.delete('/notifications')
        
        // 清空通知列表
        notifications.value = []
        
        // 更新未读计数
        updateUnreadCount()
        
        message.success('所有通知已清空')
      } catch (error) {
        console.error('清空通知失败', error)
        message.error('操作失败，请重试')
      }
    }
  })
}

// 更新未读计数
const updateUnreadCount = () => {
  const unreadCount = notifications.value.filter(n => !n.is_read).length
  window.dispatchEvent(new CustomEvent('notifications-updated', {
    detail: { unreadCount }
  }))
}

// 跳转到相关内容
const goToRelatedItem = (notification) => {
  // 根据通知类型和相关ID跳转
  if (notification.type === '评论' || notification.type === '点赞') {
    router.push(`/discuss?id=${notification.related_id}`)
    
    // 自动标记为已读
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }
}

// 显示编辑弹窗
const showEditModal = () => {
    editForm.name = userStore.state.username
    editForm.email = userStore.state.email
    editForm.avatar = userStore.state.avatar
    editModalVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
    editLoading.value = true
    try {
        const result = await userStore.updateUserInfo({
            username: editForm.name,
            email: editForm.email,
            avatar: editForm.avatar
        })
        
        if (result.success) {
            editModalVisible.value = false
            message.success('资料更新成功')
        } else {
            message.error(result.message)
        }
    } catch (error) {
        message.error('更新失败，请稍后重试')
    } finally {
        editLoading.value = false
    }
}

// 退出登录
const handleLogout = async () => {
    const result = await userStore.logout()
    
    if (result.success) {
        message.success('已退出登录')
        router.push('/login')
    } else {
        message.error(result.message)
    }
}

// 检查是否是开发环境
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development'
})

// 添加测试通知功能（仅开发环境使用）
const createTestNotification = async () => {
  try {
    await api.post('/notifications/test', {
      content: '这是一条测试通知',
      type: '系统'
    })
    
    message.success('测试通知已创建')
    fetchNotifications() // 刷新通知列表
  } catch (error) {
    console.error('创建测试通知失败', error)
    message.error('创建测试通知失败')
  }
}

// 组件挂载时加载数据
onMounted(async () => {
    // 刷新用户信息
    await userStore.fetchUserInfo()
    
    // 并行加载活动和通知
    await Promise.all([
      loadUserActivities(),
      fetchNotifications()
    ])
})
</script>

<style scoped lang="less">
.content {
  padding: 24px;
  background: #f0f2f5;

  .user-card {
    margin-bottom: 24px;
    padding: 24px;
    display: flex;
    align-items: center;

    .user-actions {
      margin-top: 16px;

      a-button {
        margin-right: 8px;
      }
    }
  }

  .tabs-card {
    margin-bottom: 24px;
    
    .notification-actions {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }
    
    .notification-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .notification-description {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .content {
    padding: 12px;

    .user-card {
      flex-direction: column;
      align-items: flex-start;

      .user-actions {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }
    
    .notification-description {
      flex-direction: column;
      align-items: flex-start;
      
      span {
        margin-bottom: 4px;
      }
    }
  }
}
</style>