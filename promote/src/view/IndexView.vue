<template>
  <!-- 内容区域 -->
  <a-layout-content class="content">
    <!-- 统计卡片区域 -->
    <a-row :gutter="16" class="statistics">
        <a-col :span="6">
        <a-card :loading="statsLoading">
            <template #title>
            <FileTextOutlined /> 题目总数
            </template>
            <h2>{{ stats.totalQuestions }}+</h2>
        </a-card>
        </a-col>
        <a-col :span="6">
        <a-card :loading="statsLoading">
            <template #title>
            <CheckCircleOutlined /> 已完成
            </template>
            <h2>{{ stats.totalAttempts }}</h2>
        </a-card>
        </a-col>
        <a-col :span="6">
        <a-card :loading="statsLoading">
            <template #title>
            <TrophyOutlined /> 连续打卡
            </template>
            <h2>{{ stats.currentStreak || 0 }}天</h2>
        </a-card>
        </a-col>
        <a-col :span="6">
        <a-card :loading="statsLoading">
            <template #title>
            <StarOutlined /> 收藏题目
            </template>
            <h2>{{ stats.totalFavorites }}</h2>
        </a-card>
        </a-col>
    </a-row>

    <!-- 题目列表 -->
    <a-card title="热门题目" class="problem-list">
        <a-list 
            :data-source="problemList" 
            :pagination="pagination"
            :loading="questionsLoading"
        >
        <template #renderItem="{ item }">
            <a-list-item>
            <a-list-item-meta>
                <template #title>
                <a @click="startQuestion(item.id)">{{ item.title }}</a>
                </template>
                <template #description>
                <a-tag v-for="tag in getTagsFromType(item.type)" :key="tag" :color="getTagColor(tag)">
                    {{ tag }}
                </a-tag>
                </template>
            </a-list-item-meta>
            <template #extra>
                <a-space>
                <a-tag :color="getDifficultyColor(item.difficulty)">
                    {{ item.difficulty }}
                </a-tag>
                <a-button type="primary" @click="startQuestion(item.id)">开始做题</a-button>
                </a-space>
            </template>
            </a-list-item>
        </template>
        </a-list>
    </a-card>

    <!-- 答题弹窗 -->
    <a-modal
      v-model:visible="questionModalVisible"
      :title="currentQuestion?.title || '题目'"
      :footer="null"
      :maskClosable="false"
      width="800px"
      class="question-modal"
    >
      <template v-if="currentQuestion">
        <!-- 题目内容 -->
        <div class="question-card">
          <!-- 选项列表 -->
          <a-radio-group 
            v-model:value="selectedAnswer"
            class="options-list"
            :disabled="isAnswered"
          >
            <a-space direction="vertical" style="width: 100%">
              <a-radio
                v-for="option in currentQuestion.options"
                :key="option?.key"
                :value="option?.key"
                :class="getOptionClass(option?.key)"
              >
                {{ option.key }}. {{ option.content }}
              </a-radio>
            </a-space>
          </a-radio-group>
  
          <!-- 答案解析 -->
          <div v-if="isAnswered" class="explanation">
            <a-divider>答案解析</a-divider>
            <p><strong>正确答案：</strong>{{ currentQuestion.correctAnswer }}</p>
            <p>{{ currentQuestion.explanation }}</p>
          </div>
        </div>
  
        <!-- 底部操作栏 -->
        <div class="action-bar">
          <a-space>
            <a-button 
              type="primary" 
              @click="handleSubmit" 
              :disabled="!selectedAnswer || isAnswered"
            >
              提交答案
            </a-button>
            <a-button 
              v-if="isAnswered"
              type="primary" 
              @click="closeQuestionModal"
            >
              关闭
            </a-button>
            <a-button 
              v-if="isAnswered"
              @click="goToMoreQuestions"
            >
              继续做题
            </a-button>
          </a-space>
        </div>
      </template>
      <a-spin v-else size="large" tip="加载题目中..." />
    </a-modal>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
    FileTextOutlined, 
    CheckCircleOutlined, 
    TrophyOutlined, 
    StarOutlined 
} from '@ant-design/icons-vue'
import api from '../services/api'
import { message, Modal } from 'ant-design-vue'

const router = useRouter()

// 加载状态
const statsLoading = ref(true)
const questionsLoading = ref(true)

// 统计数据 - 根据新API修改
const stats = reactive({
    totalQuestions: 0,  // 题目总数
    totalAttempts: 0,   // 已完成题目总数
    currentStreak: 0,   // 连续打卡天数
    totalFavorites: 0,  // 收藏题目数量
    accuracy: 0         // 正确率 (可选显示)
})

// 题目列表数据
const problemList = ref([])

// 分页配置
const pagination = reactive({
    pageSize: 10,
    total: 0,
    current: 1,
    onChange: (page: number) => {
        pagination.current = page
        fetchQuestions(page)
    }
})

// 答题相关状态
const questionModalVisible = ref(false)
const currentQuestion = ref(null)
const selectedAnswer = ref('')
const isAnswered = ref(false)

// 获取统计数据 - 根据新API更新
const fetchStats = async () => {
    statsLoading.value = true
    try {
        // 使用 /users/stats 获取统计信息
        const response = await api.get('/users/stats')
        const data = response.data.stats || {}
        
        // 映射API数据到统计卡片
        stats.totalAttempts = data.totalAttempts || 0
        stats.totalFavorites = data.totalFavorites || 0
        stats.accuracy = data.accuracy || 0
        
        // 尝试获取题目总数
        try {
            const questionsCountResponse = await api.get('/questions', {
                params: { 
                    limit: 1,  // 只需要获取总数，不需要实际数据
                    page: 1
                }
            })
            stats.totalQuestions = questionsCountResponse.data.pagination.total || 0
        } catch (err) {
            console.error('获取题目总数失败', err)
            stats.totalQuestions = 1000 // 默认值
        }
        
        // 尝试从答题历史获取统计数据（这是最准确的总答题数来源）
        try {
            const historyResponse = await api.get('/questions/attempt/stats')
            if (historyResponse.data && historyResponse.data.data) {
                const historyStats = historyResponse.data.data
                
                // 只有在原始数据为0时才使用历史数据的统计
                if (stats.totalAttempts === 0 || true) { // 强制使用这个数据源的总答题数
                    stats.totalAttempts = historyStats.totalAttempts || 0
                }
                
                if (stats.accuracy === 0) {
                    stats.accuracy = historyStats.accuracy || 0
                }
            }
        } catch (historyError) {
            console.error('获取答题历史统计失败', historyError)
            
            // 如果 /questions/attempt/stats 失败，尝试获取分页数据
            try {
                const attemptHistoryResponse = await api.get('/questions/attempt/history', { 
                    params: { limit: 1 } // 只需要分页信息
                })
                if (attemptHistoryResponse.data && 
                    attemptHistoryResponse.data.data && 
                    attemptHistoryResponse.data.data.pagination) {
                    stats.totalAttempts = attemptHistoryResponse.data.data.pagination.total || stats.totalAttempts
                }
            } catch (paginationError) {
                console.error('获取答题历史分页也失败', paginationError)
            }
        }
        
        // 如果还是没有总答题数，尝试从趋势数据中计算
        if (stats.totalAttempts === 0) {
            try {
                const trendResponse = await api.get('/users/trend', { params: { days: 30 } }) // 获取30天数据
                if (trendResponse.data && trendResponse.data.data) {
                    // 如果有summary总结数据，直接使用
                    if (trendResponse.data.data.summary) {
                        const summary = trendResponse.data.data.summary
                        stats.totalAttempts = summary.totalAttempts || 0
                    } 
                    // 如果没有summary，则自己计算趋势数据的总和
                    else if (trendResponse.data.data.trendData && trendResponse.data.data.trendData.length > 0) {
                        const trendData = trendResponse.data.data.trendData
                        stats.totalAttempts = trendData.reduce((sum, day) => sum + (day.attemptCount || 0), 0)
                    }
                }
            } catch (trendError) {
                console.error('获取趋势数据失败', trendError)
            }
        }
        
        // 尝试获取连续打卡信息
        try {
            const streakResponse = await api.get('/questions/streak-info')
            if (streakResponse.data && streakResponse.data.data) {
                stats.currentStreak = streakResponse.data.data.currentStreak || 0
            }
        } catch (err) {
            console.error('获取打卡信息失败', err) 
            
            // 如果获取打卡信息失败，尝试从趋势数据获取
            try {
                const trendResponse = await api.get('/users/trend')
                if (trendResponse.data.data && trendResponse.data.data.summary) {
                    stats.currentStreak = trendResponse.data.data.summary.currentStreak || 0
                }
            } catch (trendErr) {
                console.error('获取趋势数据失败', trendErr)
                stats.currentStreak = 0 // 默认值
            }
        }
    } catch (error) {
        console.error('获取统计数据失败', error)
        // 如果 API 不可用，使用模拟数据
        stats.totalQuestions = 1000
        stats.totalAttempts = 50
        stats.currentStreak = 7
        stats.totalFavorites = 20
        stats.accuracy = 85
    } finally {
        statsLoading.value = false
    }
}

// 添加一个刷新统计数据的方法，可以被其他页面调用
const refreshStats = () => {
    fetchStats()
}

// 获取题目列表
const fetchQuestions = async (page = 1) => {
    questionsLoading.value = true
    try {
        const response = await api.get('/questions', {
            params: {
                page,
                limit: pagination.pageSize,
                sort: 'popular'  // 假设后端支持按热门排序
            }
        })
        
        problemList.value = response.data.questions
        pagination.total = response.data.pagination.total
    } catch (error) {
        console.error('获取题目列表失败', error)
        message.error('获取题目列表失败')
        // 如果 API 不可用，使用模拟数据
        problemList.value = [
            {
                id: 1,
                title: '两数之和',
                type: '单选',
                difficulty: '简单'
            },
            {
                id: 2,
                title: '最长回文子串',
                type: '多选',
                difficulty: '中等'
            }
        ]
    } finally {
        questionsLoading.value = false
    }
}

// 从题目类型获取标签
const getTagsFromType = (type) => {
    const typeToTags = {
        '单选': ['选择题'],
        '多选': ['选择题', '多选'],
        '判断': ['判断题'],
        '问答': ['问答题']
    }
    
    return typeToTags[type] || [type]
}

// 获取标签颜色
const getTagColor = (tag) => {
    const colors = {
        '选择题': 'blue',
        '多选': 'green',
        '判断题': 'purple',
        '问答题': 'orange'
    }
    return colors[tag] || 'default'
}

// 获取难度标签颜色
const getDifficultyColor = (difficulty) => {
    const colors = {
        '简单': 'success',
        '中等': 'warning',
        '困难': 'error'
    }
    return colors[difficulty] || 'default'
}

// 获取选项样式
const getOptionClass = (optionKey) => {
  if (!isAnswered.value) return ''
  if (optionKey === currentQuestion.value?.correctAnswer) return 'correct-option'
  if (optionKey === selectedAnswer.value && selectedAnswer.value !== currentQuestion.value?.correctAnswer) {
    return 'wrong-option'
  }
  return ''
}

// 开始做题 - 修改为直接在当前页面打开弹窗
const startQuestion = async (id) => {
  questionModalVisible.value = true
  currentQuestion.value = null
  selectedAnswer.value = ''
  isAnswered.value = false
  
  try {
    const response = await api.get(`/questions/${id}`)
    const questionData = response.data.question
    
    // 格式化题目数据
    currentQuestion.value = {
      id: questionData.id,
      title: questionData.title,
      options: Array.isArray(questionData.options) 
        ? questionData.options.map((opt, idx) => ({ 
            key: String.fromCharCode(65 + idx), // 转为 A, B, C, D...
            content: opt 
          }))
        : [],
      correctAnswer: questionData.correct_answer,
      explanation: questionData.explanation,
      difficulty: questionData.difficulty,
      type: questionData.type
    }
  } catch (error) {
    message.error('获取题目失败')
    questionModalVisible.value = false
  }
}

// 提交答案
const handleSubmit = async () => {
  if (!selectedAnswer.value || !currentQuestion.value) return
  
  try {
    // 提交答案到服务器
    const response = await api.post(`/questions/${currentQuestion.value.id}/submit`, {
      selectedAnswer: selectedAnswer.value
    })
    
    const { isCorrect, correctAnswer, explanation } = response.data
    
    isAnswered.value = true
    
    // 更新题目信息
    if (currentQuestion.value) {
      currentQuestion.value.correctAnswer = correctAnswer
      currentQuestion.value.explanation = explanation
    }
    
    // 显示结果
    if (isCorrect) {
      message.success('回答正确！')
    } else {
      message.error('回答错误！')
    }
    
    // 通知其他组件用户已完成答题，刷新统计
    window.dispatchEvent(new CustomEvent('question-answered'))
    // 自己也刷新统计
    refreshStats()
  } catch (error) {
    message.error('提交答案失败')
  }
}

// 关闭题目弹窗
const closeQuestionModal = () => {
  questionModalVisible.value = false
}

// 跳转到更多题目页面
const goToMoreQuestions = () => {
  router.push('/multipleChoice')
  questionModalVisible.value = false
}

// 旧的跳转方法保留，以兼容其他地方的使用
const goToQuestion = (id) => {
  router.push({
    path: '/multipleChoice',
    query: { id }
  })
}

// 组件挂载时获取数据
onMounted(() => {
    fetchStats()
    fetchQuestions()
    
    // 监听自定义事件，当用户完成答题时刷新统计数据
    window.addEventListener('question-answered', refreshStats)
})

// 组件卸载时移除监听器
onUnmounted(() => {
    window.removeEventListener('question-answered', refreshStats)
})

// 导出刷新统计方法，让其他组件可以调用
defineExpose({
    refreshStats
})
</script>

<style scoped lang="less">
.content {
        padding: 24px 50px;

        .statistics {
            margin-bottom: 24px;

            h2 {
            margin: 0;
            color: #1890ff;
            }
        }

    // 移动端样式
    @media screen and (max-width: 768px) {
        padding: 12px 16px;

        .statistics {
        :deep(.ant-col) {
            // 在移动端下统计卡片宽度为100%
            width: 100%;
            margin-bottom: 12px;
        }

        :deep(.ant-card) {
                .ant-card-head {
                padding: 0 12px;
                min-height: 40px;
                
                .ant-card-head-title {
                    padding: 8px 0;
                }
                }
                .ant-card-body {
                padding: 12px;
                }
            }
        }

        .problem-list {
            :deep(.ant-list-item) {
                padding: 12px;
                flex-wrap: wrap;

                .ant-list-item-meta {
                    margin-bottom: 12px;
                }

                .ant-list-item-extra {
                    margin: 0;
                    width: 100%;
                
                .ant-space {
                    width: 100%;
                    justify-content: space-between;
                }
            }
        }
    }
}

    .problem-list {
        background: #fff;
    }
}

.question-modal {
  .question-card {
    margin-bottom: 20px;

    .options-list {
      display: block;
      margin-top: 20px;

      :deep(.ant-radio-wrapper) {
        display: block;
        margin: 12px 0;
        padding: 10px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f5f5;
        }

        &.correct-option {
          background-color: #f6ffed;
          border-color: #b7eb8f;
        }

        &.wrong-option {
          background-color: #fff2f0;
          border-color: #ffccc7;
        }
      }
    }

    .explanation {
      margin-top: 20px;
      padding: 16px;
      background-color: #fafafa;
      border-radius: 4px;

      p {
        margin: 8px 0;
      }
    }
  }

  .action-bar {
    text-align: center;
    margin-top: 24px;
  }
}
</style>