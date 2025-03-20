<template>
    <a-layout-content class="content">
      <!-- 竞赛列表 -->
      <a-card title="竞赛列表" class="contest-card">
        <a-list
          :data-source="contests"
          item-layout="vertical"
          :loading="loading"
          :pagination="pagination"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :title="item.title"
                :description="item.date"
              />
              <div class="contest-actions">
                <a-button type="primary" @click="showContestDetails(item)">查看详情</a-button>
                <a-button type="default" @click="registerContest(item)" :disabled="item.registered">
                  {{ item.registered ? '已报名' : '报名' }}
                </a-button>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
  
      <!-- 竞赛详情弹窗 -->
      <a-modal
        v-model:visible="detailsModalVisible"
        :title="currentContest?.title"
      >
        <template v-if="currentContest">
          <p><strong>日期：</strong>{{ currentContest.date }}</p>
          <p><strong>描述：</strong>{{ currentContest.description }}</p>
          <p><strong>状态：</strong>{{ currentContest.registered ? '已报名' : '未报名' }}</p>
        </template>
      </a-modal>
    </a-layout-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import api from '../services/api'

// 竞赛数据
const contests = ref([])
const loading = ref(true)
const detailsModalVisible = ref(false)
const currentContest = ref(null)

// 分页配置
const pagination = ref({
  pageSize: 5,
  total: 0,
  current: 1,
  onChange: (page: number) => {
    pagination.value.current = page
    fetchContests(page)
  }
})

// 获取竞赛列表
const fetchContests = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.get('/contests', {
      params: {
        page,
        limit: pagination.value.pageSize
      }
    })
    
    contests.value = response.data.contests
    pagination.value.total = response.data.pagination.total
  } catch (error) {
    message.error('获取竞赛列表失败')
  } finally {
    loading.value = false
  }
}

// 显示竞赛详情
const showContestDetails = (contest: any) => {
  currentContest.value = contest
  detailsModalVisible.value = true
}

// 报名竞赛
const registerContest = async (contest: any) => {
  if (contest.registered) {
    message.info('您已报名此竞赛')
    return
  }
  
  try {
    await api.post(`/contests/${contest.id}/register`)
    contest.registered = true
    message.success('报名成功')
  } catch (error) {
    message.error('报名失败，请稍后重试')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchContests()
})
</script>

<style scoped lang="less">
.content {
padding: 24px;
background: #f0f2f5;

.contest-card {
    .ant-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .contest-actions {
        display: flex;
        gap: 8px;
    }
    }
}
}

// 移动端适配
@media screen and (max-width: 768px) {
.content {
    padding: 12px;

    .contest-card {
    .ant-list-item {
        flex-direction: column;
        align-items: flex-start;

        .contest-actions {
        width: 100%;
        justify-content: flex-start;
        }
    }
    }
}
}
</style>