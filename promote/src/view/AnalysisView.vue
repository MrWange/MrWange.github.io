<template>
   <a-layout-content class="content">
    <!-- 顶部数据卡片 -->
    <a-row :gutter="[16, 16]" class="stat-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <Statistic
            title="总答题数"
            :value="userStats.totalAttempts"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </Statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <Statistic
            title="正确率"
            :value="userStats.accuracy"
            :precision="1"
            suffix="%"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </Statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <Statistic
            title="连续答题天数"
            :value="userStats.currentStreak"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <FireOutlined />
            </template>
          </Statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <Statistic
            title="学习时长(周)"
            :value="userStats.weeklyStudyTime || 0"
            :precision="0"
            suffix="分钟"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </Statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-container">
      <!-- 答题趋势图 -->
      <a-col :xs="24" :md="12" :lg="8">
        <a-card title="近期答题趋势" v-if="!chartLoading">
          <v-chart class="chart" :option="trendOption" autoresize />
        </a-card>
        <a-card title="加载中..." v-else>
          <a-skeleton active />
        </a-card>
      </a-col>
      <!-- 难度分布 -->
      <a-col :xs="24" :md="12" :lg="8">
        <a-card title="难度分布" v-if="!chartLoading">
          <v-chart class="chart" :option="difficultyChartOption" autoresize />
        </a-card>
        <a-card title="加载中..." v-else>
          <a-skeleton active />
        </a-card>
      </a-col>
      <!-- 知识点分布 -->
      <a-col :xs="24" :md="24" :lg="8">
        <a-card title="知识点掌握情况" v-if="!chartLoading">
          <v-chart class="chart" :option="radarOption" autoresize />
        </a-card>
        <a-card title="加载中..." v-else>
          <a-skeleton active />
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近活动 -->
    <a-card title="最近活动" class="recent-activities">
      <a-list
        v-if="!loading && activities.length > 0"
        :dataSource="activities"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :title="item.title"
              :description="item.time"
            >
              <template #avatar>
                <a-avatar :style="{ backgroundColor: item.result === '正确' ? '#52c41a' : '#f5222d' }">
                  <component :is="item.result === '正确' ? CheckCircleOutlined : CloseCircleOutlined" />
                </a-avatar>
              </template>
            </a-list-item-meta>
            <template #extra>
              <a-tag :color="item.result === '正确' ? 'success' : 'error'">
                {{ item.result }}
              </a-tag>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-else-if="!loading" description="暂无活动记录" />
      <a-skeleton v-else active :paragraph="{ rows: 5 }" />
    </a-card>

    <!-- 进步方案 -->
    <a-card title="个性化进步方案" class="improvement-plan">
      <a-timeline>
        <a-timeline-item color="green">
          <template #dot>
            <TrophyOutlined />
          </template>
          <h4>重点攻克领域</h4>
          <p>根据数据分析，建议重点提升以下知识点：</p>
          <div class="weak-points">
            <a-tag v-for="point in weakPoints" :key="point.category" color="red">
              {{ point.category }}
            </a-tag>
            <a-empty v-if="weakPoints.length === 0" description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </a-timeline-item>
        
        <a-timeline-item color="blue">
          <template #dot>
            <ScheduleOutlined />
          </template>
          <h4>学习建议</h4>
          <a-list size="small">
            <a-list-item>每天保持1-2小时的刷题时间</a-list-item>
            <a-list-item>先易后难，循序渐进</a-list-item>
            <a-list-item>做错题目及时复习，总结错误原因</a-list-item>
          </a-list>
        </a-timeline-item>

        <a-timeline-item color="purple">
          <template #dot>
            <AimOutlined />
          </template>
          <h4>近期目标</h4>
          <a-progress :percent="progressStats.progressPercentage || 0" :steps="5" size="small" />
          <p>已完成 {{ progressStats.attemptedCount || 0 }}/{{ progressStats.totalCount || 0 }} 题</p>
        </a-timeline-item>
      </a-timeline>
    </a-card>
   </a-layout-content>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, RadarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Empty } from 'ant-design-vue'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ScheduleOutlined,
  AimOutlined
} from '@ant-design/icons-vue'
import { Statistic } from 'ant-design-vue'
import api from '../services/api'

// 注册必须的组件
use([
  CanvasRenderer,
  LineChart,
  RadarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 用户统计数据
const userStats = reactive({
  totalAttempts: 0,
  correctAttempts: 0,
  accuracy: 0,
  totalFavorites: 0,
  weeklyStudyTime: 0,
  currentStreak: 0,
  maxStreak: 0
})

// 弱点知识点
const weakPoints = ref<any[]>([])

// 学习进度
const progressStats = reactive({
  attemptedCount: 0,
  totalCount: 0,
  progressPercentage: 0
})

// 图表加载状态
const chartLoading = ref(true)

// 最近活动数据
const activities = ref<any[]>([])
const loading = ref(true)

// 加载用户活动
const loadUserActivities = async () => {
    try {
        const response = await api.get('/questions/user/attempts', {
            params: { limit: 5 } // 只获取最近5条
        })
        
        // 确保数据存在
        if (response.data && response.data.data && response.data.data.attempts) {
            // 格式化活动记录
            activities.value = response.data.data.attempts.map(attempt => ({
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
        loading.value = false
    }
}

// 知识点雷达图配置
const radarOption = ref({
  radar: {
    indicator: [
      { name: '数组', max: 100 },
      { name: '字符串', max: 100 },
      { name: '链表', max: 100 },
      { name: '树', max: 100 },
      { name: '动态规划', max: 100 }
    ]
  },
  series: [{
    type: 'radar',
    data: [
      {
        value: [0, 0, 0, 0, 0],
        name: '掌握度',
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }]
})

// 难度分布图表配置
const difficultyChartOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: '难度分布',
      type: 'pie',
      radius: '70%',
      data: [
        { value: 0, name: '简单' },
        { value: 0, name: '中等' },
        { value: 0, name: '困难' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 答题趋势图配置
const trendOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '答题数',
      type: 'line',
      data: [0, 0, 0, 0, 0, 0, 0],
      smooth: true,
      areaStyle: {
        opacity: 0.3
      }
    },
    {
      name: '正确数',
      type: 'line',
      data: [0, 0, 0, 0, 0, 0, 0],
      smooth: true,
      areaStyle: {
        opacity: 0.3
      }
    }
  ]
})

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    // 首先尝试从 users/stats 获取基础统计信息
    const response = await api.get('/users/stats')
    const stats = response.data.stats || {}
    
    // 基础统计数据
    userStats.totalAttempts = stats.totalAttempts || 0
    userStats.correctAttempts = stats.correctAttempts || 0
    userStats.accuracy = stats.accuracy || 0
    userStats.totalFavorites = stats.totalFavorites || 0
    
    // 处理难度分布数据
    if (stats.difficultyStats && stats.difficultyStats.length > 0) {
      updateDifficultyChart(stats.difficultyStats)
    }
    
    // 也可以尝试从趋势数据中计算总和
    try {
      const trendResponse = await api.get('/users/trend', { params: { days: 30 } }) // 获取更长时间的趋势
      if (trendResponse.data && trendResponse.data.data) {
        // 如果有summary总结数据，直接使用
        if (trendResponse.data.data.summary) {
          const summary = trendResponse.data.data.summary
          // 只有在原始数据为0时才使用趋势数据的汇总
          if (userStats.totalAttempts === 0) {
            userStats.totalAttempts = summary.totalAttempts || 0
          }
          
          if (userStats.correctAttempts === 0) {
            userStats.correctAttempts = summary.totalCorrect || 0
          }
          
          if (userStats.accuracy === 0 && summary.overallAccuracy) {
            userStats.accuracy = summary.overallAccuracy
          }
        } 
        // 如果没有summary，则自己计算趋势数据的总和
        else if (trendResponse.data.data.trendData && trendResponse.data.data.trendData.length > 0) {
          const trendData = trendResponse.data.data.trendData
          
          // 如果原始数据为0，则计算总和
          if (userStats.totalAttempts === 0) {
            userStats.totalAttempts = trendData.reduce((sum, day) => sum + (day.attemptCount || 0), 0)
          }
          
          if (userStats.correctAttempts === 0) {
            userStats.correctAttempts = trendData.reduce((sum, day) => sum + (day.correctCount || 0), 0)
          }
          
          // 如果总答题数不为0但正确率为0，则计算正确率
          if (userStats.totalAttempts > 0 && userStats.accuracy === 0) {
            userStats.accuracy = parseFloat((userStats.correctAttempts / userStats.totalAttempts * 100).toFixed(1))
          }
        }
      }
    } catch (trendError) {
      console.error('获取趋势数据失败', trendError)
    }
    
    // 尝试从答题历史获取统计数据
    try {
      const historyResponse = await api.get('/questions/attempt/stats')
      if (historyResponse.data && historyResponse.data.data) {
        const historyStats = historyResponse.data.data
        
        // 只有在原始数据为0时才使用历史数据的统计
        if (userStats.totalAttempts === 0) {
          userStats.totalAttempts = historyStats.totalAttempts || 0
        }
        
        if (userStats.correctAttempts === 0) {
          userStats.correctAttempts = historyStats.correctAttempts || 0
        }
        
        if (userStats.accuracy === 0 && historyStats.accuracy) {
          userStats.accuracy = historyStats.accuracy
        }
        
        // 处理难度分布数据
        if (historyStats.difficultyStats && historyStats.difficultyStats.length > 0) {
          updateDifficultyChart(historyStats.difficultyStats)
        }
      }
    } catch (historyError) {
      console.error('获取答题历史统计失败', historyError)
    }
    
    // 尝试获取连续打卡信息
    if (!userStats.currentStreak) {
      try {
        const streakResponse = await api.get('/questions/streak-info')
        if (streakResponse.data && streakResponse.data.data) {
          userStats.currentStreak = streakResponse.data.data.currentStreak || 0
          userStats.maxStreak = streakResponse.data.data.maxStreak || 0
        }
      } catch (streakError) {
        console.error('获取打卡信息失败', streakError)
      }
    }
    
    // 如果通过上面所有方法都无法获取准确的正确率，但有答题总数和正确数，则计算正确率
    if (userStats.totalAttempts > 0 && userStats.correctAttempts > 0 && userStats.accuracy === 0) {
      userStats.accuracy = parseFloat((userStats.correctAttempts / userStats.totalAttempts * 100).toFixed(1))
    }

    // 特别添加获取学习时长的请求
    try {
      const studyTimeResponse = await api.get('/study/weekly')
      if (studyTimeResponse.data) {
        userStats.weeklyStudyTime = studyTimeResponse.data.studyTime || 0
      }
    } catch (studyTimeError) {
      console.error('获取学习时长统计失败', studyTimeError)
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
    
    // 尝试使用备选方法获取数据
    try {
      // 备选：从答题历史中获取数据
      const historyResponse = await api.get('/questions/attempt/history', { 
        params: { limit: 1 } // 只需要分页信息
      })
      
      if (historyResponse.data && historyResponse.data.data && historyResponse.data.data.pagination) {
        userStats.totalAttempts = historyResponse.data.data.pagination.total || 0
      }
    } catch (fallbackError) {
      console.error('备选方法获取统计数据也失败', fallbackError)
    }
  }
}

// 更新难度分布图表
const updateDifficultyChart = (difficultyStats) => {
  const chartData = []
  
  // 预设难度级别
  const difficultyLevels = {
    '简单': { color: '#52c41a' },
    '中等': { color: '#faad14' },
    '困难': { color: '#f5222d' }
  }
  
  // 使用服务器返回的数据更新图表
  difficultyStats.forEach(item => {
    const difficulty = item.difficulty
    const count = item.count
    
    chartData.push({
      value: count,
      name: difficulty,
      itemStyle: difficultyLevels[difficulty] ? { color: difficultyLevels[difficulty].color } : undefined
    })
  })
  
  // 更新图表数据
  if (chartData.length > 0) {
    difficultyChartOption.value.series[0].data = chartData
  }
}

// 获取答题趋势
const fetchAnsweringTrend = async () => {
  try {
    const response = await api.get('/users/trend', { params: { days: 7 } })
    if (response.data && response.data.data && response.data.data.trendData) {
      const trend = response.data.data.trendData
      
      // 提取日期和数据
      const dates = trend.map((item: any) => item.date)
      const attemptCounts = trend.map((item: any) => item.attemptCount)
      const correctCounts = trend.map((item: any) => item.correctCount)
      
      // 更新趋势图数据
      trendOption.value.xAxis.data = dates
      trendOption.value.series[0].data = attemptCounts
      trendOption.value.series[1].data = correctCounts
    }
  } catch (error) {
    console.error('获取趋势数据失败', error)
  }
}

// 获取知识点雷达图数据
const fetchKnowledgeRadar = async () => {
  try {
    const response = await api.get('/users/knowledge-radar')
    const radarData = response.data.data
    
    if (radarData && radarData.length > 0) {
      // 构建雷达图数据
      const categories = radarData.map((item: any) => ({ name: item.category, max: 100 }))
      const values = radarData.map((item: any) => item.masteryLevel)
      
      radarOption.value.radar.indicator = categories
      radarOption.value.series[0].data[0].value = values
    }
  } catch (error) {
    console.error('获取知识点雷达图数据失败', error)
  } finally {
    chartLoading.value = false
  }
}

// 获取学习进度
const fetchLearningProgress = async () => {
  try {
    const response = await api.get('/users/learning-progress')
    const progress = response.data.data
    
    progressStats.attemptedCount = progress.attemptedCount || 0
    progressStats.totalCount = progress.totalCount || 0
    progressStats.progressPercentage = progress.progressPercentage || 0
  } catch (error) {
    console.error('获取学习进度失败', error)
  }
}

// 获取弱点知识点
const fetchWeakPoints = async () => {
  try {
    const response = await api.get('/users/weak-points', { params: { limit: 3 } })
    weakPoints.value = response.data.data || []
  } catch (error) {
    console.error('获取弱点知识点失败', error)
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  // 并行获取多个数据源以提高效率
  const promises = [
    fetchUserStats(),
    loadUserActivities(),
    fetchLearningProgress(),
    fetchWeakPoints()
  ]
  
  await Promise.all(promises)
  
  // 趋势和雷达图可能依赖于其他统计数据，所以最后获取
  await fetchAnsweringTrend()
  await fetchKnowledgeRadar()

  // 监听学习时长更新事件
  window.addEventListener('study-time-updated', () => {
    // 当学习时长更新时，刷新统计数据
    fetchUserStats()
  })
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('study-time-updated', fetchUserStats)
})
</script>

<style scoped lang="less">
.content {
  padding: 24px;
  background: #f0f2f5;

  .stat-cards {
    margin-bottom: 24px;
  }

  .charts-container {
    margin-bottom: 24px;

    .chart {
      height: 300px;
    }
  }
  
  .recent-activities {
    margin-bottom: 24px;
  }

  .improvement-plan {
    h4 {
      margin-bottom: 8px;
      color: #1890ff;
    }

    .weak-points {
      margin-bottom: 16px;
      
      .ant-tag {
        margin-bottom: 8px;
        margin-right: 8px;
      }
    }

    .ant-timeline-item {
      padding-bottom: 24px;
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .content {
    padding: 12px;

    .chart {
      height: 250px;
    }

    .ant-card {
      :deep(.ant-card-body) {
        padding: 12px;
      }
    }
  }
}
</style> 