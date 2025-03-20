<template>
    <a-layout class="layout">
      <!-- 顶部导航 -->
      <a-layout-header class="header">
        <div class="logo">刷题助手</div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="horizontal"
          :items="menuItems"
          class="nav-menu"
        />
        <div class="header-actions">
          <!-- 通知图标 -->
          <a-badge :count="notificationCount" :dot="notificationCount > 0">
            <a-button 
              type="text" 
              shape="circle" 
              @click="goToNotifications"
              class="notification-button"
            >
              <BellOutlined style="color: white" />
            </a-button>
          </a-badge>
          
          <!-- 用户头像 -->
          <a-dropdown v-if="isLoggedIn">
            <a class="ant-dropdown-link" @click.prevent>
              <a-avatar :src="userAvatar" :size="28">
                {{ userInitial }}
              </a-avatar>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="0" @click="goToUserCenter">
                  <UserOutlined /> 个人中心
                </a-menu-item>
                <a-menu-item v-if="isAdmin" key="2" @click="goToAdmin">
                  <SettingOutlined /> 管理后台
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="1" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button v-else type="primary" size="small" @click="goToLogin">
            登录
          </a-button>
        </div>
      </a-layout-header>
      
      <!-- 子路由 -->
      <router-view />
  
      <!-- 底部 -->
      <a-layout-footer class="footer">
        刷题助手 ©2024 Created by Your Name
      </a-layout-footer>
    </a-layout>
</template>
  
<script setup lang="ts">
    import { ref, h, onMounted, watch, computed, onUnmounted } from 'vue'
    import {
        HomeOutlined,
        ThunderboltOutlined,
        BellOutlined,
        UserOutlined,
        LogoutOutlined,
        SettingOutlined
    } from '@ant-design/icons-vue'
    
    import { useRouter, useRoute } from 'vue-router'
    import { message } from 'ant-design-vue'
    import { userStore } from '../store/user'
    import api from '../services/api'

    const router = useRouter()
    const route = useRoute()

    // 菜单选中项
    const selectedKeys = ref(['home'])
    
    // 通知数量
    const notificationCount = ref(0)

    // 用户登录状态和信息
    const isLoggedIn = computed(() => userStore.state.isLoggedIn)
    const userAvatar = computed(() => userStore.state.avatar || '')
    const userInitial = computed(() => {
        return userStore.state.username ? userStore.state.username.charAt(0).toUpperCase() : '?'
    })
    
    // 检查是否为管理员
    const isAdmin = computed(() => userStore.state.role === '管理员')

    // 路由路径与菜单key的映射
    const routeToMenuKey = {
        '/index': 'home',
        '/multipleChoice': 'quickChoice',
        '/contest': 'contest',
        '/analysis': 'analysis',
        '/discuss': 'discuss',
        '/user': 'user',
        '/admin': 'admin'
    }

    // 根据当前路由设置选中状态
    const updateSelectedKeys = () => {
        const currentPath = route.path
        const menuKey = routeToMenuKey[currentPath as keyof typeof routeToMenuKey] || 'home'
        selectedKeys.value = [menuKey]
    }

    // 获取未读通知数量
    const fetchNotificationCount = async () => {
        if (!isLoggedIn.value) {
            notificationCount.value = 0
            return
        }
        
        try {
            // 修正API端点路径，去掉多余的/api前缀
            const response = await api.get('/notifications/unread-count')
            notificationCount.value = response.data.count || 0
            console.log('获取到未读通知数量:', notificationCount.value)
        } catch (error) {
            console.error('获取未读通知数量失败', error)
            // 不设置默认值，保持原状态
        }
    }

    // 前往通知页面
    const goToNotifications = () => {
        router.push('/user?tab=notifications')
    }

    // 前往用户中心
    const goToUserCenter = () => {
        router.push('/user')
    }
    
    // 前往管理后台
    const goToAdmin = () => {
        router.push('/admin')
    }

    // 前往登录页面
    const goToLogin = () => {
        router.push('/login')
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

    // 监听通知更新事件
    const handleNotificationsUpdated = (event) => {
        if (event.detail && typeof event.detail.unreadCount === 'number') {
            notificationCount.value = event.detail.unreadCount
        } else {
            // 如果没有具体数量，就重新获取
            fetchNotificationCount()
        }
    }

    // 监听路由变化
    watch(() => route.path, updateSelectedKeys)

    // 组件挂载时设置选中状态和获取通知
    onMounted(() => {
        updateSelectedKeys()
        
        // 确保用户已登录后再获取通知
        if (isLoggedIn.value) {
            fetchNotificationCount()
        }
        
        // 添加登录状态监听
        watch(() => isLoggedIn.value, (newValue) => {
            if (newValue) {
                fetchNotificationCount()
            } else {
                notificationCount.value = 0
            }
        })
        
        // 监听通知更新事件
        window.addEventListener('notifications-updated', handleNotificationsUpdated)
        
        // 定期刷新通知计数（每分钟）
        const intervalId = setInterval(() => {
            if (isLoggedIn.value) {
                fetchNotificationCount()
            }
        }, 60000)
        
        // 清理定时器
        onUnmounted(() => {
            clearInterval(intervalId)
            window.removeEventListener('notifications-updated', handleNotificationsUpdated)
        })
    })
    
    // 计算菜单项，根据用户角色动态显示管理员菜单
    const menuItems = computed(() => {
        const items = [
            {
                key: 'home',
                icon: () => h(HomeOutlined),
                label: '首页',
                onClick: () => router.push('/index')
            },
            {
                key: 'quickChoice',
                icon: () => h(ThunderboltOutlined),
                label: '选择题速刷',
                onClick: () => router.push('/multipleChoice')
            },
            {
                key: 'contest',
                label: '竞赛',
                onClick: () => router.push('/contest')
            },
            {
                key: 'analysis',
                label: '分析',
                onClick: () => router.push('/analysis')
            },
            {
                key: 'discuss',
                label: '讨论',
                onClick: () => router.push('/discuss')
            },
            {
                key: 'user',
                label: '个人中心',
                onClick: () => router.push('/user')
            }
        ]
        
        // 只有管理员才显示管理后台菜单
        if (isAdmin.value) {
            items.push({
                key: 'admin',
                icon: () => h(SettingOutlined),
                label: '管理后台',
                onClick: () => router.push('/admin')
            })
        }
        
        return items
    })
</script>

<style scoped lang="less">
    .layout {
        min-height: 100vh;
    }

    .header {
        display: flex;
        align-items: center;
        padding: 0 20px;
        overflow: hidden; // 防止内容溢出

        .logo {
            color: white;
            font-size: 20px;
            font-weight: bold;
            margin-right: 48px;
            white-space: nowrap; // 防止文字换行
        }

        .nav-menu {
            flex: 1;
            min-width: 0; // 防止菜单项溢出
        }

        .header-actions {
            display: flex;
            align-items: center;
            margin-left: 12px;
            
            .notification-button {
                margin-right: 12px;
                color: white;
            }
            
            .ant-avatar {
                cursor: pointer;
                background-color: #1890ff;
                color: white;
            }
        }

        // 移动端样式
        @media screen and (max-width: 768px) {
            padding: 0 10px;
            
            .logo {
                margin-right: 12px; // 减小右边距
                font-size: 16px;
            }

            :deep(.ant-menu) {
                flex: 1;
                
                .ant-menu-item {
                    padding: 0 8px; // 减小内边距
                    margin: 0 1px; // 减小外边距
                    font-size: 14px; // 减小字体大小
                    
                    .ant-menu-title-content {
                        padding: 0; // 移除内边距
                    }
                    
                    .anticon {
                        margin-right: 2px; // 减小图标右边距
                        font-size: 14px; // 减小图标大小
                    }
                }

                // 隐藏较长的菜单项文字
                .ant-menu-overflow-item {
                    flex: none !important;
                }
            }

            .header-actions {
                margin-left: 4px;
                
                .notification-button {
                    margin-right: 6px;
                }
                
                .ant-avatar {
                    size: 24px !important;
                }
            }
        }

        // 超小屏幕适配
        @media screen and (max-width: 375px) {
            .logo {
                font-size: 14px;
                margin-right: 8px;
            }

            :deep(.ant-menu) {
                .ant-menu-item {
                    padding: 0 6px;
                    font-size: 12px;
                }
            }
        }
    }

    

.footer {
    text-align: center;
    background: #f0f2f5;
    padding: 12px;

    @media screen and (max-width: 768px) {
        font-size: 12px;
    }
}

// 全局响应式调整
@media screen and (max-width: 768px) {
    :deep(.ant-tag) {
        margin-bottom: 4px;
    }
    :deep(.ant-menu-item-icon) {
        margin-right: 4px;  // 移动端下图标右边距调小
        }
    :deep(.ant-list-pagination) {
        text-align: center;
        .ant-pagination-options {
        display: none;
        }
    }
}
</style>