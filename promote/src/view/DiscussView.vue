<template>
    <a-layout-content class="content">
      <!-- 顶部操作栏 -->
      <div class="action-header">
        <a-space>
          <a-button type="primary" @click="showPostModal">
            <template #icon><EditOutlined /></template>
            发布讨论
          </a-button>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索讨论内容"
            style="width: 200px"
            @search="onSearch"
          />
        </a-space>
        <a-space>
          <a-radio-group v-model:value="sortBy" button-style="solid">
            <a-radio-button value="newest">最新</a-radio-button>
            <a-radio-button value="hottest">最热</a-radio-button>
          </a-radio-group>
        </a-space>
      </div>
  
      <!-- 讨论列表 -->
      <div class="discussion-list">
        <a-list
          :data-source="discussions"
          :loading="loading"
          item-layout="vertical"
          :pagination="pagination"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <template #actions>
                <span @click="handleLike(item)">
                  <LikeOutlined :style="{ color: item.liked ? '#1890ff' : '' }" />
                  {{ item.like_count || 0 }}
                </span>
                <span @click="showComments(item)">
                  <MessageOutlined />
                  {{ item.comment_count || 0 }}
                </span>
                <span v-if="isCurrentUser(item.author_id, item)" @click.stop="handleDeleteDiscussion(item)">
                  <DeleteOutlined style="color: #ff4d4f" />
                </span>
                <span v-if="!isCurrentUser(item.author_id, item)" @click.stop="handleReportDiscussion(item)">
                  <WarningOutlined style="color: #ff4d4f" />
                  举报
                </span>
                <div v-if="false" style="font-size: 10px; color: #999; position: absolute; right: 0; top: 0;">
                  作者ID: {{ item.author_id || '无' }} | 
                  用户ID: {{ currentUserInfo.userId || '无' }} |
                  匹配: {{ isCurrentUser(item.author_id, item) ? '是' : '否' }}
                </div>
              </template>
              <a-list-item-meta>
                <template #title>
                  <a @click="showComments(item)">{{ item.title }}</a>
                </template>
                <template #avatar>
                  <a-avatar :src="item.author_avatar || ''">
                    {{ item.author_name?.charAt(0) || 'U' }}
                  </a-avatar>
                </template>
                <template #description>
                  <a-space>
                    <span>{{ item.author_name || '匿名用户' }}</span>
                    <a-tag color="blue">{{ item.tag || '讨论' }}</a-tag>
                    <span>{{ formatDate(item.created_at) }}</span>
                  </a-space>
                </template>
              </a-list-item-meta>
              <div class="content-preview">{{ item.content }}</div>
            </a-list-item>
          </template>
        </a-list>
      </div>
  
      <!-- 发布讨论弹窗 -->
      <a-modal
        v-model:visible="postModalVisible"
        title="发布讨论"
        @ok="handlePostSubmit"
        :confirmLoading="postLoading"
      >
        <a-form :model="postForm" layout="vertical">
          <a-form-item label="标题" required>
            <a-input v-model:value="postForm.title" placeholder="请输入标题" />
          </a-form-item>
          <a-form-item label="标签" required>
            <a-select v-model:value="postForm.tag" placeholder="选择标签">
              <a-select-option value="题解">题解</a-select-option>
              <a-select-option value="讨论">讨论</a-select-option>
              <a-select-option value="分享">分享</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea
              v-model:value="postForm.content"
              :rows="4"
              placeholder="请输入内容"
            />
          </a-form-item>
        </a-form>
      </a-modal>
  
      <!-- 评论弹窗 -->
      <a-drawer
        v-model:visible="commentDrawerVisible"
        :title="currentDiscussion?.title || '讨论详情'"
        placement="right"
      >
        <template v-if="currentDiscussion">
          <!-- 原帖内容 -->
          <div class="post-content">
            <a-comment>
              <template #avatar>
                <a-avatar :src="currentDiscussion?.author_avatar || ''">
                  {{ (currentDiscussion?.author_name && currentDiscussion?.author_name.charAt(0)) || 'U' }}
                </a-avatar>
              </template>
              <template #author>{{ currentDiscussion?.author_name || '匿名用户' }}</template>
              <template #content>
                <p>{{ currentDiscussion?.content }}</p>
              </template>
              <template #datetime>{{ formatDate(currentDiscussion?.created_at) }}</template>
            </a-comment>
          </div>
  
          <a-divider />
  
          <!-- 评论列表 -->
          <div class="comments-section">
            <a-list
              :data-source="comments"
              item-layout="horizontal"
              :loading="commentsLoading"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-comment>
                    <template #avatar>
                      <a-avatar :src="item.author_avatar || ''">
                        {{ (item.author_name && item.author_name.charAt(0)) || 'U' }}
                      </a-avatar>
                    </template>
                    <template #author>{{ item.author_name || '匿名用户' }}</template>
                    <template #content>
                      <p>{{ item.content }}</p>
                    </template>
                    <template #datetime>{{ formatDate(item.created_at) }}</template>
                    <template #actions>
                      <a v-if="isCurrentUser(item.author_id, item)" @click="handleDeleteComment(item.id)">删除</a>
                      <a v-if="!isCurrentUser(item.author_id, item)" @click="handleReportComment(item.id)">举报</a>
                    </template>
                  </a-comment>
                </a-list-item>
              </template>
            </a-list>
          </div>
  
          <!-- 发表评论 -->
          <div class="comment-form">
            <a-form-item>
              <a-textarea
                v-model:value="newComment"
                :rows="2"
                placeholder="写下你的评论..."
              />
            </a-form-item>
            <a-button type="primary" @click="handleCommentSubmit">发表评论</a-button>
          </div>
        </template>
      </a-drawer>
    </a-layout-content>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, watch } from 'vue'
  import {
    EditOutlined,
    LikeOutlined,
    MessageOutlined,
    StarOutlined,
    DeleteOutlined,
    WarningOutlined
  } from '@ant-design/icons-vue'
  import { message, Modal } from 'ant-design-vue'
  import api from '../services/api'
  import { userStore } from '../store/user'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  
  // 讨论列表数据
  const discussions = ref([])
  const loading = ref(true)
  const searchText = ref('')
  const sortBy = ref('newest')
  const postModalVisible = ref(false)
  const postLoading = ref(false)
  const commentDrawerVisible = ref(false)
  const currentDiscussion = ref(null)
  const comments = ref([])
  const commentsLoading = ref(false)
  const newComment = ref('')
  
  // 分页配置
  const pagination = reactive({
    pageSize: 10,
    total: 0,
    current: 1,
    onChange: (page: number) => {
      pagination.current = page
      fetchDiscussions()
    }
  })
  
  // 表单数据
  const postForm = ref({
    title: '',
    tag: '',
    content: ''
  })
  
  // 是否显示调试信息，开发环境下可设为true
  const showDebugInfo = ref(process.env.NODE_ENV === 'development')
  
  // 调试变量：显示当前用户信息
  const currentUserInfo = ref({
    isLoggedIn: false,
    userId: null,
    username: ''
  })
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '未知时间'
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return dateString
    }
  }
  
  // 获取讨论列表
  const fetchDiscussions = async () => {
    loading.value = true
    try {
      const response = await api.get('/discussions', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          sort: sortBy.value,
          search: searchText.value || undefined
        }
      })
      
      discussions.value = response.data.discussions
      pagination.total = response.data.pagination.total
      
      // 检查获取的数据中是否包含author_id
      console.log('获取的讨论列表:', discussions.value.map(d => ({
        id: d.id,
        title: d.title,
        author_id: d.author_id
      })))
      
      // 如果发现没有author_id的讨论，且用户已登录，可临时为当前会话创建的讨论补充作者ID
      if (userStore.state.isLoggedIn && userStore.state.userId) {
        const recentDiscussions = discussions.value.filter(d => !d.author_id && d.author_name === userStore.state.username)
        if (recentDiscussions.length > 0) {
          recentDiscussions.forEach(d => {
            d.author_id = userStore.state.userId
          })
          console.log('已为', recentDiscussions.length, '个讨论补充作者ID')
        }
      }
      
      // 获取每个讨论的点赞状态
      await Promise.all(discussions.value.map(async (discussion) => {
        try {
          const likeStatusResponse = await api.get(`/discussions/${discussion.id}/like`)
          discussion.liked = likeStatusResponse.data.isLiked
          discussion.like_count = likeStatusResponse.data.likesCount
        } catch (error) {
          console.error(`获取讨论${discussion.id}的点赞状态失败`, error)
        }
      }))
    } catch (error) {
      message.error('获取讨论列表失败')
      // 如果 API 不可用，使用模拟数据
      discussions.value = [
        {
          id: 1,
          title: '分享一道有趣的算法题解题思路',
          content: '最近做到一道非常有意思的算法题，涉及到动态规划的思想...',
          author_name: '张三',
          author_avatar: '',
          tag: '题解',
          created_at: '2024-03-15 14:30',
          comment_count: 5,
          like_count: 15,
          liked: false
        }
      ]
    } finally {
      loading.value = false
    }
  }
  
  // 搜索处理
  const onSearch = (value: string) => {
    searchText.value = value
    pagination.current = 1
    fetchDiscussions()
  }
  
  // 排序方式改变
  watch(sortBy, () => {
    pagination.current = 1
    fetchDiscussions()
  })
  
  // 显示发帖弹窗
  const showPostModal = () => {
    postModalVisible.value = true
  }
  
  // 发帖提交
  const handlePostSubmit = async () => {
    if (!postForm.value.title || !postForm.value.tag || !postForm.value.content) {
      message.error('请填写完整信息')
      return
    }
  
    // 确保用户已登录
    if (!userStore.state.isLoggedIn) {
      message.error('请先登录后再发布')
      return
    }
  
    postLoading.value = true
    try {
      const response = await api.post('/discussions', {
        title: postForm.value.title,
        tag: postForm.value.tag,
        content: postForm.value.content
      })
      
      // 成功后添加到列表顶部，注意使用userStore中的id字段
      const newDiscussion = response.data.discussion
      discussions.value.unshift({
        ...newDiscussion,
        author_id: userStore.state.id, // 使用userStore中的id字段
        author_name: userStore.state.username,
        author_avatar: userStore.state.avatar || '',
        comment_count: 0,
        like_count: 0
      })
      
      postModalVisible.value = false
      message.success('发布成功')
      
      // 清空表单
      postForm.value = { title: '', tag: '', content: '' }
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || '发布失败')
      } else {
        message.error('发布失败，请稍后重试')
      }
    } finally {
      postLoading.value = false
    }
  }
  
  // 点赞处理
  const handleLike = async (item: any) => {
    try {
      let response
      if (item.liked) {
        // 取消点赞
        response = await api.delete(`/discussions/${item.id}/like`)
        message.success('取消点赞成功')
      } else {
        // 添加点赞
        response = await api.post(`/discussions/${item.id}/like`)
        message.success('点赞成功')
      }
      
      // 使用API返回的实际点赞数更新UI
      if (response.data && response.data.likesCount !== undefined) {
        item.like_count = response.data.likesCount
      }
      
      // 更新点赞状态
      item.liked = !item.liked
      
      // 触发通知状态更新
      window.dispatchEvent(new CustomEvent('notifications-updated'))
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message)
      } else {
        message.error('操作失败，请稍后重试')
      }
    }
  }
  
  // 显示评论
  const showComments = async (item: any) => {
    currentDiscussion.value = item
    commentDrawerVisible.value = true
    comments.value = []
    commentsLoading.value = true
    
    // 获取完整讨论详情和评论
    try {
      const [discussionResponse, likeStatusResponse] = await Promise.all([
        api.get(`/discussions/${item.id}`),
        api.get(`/discussions/${item.id}/like`)
      ])
      
      if (discussionResponse.data && discussionResponse.data.discussion) {
        // 更新当前讨论的详细信息
        currentDiscussion.value = discussionResponse.data.discussion
        
        // 设置评论列表
        comments.value = discussionResponse.data.comments || []
      } else {
        // 如果讨论详情API没有返回评论，单独获取评论
        try {
          const commentsResponse = await api.get(`/discussions/${item.id}/comments`)
          if (commentsResponse.data && commentsResponse.data.comments) {
            comments.value = commentsResponse.data.comments
          }
        } catch (commentsError) {
          console.error('获取评论失败', commentsError)
        }
      }
      
      // 更新点赞状态
      if (likeStatusResponse.data) {
        currentDiscussion.value.liked = likeStatusResponse.data.isLiked
        currentDiscussion.value.like_count = likeStatusResponse.data.likesCount
        
        // 同时更新列表中的数据
        const discussionInList = discussions.value.find(d => d.id === item.id)
        if (discussionInList) {
          discussionInList.liked = likeStatusResponse.data.isLiked
          discussionInList.like_count = likeStatusResponse.data.likesCount
        }
      }
      
      // 确保评论作者ID正确设置
      if (comments.value && comments.value.length) {
        console.log('评论数据:', comments.value.map(c => ({
          id: c.id,
          content: c.content.substring(0, 20) + '...',
          author_id: c.author_id
        })))
      }
    } catch (error) {
      console.error('获取讨论详情失败', error)
      message.error('获取讨论详情失败')
    } finally {
      commentsLoading.value = false
    }
  }
  
  // 提交评论
  const handleCommentSubmit = async () => {
    if (!newComment.value.trim()) {
      message.error('请输入评论内容')
      return
    }
    
    if (!currentDiscussion.value) {
      message.error('讨论不存在')
      return
    }
    
    try {
      const response = await api.post(`/discussions/${currentDiscussion.value.id}/comments`, {
        content: newComment.value
      })
      
      // 添加新评论到列表
      comments.value.push(response.data.comment)
      
      // 更新当前讨论的评论计数
      if (currentDiscussion.value) {
        currentDiscussion.value.comment_count = (currentDiscussion.value.comment_count || 0) + 1
      }
      
      // 同时更新列表中的数据
      const discussionInList = discussions.value.find(d => d.id === currentDiscussion.value.id)
      if (discussionInList) {
        discussionInList.comment_count = (discussionInList.comment_count || 0) + 1
      }
      
      // 触发通知状态更新
      window.dispatchEvent(new CustomEvent('notifications-updated'))
      
      newComment.value = ''
      message.success('评论成功')
    } catch (error) {
      message.error('评论失败，请稍后重试')
    }
  }
  
  // 检查当前用户是否是作者
  const isCurrentUser = (authorId) => {
    // 如果未登录，直接返回false
    if (!userStore.state.isLoggedIn) return false;
    
    // 注意：userStore使用的是id字段而不是userId
    if (authorId && userStore.state.id) {
      // 转换为字符串比较，避免类型不匹配问题
      return String(authorId) === String(userStore.state.id);
    }
    
    // 如果作者ID不存在但讨论可能是当前用户创建的
    // 可以通过作者名进行二次判断
    const item = arguments[1]; // 获取第二个参数
    if (item && item.author_name && userStore.state.username) {
      return item.author_name === userStore.state.username;
    }
    
    return false;
  }

  // 添加一个调试函数，用于输出权限状态
  const logAuthStatus = (item) => {
    console.log('权限状态检查:', {
      authorId: item.author_id,
      userId: userStore.state.id,
      authorName: item.author_name,
      userName: userStore.state.username,
      isLoggedIn: userStore.state.isLoggedIn,
      isAuthor: isCurrentUser(item.author_id, item)
    });
  }

  // 删除讨论
  const handleDeleteDiscussion = (item) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个讨论吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await api.delete(`/discussions/${item.id}`)
          // 从列表中移除该讨论
          discussions.value = discussions.value.filter(d => d.id !== item.id)
          message.success('删除成功')
          
          // 如果当前打开的是这个讨论，关闭抽屉
          if (currentDiscussion.value && currentDiscussion.value.id === item.id) {
            commentDrawerVisible.value = false
          }
        } catch (error) {
          console.error('删除讨论失败:', error)
          
          // 显示更详细的错误信息
          if (error.response && error.response.data && error.response.data.message) {
            message.error(error.response.data.message)
          } else {
            message.error('删除失败，请重试')
          }
        }
      }
    })
  }

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    if (!currentDiscussion.value) return

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个评论吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          // 修正删除评论的API路径
          await api.delete(`/discussions/comments/${commentId}`)
          
          // 从评论列表中移除
          comments.value = comments.value.filter(c => c.id !== commentId)
          
          // 更新评论计数
          if (currentDiscussion.value) {
            currentDiscussion.value.comment_count = Math.max((currentDiscussion.value.comment_count || 1) - 1, 0)
          }
          
          // 同时更新列表中的数据
          const discussionInList = discussions.value.find(d => d.id === currentDiscussion.value.id)
          if (discussionInList) {
            discussionInList.comment_count = Math.max((discussionInList.comment_count || 1) - 1, 0)
          }
          
          message.success('评论已删除')
        } catch (error) {
          console.error('删除评论失败:', error)
          
          // 显示更详细的错误信息
          if (error.response && error.response.data && error.response.data.message) {
            message.error(error.response.data.message)
          } else {
            message.error('删除评论失败')
          }
        }
      }
    })
  }
  
  // 确保能获取到用户信息
  const ensureUserInfo = async () => {
    if (!userStore.state.userId && userStore.state.isLoggedIn) {
      try {
        await userStore.fetchUserInfo()
        
        // 更新调试信息
        currentUserInfo.value = {
          isLoggedIn: userStore.state.isLoggedIn,
          userId: userStore.state.userId,
          username: userStore.state.username
        }
        
        console.log('已刷新用户信息:', currentUserInfo.value)
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    }
  }
  
  // 组件挂载时获取数据
  onMounted(async () => {
    // 如果用户已登录但没有ID，尝试刷新用户信息
    if (userStore.state.isLoggedIn && !userStore.state.id) {
      await userStore.fetchUserInfo()
    }
    
    // 输出当前用户状态以便调试
    console.log('当前用户状态:', {
      isLoggedIn: userStore.state.isLoggedIn,
      id: userStore.state.id,
      username: userStore.state.username
    })
    
    fetchDiscussions()
    
    // 检查URL参数中是否有指定的讨论ID
    if (route.query.id) {
      const discussionId = parseInt(route.query.id as string)
      
      // 加载完讨论列表后，查找并打开指定的讨论
      if (!isNaN(discussionId)) {
        setTimeout(() => {
          const targetDiscussion = discussions.value.find(d => d.id === discussionId)
          if (targetDiscussion) {
            showComments(targetDiscussion)
          }
        }, 500) // 等待讨论列表加载完成
      }
    }
  })
  
  // 直接通过ID获取讨论详情
  const fetchDiscussionById = async (id) => {
    try {
      const response = await api.get(`/discussions/${id}`)
      // 如果成功获取到，则打开评论抽屉
      if (response.data && response.data.discussion) {
        const discussion = response.data.discussion
        // 获取点赞状态
        try {
          const likeStatusResponse = await api.get(`/discussions/${id}/like`)
          discussion.liked = likeStatusResponse.data.isLiked
          discussion.like_count = likeStatusResponse.data.likesCount
        } catch (error) {
          console.error('获取点赞状态失败', error)
          discussion.liked = false
          discussion.like_count = 0
        }
        
        // 添加到讨论列表中（如果不存在）
        if (!discussions.value.find(d => d.id === discussion.id)) {
          discussions.value.unshift(discussion)
        }
        
        // 打开评论抽屉
        showComments(discussion)
      }
    } catch (error) {
      console.error('获取讨论详情失败', error)
      message.error('找不到该讨论')
    }
  }

  // 添加举报讨论的方法
  const handleReportDiscussion = (item) => {
    Modal.confirm({
      title: '举报讨论',
      content: '确定要举报这个讨论吗？',
      okText: '举报',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await api.post(`/discussions/${item.id}/report`, {
            reason: '垃圾广告'
          })
          message.success('举报成功，我们会尽快处理')
        } catch (error) {
          message.error('举报失败，请稍后重试')
        }
      }
    })
  }

  // 添加举报评论的方法
  const handleReportComment = (commentId) => {
    Modal.confirm({
      title: '举报评论',
      content: '确定要举报这个评论吗？',
      okText: '举报',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await api.post(`/discussions/comments/${commentId}/report`, {
            reason: '包含不当内容'
          })
          message.success('举报成功，我们会尽快处理')
        } catch (error) {
          message.error('举报失败，请稍后重试')
        }
      }
    })
  }
</script>

<style scoped lang="less">
  .content {
    padding: 24px;
    background: #f0f2f5;
  
    .action-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .discussion-list {
      background: #fff;
      padding: 24px;
      border-radius: 2px;
  
      .content-preview {
        color: #666;
        margin-top: 8px;
      }
    }
  
    .post-content {
      margin-bottom: 24px;
    }
  
    .comment-form {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px;
      background: #fff;
      border-top: 1px solid #f0f0f0;
    }
  
    :deep(.ant-list-item-meta-title) {
      margin-bottom: 4px;
    }
  
    :deep(.ant-list-item-action) {
      margin-top: 8px;
    }
  }
  
  // 移动端适配
  @media screen and (max-width: 768px) {
    .content {
      padding: 12px;
  
      .action-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
  
        .ant-input-search {
          width: 100% !important;
        }
      }
  
      .discussion-list {
        padding: 12px;
      }
    }
  }
</style>