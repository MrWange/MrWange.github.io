<template>
    <div class="auth-container">
      <!-- 登录/注册表单卡片 -->
      <a-card class="auth-card" :bordered="false">
        <!-- 标题 -->
        <div class="logo-container">
          <img src="../assets/logo.png" alt="Logo" class="logo" />
          <h1 class="title">刷题助手</h1>
        </div>
  
        <!-- 切换标签 -->
        <a-tabs v-model:activeKey="activeTab" centered>
          <a-tab-pane key="login" tab="登录">
            <!-- 登录表单 -->
            <a-form
              :model="loginForm"
              :rules="loginRules"
              layout="vertical"
              @finish="handleLogin"
            >
              <a-form-item name="username" label="用户名">
                <a-input v-model:value="loginForm.username" placeholder="请输入用户名">
                  <template #prefix><UserOutlined /></template>
                </a-input>
              </a-form-item>
              <a-form-item name="password" label="密码">
                <a-input-password v-model:value="loginForm.password" placeholder="请输入密码">
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
  
              <div class="form-actions">
                <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
                <a class="forgot-link">忘记密码？</a>
              </div>
  
              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="loginLoading" block>
                  登录
                </a-button>
              </a-form-item>
  
              <!-- 第三方登录 -->
              <div class="third-party-login">
                <div class="divider-with-text">第三方登录</div>
                <div class="social-icons">
                  <a-button shape="circle" class="social-icon">
                    <template #icon><WechatOutlined /></template>
                  </a-button>
                  <a-button shape="circle" class="social-icon">
                    <template #icon><QqOutlined /></template>
                  </a-button>
                  <a-button shape="circle" class="social-icon">
                    <template #icon><GithubOutlined /></template>
                  </a-button>
                </div>
              </div>
            </a-form>
          </a-tab-pane>
  
          <a-tab-pane key="register" tab="注册">
            <!-- 注册表单 -->
            <a-form
              :model="registerForm"
              :rules="registerRules"
              layout="vertical"
              @finish="handleRegister"
            >
              <a-form-item name="username" label="用户名">
                <a-input v-model:value="registerForm.username" placeholder="请设置用户名">
                  <template #prefix><UserOutlined /></template>
                </a-input>
              </a-form-item>
              <a-form-item name="email" label="邮箱">
                <a-input v-model:value="registerForm.email" placeholder="请输入邮箱">
                  <template #prefix><MailOutlined /></template>
                </a-input>
              </a-form-item>
              <a-form-item name="password" label="密码">
                <a-input-password v-model:value="registerForm.password" placeholder="请设置密码">
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
              <a-form-item name="confirmPassword" label="确认密码">
                <a-input-password v-model:value="registerForm.confirmPassword" placeholder="请再次输入密码">
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
  
              <!-- 协议同意 -->
              <a-form-item name="agreement">
                <a-checkbox v-model:checked="registerForm.agreement">
                  我已阅读并同意 <a>《用户协议》</a> 和 <a>《隐私政策》</a>
                </a-checkbox>
              </a-form-item>
  
              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="registerLoading" block>
                  注册
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    WechatOutlined,
    QqOutlined,
    GithubOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import api from '../services/api'
import { userStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const activeTab = ref('login')
const rememberMe = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

// 登录表单数据
const loginForm = reactive({
    username: '',
    password: ''
})

// 注册表单数据
const registerForm = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false
})

// 登录表单验证规则
const loginRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 注册表单验证规则
const registerRules = {
    username: [
    { required: true, message: '请设置用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
    ],
    email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, message: '密码至少为6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
        validator: (rule: any, value: string) => {
        if (!value || registerForm.password === value) {
            return Promise.resolve()
        }
        return Promise.reject('两次输入的密码不一致')
        },
        trigger: 'blur'
    }
    ],
    agreement: [
    {
        validator: (rule: any, value: boolean) => {
        if (value) {
            return Promise.resolve()
        }
        return Promise.reject('请阅读并同意用户协议和隐私政策')
        },
        trigger: 'change'
    }
    ]
}

// 登录处理
const handleLogin = async () => {
    loginLoading.value = true
    
    try {
        const result = await userStore.login(loginForm.username, loginForm.password)
        
        if (result.success) {
            message.success('登录成功！')
            
            // 检查是否有重定向
            const redirectPath = route.query.redirect as string || '/'
            router.push(redirectPath)
        } else {
            message.error(result.message)
        }
    } catch (error) {
        message.error('登录失败，请稍后重试')
    } finally {
        loginLoading.value = false
    }
}

// 注册处理
const handleRegister = async () => {
    registerLoading.value = true
    
    try {
        await api.post('/users/register', {
            username: registerForm.username,
            email: registerForm.email,
            password: registerForm.password
        })
        
        message.success('注册成功！请登录')
        activeTab.value = 'login'
        
        // 清空注册表单
        registerForm.username = ''
        registerForm.email = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
        registerForm.agreement = false
    } catch (error) {
        if (error.response && error.response.data) {
            message.error(error.response.data.message || '注册失败')
        } else {
            message.error('注册失败，请稍后重试')
        }
    } finally {
        registerLoading.value = false
    }
}
</script>

<style scoped lang="less">
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;

    .auth-card {
    width: 420px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    border-radius: 8px;

    :deep(.ant-card-body) {
        padding: 30px;
    }
    }

    .logo-container {
    text-align: center;
    margin-bottom: 24px;

    .logo {
        height: 64px;
        margin-bottom: 8px;
    }

    .title {
        margin: 0;
        color: #1890ff;
        font-size: 24px;
    }
    }

    .form-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;

    .forgot-link {
        color: #1890ff;
        cursor: pointer;
    }
    }

    .third-party-login {
    margin-top: 24px;

    .divider-with-text {
        position: relative;
        color: #888;
        text-align: center;
        margin: 16px 0;

        &::before,
        &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: calc(50% - 40px);
        height: 1px;
        background: #eee;
        }

        &::before {
        left: 0;
        }

        &::after {
        right: 0;
        }
    }

    .social-icons {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 16px;

        .social-icon {
        font-size: 20px;
        }
    }
    }
}

// 移动端适配
@media screen and (max-width: 480px) {
    .auth-container {
    padding: 10px;
    
    .auth-card {
        width: 100%;
        
        :deep(.ant-card-body) {
        padding: 20px;
        }
    }
    
    .logo-container {
        margin-bottom: 16px;
        
        .logo {
        height: 48px;
        }
        
        .title {
        font-size: 20px;
        }
    }
    }
}
</style>