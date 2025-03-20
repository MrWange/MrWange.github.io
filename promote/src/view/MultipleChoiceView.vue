<template>
    <a-layout-content class="multiple-choice-container">
      <!-- 模式选择对话框 -->
      <a-modal
        v-model:visible="modeSelectVisible"
        title="选择刷题模式"
        :footer="null"
        :maskClosable="false"
        :closable="false"
        centered
      >
        <div class="mode-select">
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <a-card 
                hoverable 
                @click="selectMode('free')"
                :class="{ 'selected': selectedMode === 'free' }"
              >
                <template #cover>
                  <OrderedListOutlined class="mode-icon" />
                </template>
                <a-card-meta title="自由刷题">
                  <template #description>查看所有题目，自由选择练习</template>
                </a-card-meta>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card 
                hoverable 
                @click="selectMode('random')"
                :class="{ 'selected': selectedMode === 'random' }"
              >
                <template #cover>
                  <ThunderboltOutlined class="mode-icon" />
                </template>
                <a-card-meta title="随机刷题">
                  <template #description>随机抽题练习，提升应变能力</template>
                </a-card-meta>
              </a-card>
            </a-col>
          </a-row>

          <!-- 随机模式题目数量选择 -->
          <div v-if="selectedMode === 'random'" class="random-settings">
            <a-form layout="vertical">
              <a-form-item label="练习题目数量">
                <a-input-number
                  v-model:value="randomQuestionCount"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-item>
            </a-form>
          </div>

          <div class="mode-actions">
            <a-button type="primary" @click="startPractice" :disabled="!selectedMode">
              开始刷题
            </a-button>
          </div>
        </div>
      </a-modal>
  
      <!-- 自由模式题目列表 -->
      <div v-if="practiceMode === 'free' && !showQuestionMode" class="free-mode">
        <div class="filter-bar">
          <a-radio-group v-model:value="filterType" button-style="solid">
            <a-radio-button value="all">全部题目</a-radio-button>
            <a-radio-button value="favorite">我的收藏</a-radio-button>
          </a-radio-group>
        </div>
        
        <a-list
          class="question-list"
          :data-source="filteredQuestions"
          :pagination="{ pageSize: 10 }"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <div class="question-list-title">
                    <span>{{ item.title }}</span>
                    <a-space>
                      <a-button 
                        type="text" 
                        @click.stop="toggleFavorite(item)"
                      >
                        <template #icon>
                          <StarOutlined :style="{ color: item.isFavorite ? '#faad14' : '' }" />
                        </template>
                      </a-button>
                      <a-tag v-if="item.attemptCount" color="success">
                        已做 {{ item.attemptCount }} 次
                      </a-tag>
                      <a-button type="primary" size="small" @click="startQuestion(item)">
                        开始答题
                      </a-button>
                    </a-space>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
  
      <!-- 答题界面 -->
      <div v-if="showQuestionMode" class="question-mode">
        <!-- 顶部信息栏 -->
        <a-row class="info-bar" justify="space-between" align="middle">
          <a-col>
            <a-space>
              <a-tag color="blue">第 {{ currentQuestionIndex + 1 }}/{{ totalQuestions }} 题</a-tag>
              <a-tag color="orange">
                <ClockCircleOutlined /> {{ formatTime(timer) }}
              </a-tag>
              <a-tag color="purple">{{ practiceMode === 'free' ? '自由模式' : '随机模式' }}</a-tag>
            </a-space>
          </a-col>
          <a-col>
            <a-space>
              <a-tag color="green">得分：{{ score }}</a-tag>
              <a-button type="primary" danger @click="handleExit">
                退出练习
              </a-button>
            </a-space>
          </a-col>
        </a-row>
  
        <!-- 题目内容 -->
        <a-card class="question-card">
          <template #title>
            <div class="question-title">
              <span class="question-type">
                【{{ currentQuestion?.type === '多选' ? '多选题' : '单选题' }}】
              </span>
              {{ currentQuestion?.title }}
              <a-button 
                type="text" 
                class="favorite-btn"
                @click="toggleFavorite(currentQuestion)"
              >
                <template #icon>
                  <StarOutlined :style="{ color: currentQuestion?.isFavorite ? '#faad14' : '' }" />
                </template>
              </a-button>
            </div>
          </template>
          
          <!-- 选项列表 -->
          <template v-if="currentQuestion?.type === '多选'">
            <a-checkbox-group
              v-model:value="selectedAnswers"
              class="options-list"
              :disabled="isAnswered"
            >
              <a-space direction="vertical" style="width: 100%">
                <a-checkbox
                  v-for="option in currentQuestion?.options"
                  :key="option?.key"
                  :value="option?.key"
                  :class="getOptionClass(option?.key)"
                >
                  {{ option.key }}. {{ option.content }}
                </a-checkbox>
              </a-space>
            </a-checkbox-group>
          </template>
          <template v-else>
            <a-radio-group 
              v-model:value="selectedAnswer"
              class="options-list"
              :disabled="isAnswered"
            >
              <a-space direction="vertical" style="width: 100%">
                <a-radio
                  v-for="option in currentQuestion?.options"
                  :key="option?.key"
                  :value="option?.key"
                  :class="getOptionClass(option?.key)"
                >
                  {{ option.key }}. {{ option.content }}
                </a-radio>
              </a-space>
            </a-radio-group>
          </template>
  
          <!-- 答案解析 -->
          <div v-if="isAnswered" class="explanation">
            <a-divider>答案解析</a-divider>
            <p><strong>正确答案：</strong>{{ currentQuestion?.correctAnswer }}</p>
            <p>{{ currentQuestion?.explanation }}</p>
          </div>
        </a-card>
  
        <!-- 底部操作栏 -->
        <div class="action-bar">
          <a-space>
            <a-button 
              type="primary" 
              @click="handleSubmit" 
              :disabled="(currentQuestion?.type === '多选' ? selectedAnswers.length === 0 : !selectedAnswer) || isAnswered"
            >
              提交答案
            </a-button>
            <a-button 
              type="primary" 
              @click="handleNext" 
              :disabled="!isAnswered"
            >
              下一题
            </a-button>
            <!-- 添加返回列表按钮（仅在自由模式下显示） -->
            <a-button 
              v-if="practiceMode === 'free'"
              @click="backToList"
            >
              返回列表
            </a-button>
          </a-space>
        </div>
      </div>
    </a-layout-content>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
  import { 
    ClockCircleOutlined,
    OrderedListOutlined,
    ThunderboltOutlined,
    StarOutlined
  } from '@ant-design/icons-vue'
  import { message } from 'ant-design-vue'
  import { useRouter } from 'vue-router'
  import api from '../services/api'
  
  const router = useRouter()
  
  // 扩展题目接口
  interface Question {
    id: number
    title: string
    options: Array<{ key: string; content: string }>
    correctAnswer?: string
    explanation?: string
    attemptCount?: number 
    isFavorite?: boolean
    difficulty: string
    type: string
  }
  
  const questions = ref<Question[]>([])
  const loading = ref(true)
  const currentQuestionIndex = ref(0)
  const totalQuestions = computed(() => questions.value.length)
  const currentQuestion = ref<Question | null>(null)
  const selectedAnswer = ref('')
  const selectedAnswers = ref<string[]>([])
  const isAnswered = ref(false)
  const score = ref(0)
  const timer = ref(0)
  let timerInterval: number | null = null
  
  // 模式选择相关
  const modeSelectVisible = ref(true)
  const selectedMode = ref('')
  const practiceMode = ref('')
  
  // 随机模式题目数量
  const randomQuestionCount = ref(50)
  
  // 筛选类型
  const filterType = ref('all')
  
  // 筛选后的题目列表
  const filteredQuestions = computed(() => {
    if (filterType.value === 'favorite') {
      return questions.value.filter(q => q.isFavorite)
    }
    return questions.value
  })
  
  // 记录上次保存时间
  const lastSaveTime = ref(Date.now())
  
  // 保存学习时长
  const saveStudyTime = async () => {
    try {
      const currentTime = Date.now()
      const elapsedSeconds = Math.floor((currentTime - lastSaveTime.value) / 1000)
      
      // 只有当累计时间超过5秒时才记录
      if (elapsedSeconds > 5) {
        await api.post('/study/record', {
          minutes: Math.ceil(elapsedSeconds / 60) // API要求使用分钟作为单位
        })
        
        console.log(`已记录 ${Math.ceil(elapsedSeconds / 60)} 分钟的学习时长`)
        
        // 重置上次保存时间
        lastSaveTime.value = currentTime
        
        // 触发自定义事件，通知其他组件用户学习时长已更新
        window.dispatchEvent(new CustomEvent('study-time-updated'))
      }
    } catch (error) {
      console.error('保存学习时长失败', error)
    }
  }
  
  // 获取所有题目
  const fetchQuestions = async () => {
    loading.value = true
    try {
      const response = await api.get('/questions', {
        params: {
          limit: 100  // 获取更多题目，实际应用中应该分页
        }
      })
      
      // 获取用户收藏的题目列表，用于标记哪些题目已被收藏
      let favoriteIds = new Set()
      try {
        const favResponse = await api.get('/questions/user/favorites', { params: { limit: 999 } })
        favoriteIds = new Set(favResponse.data.questions.map((q: any) => q.id))
      } catch (error) {
        console.error('获取收藏列表失败', error)
      }
      
      // 获取用户答题历史，用于统计每道题目的尝试次数
      let questionAttempts = {}
      try {
        const historyResponse = await api.get('/questions/attempt/history', { params: { limit: 999 } })
        // 检查数据是否存在
        if (historyResponse.data && historyResponse.data.data && historyResponse.data.data.attempts) {
          // 统计每道题目的答题次数
          historyResponse.data.data.attempts.forEach((attempt: any) => {
            const qId = attempt.question_id
            questionAttempts[qId] = (questionAttempts[qId] || 0) + 1
          })
        }
      } catch (error) {
        console.error('获取答题历史失败', error)
      }
      
      // 格式化题目数据，添加收藏状态和答题次数
      questions.value = response.data.questions.map(q => ({
        id: q.id,
        title: q.title,
        options: Array.isArray(q.options) 
          ? q.options.map((opt: any, idx: number) => ({ 
              key: String.fromCharCode(65 + idx), // 转为 A, B, C, D...
              content: opt 
            }))
          : [],
        difficulty: q.difficulty,
        type: q.type,
        isFavorite: favoriteIds.has(q.id), // 使用收藏列表标记
        attemptCount: questionAttempts[q.id] || 0 // 使用答题历史标记
      }))
    } catch (error) {
      message.error('获取题目失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户收藏的题目
  const fetchFavorites = async () => {
    if (filterType.value !== 'favorite') return
    
    loading.value = true
    try {
      const response = await api.get('/questions/user/favorites')
      
      // 获取用户答题历史，用于统计每道题目的尝试次数
      let questionAttempts = {}
      try {
        const historyResponse = await api.get('/questions/attempt/history', { params: { limit: 999 } })
        // 统计每道题目的答题次数
        historyResponse.data.data.attempts.forEach((attempt: any) => {
          const qId = attempt.question_id
          questionAttempts[qId] = (questionAttempts[qId] || 0) + 1
        })
      } catch (error) {
        console.error('获取答题历史失败', error)
      }
      
      // 格式化收藏题目数据
      questions.value = response.data.questions.map(q => ({
        id: q.id,
        title: q.title,
        options: Array.isArray(q.options) 
          ? q.options.map((opt: any, idx: number) => ({ 
              key: String.fromCharCode(65 + idx),
              content: opt 
            }))
          : [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        type: q.type,
        isFavorite: true, // 收藏列表中的题目肯定是已收藏的
        attemptCount: questionAttempts[q.id] || 0 // 使用答题历史标记
      }))
    } catch (error) {
      message.error('获取收藏失败')
    } finally {
      loading.value = false
    }
  }
  
  // 监听筛选类型变化
  watch(filterType, () => {
    if (filterType.value === 'favorite') {
      fetchFavorites()
    } else {
      fetchQuestions()
    }
  })
  
  // 选择模式
  const selectMode = (mode: 'free' | 'random') => {
    selectedMode.value = mode
  }
  
  // 开始练习
  const startPractice = () => {
    practiceMode.value = selectedMode.value
    modeSelectVisible.value = false
    
    if (selectedMode.value === 'random') {
      // 随机抽取指定数量的题目
      const shuffledQuestions = [...questions.value]
      for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]]
      }
      const selectedQuestions = shuffledQuestions.slice(0, Math.min(randomQuestionCount.value, shuffledQuestions.length))
      questions.value = selectedQuestions
      
      if (selectedQuestions.length > 0) {
        currentQuestion.value = selectedQuestions[0]
        currentQuestionIndex.value = 0
      }
    } else {
      // 自由模式下不立即显示题目
      currentQuestion.value = null
    }
    
    startTimer()
    startAutoSave() // 启动自动保存
  }
  
  // 获取题目详情
  const fetchQuestionDetails = async (questionId: number) => {
    try {
      const response = await api.get(`/questions/${questionId}`)
      const questionData = response.data.question
      
      // 更新当前题目数据
      if (currentQuestion.value && currentQuestion.value.id === questionId) {
        currentQuestion.value.correctAnswer = questionData.correct_answer
        currentQuestion.value.explanation = questionData.explanation
      }
      
      return {
        correctAnswer: questionData.correct_answer,
        explanation: questionData.explanation
      }
    } catch (error) {
      message.error('获取题目详情失败')
      return null
    }
  }
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // 获取选项样式
  const getOptionClass = (optionKey: string) => {
    if (!isAnswered.value) return ''
    
    if (currentQuestion.value?.type === '多选') {
      // 多选题的样式判断 - 直接使用字符串包含判断
      if (currentQuestion.value?.correctAnswer?.includes(optionKey)) {
        return 'correct-option'
      }
      if (selectedAnswers.value.includes(optionKey) && !currentQuestion.value?.correctAnswer?.includes(optionKey)) {
        return 'wrong-option'
      }
    } else {
      // 单选题的样式判断保持不变
      if (optionKey === currentQuestion.value?.correctAnswer) {
        return 'correct-option'
      }
      if (optionKey === selectedAnswer.value && selectedAnswer.value !== currentQuestion.value?.correctAnswer) {
        return 'wrong-option'
      }
    }
    return ''
  }
  
  // 提交答案
  const handleSubmit = async () => {
    if (!currentQuestion.value) return
    
    // 检查是否已选择答案
    if (currentQuestion.value.type === '多选' && selectedAnswers.value.length === 0) {
      message.warning('请至少选择一个选项')
      return
    }
    if (currentQuestion.value.type !== '多选' && !selectedAnswer.value) {
      message.warning('请选择一个选项')
      return
    }
    
    // 先保存当前的学习时长
    await saveStudyTime()
    
    try {
      // 对多选题的答案进行排序并直接连接（不使用逗号）
      const submittedAnswer = currentQuestion.value.type === '多选' 
        ? selectedAnswers.value.sort().join('') 
        : selectedAnswer.value
        
      // 提交答案到服务器
      const response = await api.post(`/questions/${currentQuestion.value.id}/submit`, {
        selectedAnswer: submittedAnswer
      })
      
      const { isCorrect, correctAnswer, explanation } = response.data
      
      isAnswered.value = true
      
      // 更新题目信息
      if (currentQuestion.value) {
        currentQuestion.value.correctAnswer = correctAnswer
        currentQuestion.value.explanation = explanation
      }
      
      // 更新分数
      if (isCorrect) {
        score.value += 10
        message.success('回答正确！')
      } else {
        message.error('回答错误！')
      }
      
      // 更新做题次数
      const question = questions.value.find(q => q.id === currentQuestion.value?.id)
      if (question) {
        question.attemptCount = (question.attemptCount || 0) + 1
      }
      
      // 获取最新的打卡信息，检查是否是今日首次做题
      checkStreakStatus()
      
      // 触发自定义事件，通知其他组件用户已完成答题
      window.dispatchEvent(new CustomEvent('question-answered'))
    } catch (error) {
      message.error('提交答案失败')
    }
  }
  
  // 检查打卡状态
  const checkStreakStatus = async () => {
    try {
      const response = await api.get('/questions/streak-info')
      const streakInfo = response.data.data
      
      // 如果今天刚刚打卡成功（首次答题）
      if (streakInfo.checkedToday && streakInfo.currentStreak > 0) {
        // 只在首次打卡时显示通知
        const localStorageKey = `lastCheckin_${new Date().toISOString().split('T')[0]}`
        if (!localStorage.getItem(localStorageKey)) {
          message.success(`成功打卡！当前已连续打卡 ${streakInfo.currentStreak} 天`)
          localStorage.setItem(localStorageKey, 'true')
        }
      }
    } catch (error) {
      console.error('获取打卡信息失败', error)
    }
  }
  
  // 下一题
  const handleNext = async () => {
    await saveStudyTime()
    
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
      currentQuestion.value = questions.value[currentQuestionIndex.value]
      selectedAnswer.value = ''
      selectedAnswers.value = []
      isAnswered.value = false
      
      lastSaveTime.value = Date.now()
    } else {
      message.success('已完成所有题目！')
    }
  }
  
  // 退出练习
  const handleExit = async () => {
    // 保存学习时长
    await saveStudyTime()
    router.push('/')
  }
  
  // 修改计时器启动逻辑
  const startTimer = () => {
    // 记录开始时间
    lastSaveTime.value = Date.now()
    
    timerInterval = setInterval(() => {
      timer.value++
    }, 1000)
  }
  
  // 自动定时保存学习时间（每5分钟保存一次）
  let autoSaveInterval: number | null = null

  // 启动定时保存
  const startAutoSave = () => {
    autoSaveInterval = setInterval(() => {
      saveStudyTime()
      // 重置上次保存时间，但不重新启动计时器
      lastSaveTime.value = Date.now()
    }, 5 * 60 * 1000) // 5分钟
  }
  
  // 修改页面可见性变化处理函数
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // 当用户切换离开页面时，保存学习时长
      saveStudyTime()
      
      // 暂停计时器
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      
      // 也暂停自动保存计时器
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
        autoSaveInterval = null
      }
    } else if (document.visibilityState === 'visible') {
      // 当用户返回页面时，重新开始计时
      if (!timerInterval) {
        lastSaveTime.value = Date.now() // 重置开始时间
        startTimer()
      }
      
      // 重新启动自动保存
      if (!autoSaveInterval) {
        startAutoSave()
      }
    }
  }
  
  // 确保组件卸载时清理所有计时器并保存学习时长
  onUnmounted(async () => {
    // 保存当前学习时长
    await saveStudyTime()
    
    // 清理定时器
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
    
    // 移除事件监听器
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  // 开始特定题目
  const startQuestion = async (question: Question) => {
    if (currentQuestion.value) {
      await saveStudyTime()
    }
    
    if (!question.correctAnswer) {
      const details = await fetchQuestionDetails(question.id)
      if (details) {
        question.correctAnswer = details.correctAnswer
        question.explanation = details.explanation
      }
    }
    
    currentQuestion.value = question
    currentQuestionIndex.value = questions.value.findIndex(q => q.id === question.id)
    selectedAnswer.value = ''
    selectedAnswers.value = []
    isAnswered.value = false
    
    lastSaveTime.value = Date.now()
  }

  // 返回列表
  const backToList = async () => {
    // 保存学习时长
    await saveStudyTime()
    
    currentQuestion.value = null
    selectedAnswer.value = ''
    selectedAnswers.value = []
    isAnswered.value = false
  }

  // 添加显示答题模式的计算属性
  const showQuestionMode = computed(() => {
    return currentQuestion.value !== null && !modeSelectVisible.value
  })

  // 切换收藏状态
  const toggleFavorite = async (question: Question | null) => {
    if (!question) return
    
    try {
      if (question.isFavorite) {
        // 取消收藏
        await api.delete(`/questions/${question.id}/favorite`)
        question.isFavorite = false
        message.success('已取消收藏')
        
        // 如果当前是在收藏列表中，需要从列表中移除这道题
        if (filterType.value === 'favorite') {
          questions.value = questions.value.filter(q => q.id !== question.id)
        }
      } else {
        // 添加收藏
        await api.post(`/questions/${question.id}/favorite`)
        question.isFavorite = true
        message.success('已添加到收藏')
      }
    } catch (error) {
      message.error('操作失败，请重试')
    }
  }
  
  // 组件挂载时获取数据
  onMounted(() => {
    fetchQuestions()
    checkStreakStatus() // 页面加载时先检查一次打卡状态
    
    // 添加页面可见性变化监听
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  const reportComment = async (comment) => {
    try {
      await api.post(`/reports/comments/${comment.id}`, {
        reason: '包含不当内容' // 这里可以根据需要提供举报原因
      });
      message.success('评论已举报');
    } catch (error) {
      console.error('举报评论失败', error);
      message.error('举报评论失败');
    }
  };
</script>

  <style scoped lang="less">
  .multiple-choice-container {
    padding: 16px;
    box-sizing: border-box;
    .info-bar {
      margin-bottom: 20px;
    }
  
    .question-card {
      margin-bottom: 20px;
  
      .question-title {
        font-size: 16px;
        line-height: 1.6;
        display: flex;
        justify-content: space-between;
        align-items: center;
  
        .question-type {
          color: #1890ff;
          margin-right: 8px;
          font-weight: bold;
          background: #e6f7ff;
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .favorite-btn {
          margin-left: auto;
        }
      }
  
      .options-list {
        margin-top: 24px;
        
        // 统一单选和多选的样式
        :deep(.ant-radio-wrapper),
        :deep(.ant-checkbox-wrapper) {
          width: 100%;
          margin: 12px 0;
          padding: 12px 16px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          transition: all 0.3s;
          
          // 选项内容样式
          span:last-child {
            flex: 1;
            margin-left: 8px;
            color: #333;
          }

          &:hover {
            background-color: #fafafa;
            border-color: #40a9ff;
          }

          &.correct-option {
            background-color: #f6ffed;
            border-color: #b7eb8f;
            
            &::after {
              content: '✓';
              color: #52c41a;
              font-weight: bold;
              margin-left: 8px;
            }
          }

          &.wrong-option {
            background-color: #fff1f0;
            border-color: #ffa39e;
            
            &::after {
              content: '✕';
              color: #f5222d;
              font-weight: bold;
              margin-left: 8px;
            }
          }
        }

        // 选中状态样式
        :deep(.ant-radio-checked),
        :deep(.ant-checkbox-checked) {
          .ant-radio-inner,
          .ant-checkbox-inner {
            background-color: #1890ff;
            border-color: #1890ff;
          }
        }
      }
  
      .explanation {
        margin-top: 24px;
        padding: 16px;
        background-color: #fafafa;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
  
        .ant-divider {
          color: #1890ff;
          font-weight: bold;
        }
  
        p {
          margin: 12px 0;
          line-height: 1.6;
          
          strong {
            color: #1890ff;
          }
        }
      }
    }
  
    .action-bar {
      text-align: center;
      margin-top: 24px;
      
      .ant-btn {
        min-width: 100px;
        margin: 0 8px;
        
        &[disabled] {
          opacity: 0.6;
        }
      }
    }
  }
  
  .mode-select {
    .mode-icon {
      font-size: 48px;
      padding: 24px 0;
      text-align: center;
      width: 100%;
      background: #fafafa;
    }
  
    .ant-card {
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
  
      &:hover {
        transform: translateY(-4px);
      }
  
      &.selected {
        border-color: #1890ff;
      }
    }
  
    .mode-actions {
      margin-top: 24px;
      text-align: center;
    }
  }
  
  .free-mode {
    .question-list {
      background: white;
      padding: 24px;
      border-radius: 4px;

      .question-list-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
    }
  }

  .random-settings {
    margin-top: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
  }
</style>