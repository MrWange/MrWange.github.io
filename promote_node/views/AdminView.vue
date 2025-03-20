<template>
  <div class="admin-dashboard">
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu
          mode="inline"
          v-model:selectedKeys="selectedKeys"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-menu-item key="dashboard">
            <dashboard-outlined />
            <span>仪表板概览</span>
          </a-menu-item>
          <a-sub-menu key="user-management">
            <template #title>
              <span>
                <user-outlined />
                <span>用户管理</span>
              </span>
            </template>
            <a-menu-item key="user-list">用户列表</a-menu-item>
            <a-menu-item key="user-stats">用户统计</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="question-management">
            <template #title>
              <span>
                <question-circle-outlined />
                <span>题目管理</span>
              </span>
            </template>
            <a-menu-item key="question-list">题目列表</a-menu-item>
            <a-menu-item key="create-question">创建题目</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="discussion-management">
            <template #title>
              <span>
                <comment-outlined />
                <span>讨论管理</span>
              </span>
            </template>
            <a-menu-item key="discussion-list">讨论列表</a-menu-item>
            <a-menu-item key="comment-management">评论管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="contest-management">
            <template #title>
              <span>
                <trophy-outlined />
                <span>竞赛管理</span>
              </span>
            </template>
            <a-menu-item key="contest-list">竞赛列表</a-menu-item>
            <a-menu-item key="create-contest">创建竞赛</a-menu-item>
            <a-menu-item key="contest-participants">竞赛参与者</a-menu-item>
          </a-sub-menu>
          <a-menu-item key="notifications">
            <bell-outlined />
            <span>通知管理</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
      >
        <!-- 仪表板概览 -->
        <div v-if="selectedKeys[0] === 'dashboard'">
          <h2>系统概览</h2>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="总用户数" :value="dashboardStats.totalUsers" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="总题目数" :value="dashboardStats.totalQuestions" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="总讨论数" :value="dashboardStats.totalDiscussions" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="总竞赛数" :value="dashboardStats.totalContests" />
            </a-col>
          </a-row>
          <a-divider />
          <h3>最近活动</h3>
          <a-list
            size="small"
            bordered
            :data-source="recentActivities"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                {{ item.time }} - {{ item.user }} {{ item.action }}
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 用户管理部分 -->
        <div v-if="selectedKeys[0] === 'user-list'">
          <h2>用户列表</h2>
          <a-input-search
            v-model:value="userSearch"
            placeholder="搜索用户名或邮箱"
            style="width: 300px; margin-bottom: 16px"
            @search="searchUsers"
          />
          <a-table
            :columns="userColumns"
            :data-source="users"
            :pagination="userPagination"
            @change="handleUserTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a @click="viewUserDetails(record)">查看</a>
                <a-divider type="vertical" />
                <a @click="editUserRole(record)">编辑角色</a>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 用户统计功能 -->
        <div v-if="selectedKeys[0] === 'user-stats'">
          <!-- 轻微修改，确保 ID 与上面的 JS 代码匹配 -->
          <h2>用户统计分析</h2>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="总用户数" :value="userStats.totalUsers" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="今日新增" :value="userStats.newToday" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="本周新增" :value="userStats.newThisWeek" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="本月新增" :value="userStats.newThisMonth" />
            </a-col>
          </a-row>
          
          <a-divider />
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-card title="用户注册趋势">
                <div id="userTrendChart" style="height: 300px"></div>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="用户活跃度分析">
                <div id="userActivityChart" style="height: 300px"></div>
              </a-card>
            </a-col>
          </a-row>
          
          <a-divider />
          
          <a-row :gutter="16">
            <a-col :span="8">
              <a-card title="用户角色分布">
                <div id="userRoleChart" style="height: 240px"></div>
              </a-card>
            </a-col>
            <a-col :span="8">
              <a-card title="答题正确率分布">
                <div id="accuracyChart" style="height: 240px"></div>
              </a-card>
            </a-col>
            <a-col :span="8">
              <a-card title="用户活跃频次">
                <div id="activityFreqChart" style="height: 240px"></div>
              </a-card>
            </a-col>
          </a-row>
          
          <a-divider />
          
          <h3>最活跃用户列表</h3>
          <a-table
            :columns="activeUserColumns"
            :data-source="userStats.mostActiveUsers"
            :pagination="{ pageSize: 5 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a @click="viewUserDetails(record)">查看详情</a>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 题目管理部分 -->
        <div v-if="selectedKeys[0] === 'question-list'">
          <h2>题目列表</h2>
          <a-input-search
            v-model:value="questionSearch"
            placeholder="搜索题目标题或内容"
            style="width: 300px; margin-bottom: 16px"
            @search="searchQuestions"
          />
          <a-button type="primary" style="margin-bottom: 16px; margin-left: 8px" @click="createNewQuestion">
            创建新题目
          </a-button>
          <a-table
            :columns="questionColumns"
            :data-source="questions"
            :pagination="questionPagination"
            @change="handleQuestionTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a @click="editQuestion(record)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定要删除这个题目吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="deleteQuestion(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 创建题目表单 -->
        <div v-if="selectedKeys[0] === 'create-question'">
          <h2>{{ editingQuestion ? '编辑题目' : '创建新题目' }}</h2>
          <a-form :model="questionForm" :rules="questionRules" layout="vertical">
            <a-form-item label="题目标题" name="title">
              <a-input v-model:value="questionForm.title" />
            </a-form-item>
            <a-form-item label="题目类型" name="type">
              <a-select v-model:value="questionForm.type">
                <a-select-option value="单选">单选题</a-select-option>
                <a-select-option value="多选">多选题</a-select-option>
                <a-select-option value="判断">判断题</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="难度" name="difficulty">
              <a-select v-model:value="questionForm.difficulty">
                <a-select-option value="简单">简单</a-select-option>
                <a-select-option value="中等">中等</a-select-option>
                <a-select-option value="困难">困难</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="选项" v-if="questionForm.type !== '判断'">
              <div v-for="(option, index) in questionForm.options" :key="index">
                <a-input-group compact>
                  <a-input
                    style="width: 10%"
                    disabled
                    :value="String.fromCharCode(65 + index)"
                  />
                  <a-input
                    style="width: 80%"
                    v-model:value="questionForm.options[index]"
                    placeholder="请输入选项内容"
                  />
                  <a-button
                    style="width: 10%"
                    danger
                    @click="removeOption(index)"
                    :disabled="questionForm.options.length <= 2"
                  >
                    删除
                  </a-button>
                </a-input-group>
              </div>
              <a-button block type="dashed" @click="addOption" style="margin-top: 8px">
                添加选项
              </a-button>
            </a-form-item>
            <a-form-item label="正确答案" name="correctAnswer">
              <a-select v-model:value="questionForm.correctAnswer" v-if="questionForm.type === '单选'">
                <a-select-option 
                  v-for="(_, index) in questionForm.options" 
                  :key="index"
                  :value="String.fromCharCode(65 + index)"
                >
                  {{ String.fromCharCode(65 + index) }}
                </a-select-option>
              </a-select>
              <a-checkbox-group v-model:value="questionForm.correctAnswers" v-if="questionForm.type === '多选'">
                <a-checkbox 
                  v-for="(_, index) in questionForm.options" 
                  :key="index"
                  :value="String.fromCharCode(65 + index)"
                >
                  {{ String.fromCharCode(65 + index) }}
                </a-checkbox>
              </a-checkbox-group>
              <a-radio-group v-model:value="questionForm.correctAnswer" v-if="questionForm.type === '判断'">
                <a-radio value="A">正确</a-radio>
                <a-radio value="B">错误</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="答案解释" name="explanation">
              <a-textarea v-model:value="questionForm.explanation" :rows="4" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="submitQuestionForm">
                {{ editingQuestion ? '保存修改' : '创建题目' }}
              </a-button>
              <a-button style="margin-left: 8px" @click="resetQuestionForm">
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 竞赛管理 -->
        <div v-if="selectedKeys[0] === 'contest-list'">
          <h2>竞赛列表</h2>
          <a-button type="primary" style="margin-bottom: 16px" @click="createNewContest">
            创建新竞赛
          </a-button>
          <a-table
            :columns="contestColumns"
            :data-source="contests"
            :pagination="contestPagination"
            @change="handleContestTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a @click="editContest(record)">编辑</a>
                <a-divider type="vertical" />
                <a @click="viewContestParticipants(record)">查看参与者</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定要删除这个竞赛吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="deleteContest(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 创建竞赛表单 -->
        <div v-if="selectedKeys[0] === 'create-contest'">
          <h2>{{ editingContest ? '编辑竞赛' : '创建新竞赛' }}</h2>
          <a-form :model="contestForm" :rules="contestRules" layout="vertical">
            <a-form-item label="竞赛标题" name="title">
              <a-input v-model:value="contestForm.title" />
            </a-form-item>
            <a-form-item label="竞赛日期" name="date">
              <a-date-picker 
                v-model:value="contestForm.date"
                show-time 
                format="YYYY-MM-DD HH:mm:ss" 
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="竞赛描述" name="description">
              <a-textarea v-model:value="contestForm.description" :rows="4" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="submitContestForm">
                {{ editingContest ? '保存修改' : '创建竞赛' }}
              </a-button>
              <a-button style="margin-left: 8px" @click="resetContestForm">
                重置
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 竞赛参与者管理 -->
        <div v-if="selectedKeys[0] === 'contest-participants'">
          <div v-if="!selectedContest">
            <h2>竞赛参与者管理</h2>
            <p>请先从竞赛列表中选择一个竞赛</p>
            <a-table
              :columns="contestSimpleColumns"
              :data-source="contests"
              :pagination="contestPagination"
              @change="handleContestTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a @click="viewContestParticipants(record)">查看参与者</a>
                </template>
              </template>
            </a-table>
          </div>
          <div v-else>
            <a-page-header
              :title="selectedContest.title + ' - 参与者'"
              @back="selectedContest = null"
            />
            <a-table
              :columns="participantColumns"
              :data-source="participants"
              :pagination="participantPagination"
              @change="handleParticipantTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-popconfirm
                    title="确定要移除此参与者吗？"
                    ok-text="是"
                    cancel-text="否"
                    @confirm="removeParticipant(record)"
                  >
                    <a>移除</a>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </div>
        </div>

        <!-- 讨论管理 -->
        <div v-if="selectedKeys[0] === 'discussion-list'">
          <h2>讨论列表</h2>
          <a-table
            :columns="discussionColumns"
            :data-source="discussions"
            :pagination="discussionPagination"
            @change="handleDiscussionTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a @click="viewDiscussionDetails(record)">查看</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定要删除这个讨论吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="deleteDiscussion(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 通知管理 -->
        <div v-if="selectedKeys[0] === 'notifications'">
          <h2>通知管理</h2>
          <a-form layout="inline" style="margin-bottom: 16px">
            <a-form-item>
              <a-button type="primary" @click="openCreateNotificationModal">
                创建新通知
              </a-button>
            </a-form-item>
          </a-form>
          <a-table
            :columns="notificationColumns"
            :data-source="notifications"
            :pagination="notificationPagination"
            @change="handleNotificationTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-popconfirm
                  title="确定要删除这个通知吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="deleteNotification(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 评论管理 -->
        <div v-if="selectedKeys[0] === 'comment-management'">
          <h2>评论与举报管理</h2>
          <a-tabs>
            <a-tab-pane key="comments" tab="评论列表">
              <!-- 原有的评论管理内容 -->
              <a-form layout="inline" style="margin-bottom: 16px">
                <a-form-item label="关键词">
                  <a-input
                    v-model:value="commentFilter.keyword"
                    placeholder="搜索评论内容"
                    style="width: 200px"
                    @pressEnter="fetchComments(1)"
                  />
                </a-form-item>
                <a-form-item label="状态">
                  <a-select
                    v-model:value="commentFilter.status"
                    style="width: 120px"
                    @change="fetchComments(1)"
                  >
                    <a-select-option value="all">全部</a-select-option>
                    <a-select-option value="reported">被举报</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="fetchComments(1)">搜索</a-button>
                  <a-button style="margin-left: 8px" @click="resetCommentFilter">重置</a-button>
                </a-form-item>
              </a-form>
              
              <a-table
                :columns="commentColumns"
                :data-source="comments"
                :pagination="commentPagination"
                @change="handleCommentTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'content'">
                    <a-tooltip :title="record.content">
                      {{ truncateText(record.content, 50) }}
                    </a-tooltip>
                  </template>
                  <template v-if="column.key === 'status'">
                    <a-tag color="red" v-if="record.reported">
                      被举报 ({{ record.reportCount || 1 }}次)
                    </a-tag>
                    <a-tag color="green" v-else>正常</a-tag>
                  </template>
                  <template v-if="column.key === 'action'">
                    <a @click="viewCommentDetails(record)">查看</a>
                    <a-divider type="vertical" />
                    <a-popconfirm
                      title="确定要删除此评论吗？"
                      ok-text="是"
                      cancel-text="否"
                      @confirm="deleteComment(record)"
                    >
                      <a>删除</a>
                    </a-popconfirm>
                  </template>
                </template>
              </a-table>
              
              <!-- 评论详情模态框 -->
              <a-modal
                v-model:visible="commentDetailVisible"
                title="评论详情"
                :footer="null"
              >
                <a-descriptions bordered v-if="currentCommentDetail">
                  <a-descriptions-item label="评论ID" span="3">
                    {{ currentCommentDetail.id }}
                  </a-descriptions-item>
                  <a-descriptions-item label="所属讨论" span="3">
                    {{ currentCommentDetail.discussion_title }}
                    <a-button type="link" size="small" @click="navigateToDiscussion(currentCommentDetail.discussion_id)">
                      查看讨论
                    </a-button>
                  </a-descriptions-item>
                  <a-descriptions-item label="评论作者" span="3">
                    {{ currentCommentDetail.author_name }}
                    <a-button type="link" size="small" @click="viewUserDetails({id: currentCommentDetail.author_id, username: currentCommentDetail.author_name})">
                      查看作者
                    </a-button>
                  </a-descriptions-item>
                  <a-descriptions-item label="评论时间" span="3">
                    {{ currentCommentDetail.created_at }}
                  </a-descriptions-item>
                  <a-descriptions-item label="评论内容" span="3">
                    {{ currentCommentDetail.content }}
                  </a-descriptions-item>
                  <a-descriptions-item v-if="currentCommentDetail.reported" label="举报信息" span="3">
                    <p v-for="(report, index) in currentCommentDetail.reports" :key="index">
                      {{ report.reporter_name }} 举报于 {{ report.report_time }}: {{ report.reason }}
                    </p>
                  </a-descriptions-item>
                </a-descriptions>

                <div class="comment-detail-actions" style="margin-top: 16px; text-align: right;">
                  <a-button @click="commentDetailVisible = false">关闭</a-button>
                  <a-button 
                    type="primary" 
                    danger 
                    style="margin-left: 8px" 
                    @click="deleteCommentFromModal"
                  >
                    删除评论
                  </a-button>
                </div>
                
                <a-empty v-if="!currentCommentDetail" description="未找到评论信息" />
              </a-modal>
            </a-tab-pane>
            
            <a-tab-pane key="reports" tab="举报管理">
              <a-tabs>
                <a-tab-pane key="reported-comments" tab="评论举报">
                  <a-table
                    :columns="reportedCommentColumns"
                    :data-source="reportedItems.comments"
                    :pagination="reportPagination.comments"
                    @change="(pagination) => handleReportTableChange('comments', pagination)"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'action'">
                        <a-space>
                          <a @click="viewCommentDetails(record)">查看详情</a>
                          <a-popconfirm
                            title="确认删除此评论？"
                            @confirm="handleReport('comments', record.comment_id, 'delete')"
                          >
                            <a type="danger">删除</a>
                          </a-popconfirm>
                          <a @click="handleReport('comments', record.comment_id, 'ignore')">忽略举报</a>
                        </a-space>
                      </template>
                    </template>
                  </a-table>
                </a-tab-pane>
                
                <a-tab-pane key="reported-discussions" tab="讨论举报">
                  <a-table
                    :columns="reportedDiscussionColumns"
                    :data-source="reportedItems.discussions"
                    :pagination="reportPagination.discussions"
                    @change="(pagination) => handleReportTableChange('discussions', pagination)"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'action'">
                        <a-space>
                          <a @click="viewDiscussionDetails(record)">查看详情</a>
                          <a-popconfirm
                            title="确认删除此讨论？"
                            @confirm="handleReport('discussions', record.discussion_id, 'delete')"
                          >
                            <a type="danger">删除</a>
                          </a-popconfirm>
                          <a @click="handleReport('discussions', record.discussion_id, 'ignore')">忽略举报</a>
                        </a-space>
                      </template>
                    </template>
                  </a-table>
                </a-tab-pane>
              </a-tabs>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-layout-content>
    </a-layout>

    <!-- 模态框 -->
    <a-modal
      v-model:visible="notificationModalVisible"
      title="创建系统通知"
      @ok="submitNotification"
    >
      <a-form :model="notificationForm" layout="vertical">
        <a-form-item label="通知类型" name="type">
          <a-select v-model:value="notificationForm.type">
            <a-select-option value="系统">系统通知</a-select-option>
            <a-select-option value="更新">更新通知</a-select-option>
            <a-select-option value="提醒">提醒通知</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="通知内容" name="content">
          <a-textarea v-model:value="notificationForm.content" :rows="4" />
        </a-form-item>
        <a-form-item label="发送对象" name="target">
          <a-radio-group v-model:value="notificationForm.target">
            <a-radio value="all">所有用户</a-radio>
            <a-radio value="specific">特定用户</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="用户ID" name="userId" v-if="notificationForm.target === 'specific'">
          <a-input v-model:value="notificationForm.userId" placeholder="输入用户ID，多个ID用逗号分隔" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户详情模态框 -->
    <a-modal
      v-model:visible="userDetailVisible"
      title="用户详情"
      width="800px"
      :footer="null"
    >
      <a-spin :spinning="userDetailLoading">
        <div v-if="currentUserDetail">
          <a-descriptions bordered>
            <a-descriptions-item label="用户ID" span="3">
              {{ currentUserDetail.id }}
            </a-descriptions-item>
            <a-descriptions-item label="用户名" span="2">
              {{ currentUserDetail.username }}
            </a-descriptions-item>
            <a-descriptions-item label="角色">
              <a-tag :color="currentUserDetail.role === '管理员' ? 'red' : 'blue'">
                {{ currentUserDetail.role }}
              </a-tag>
              <a-button type="link" size="small" @click="showRoleEditModal">
                修改角色
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="邮箱" span="3">
              {{ currentUserDetail.email }}
            </a-descriptions-item>
            <a-descriptions-item label="注册时间" span="1.5">
              {{ currentUserDetail.created_at }}
            </a-descriptions-item>
            <a-descriptions-item label="最后登录" span="1.5">
              {{ currentUserDetail.last_login }}
            </a-descriptions-item>
          </a-descriptions>
          
          <a-divider />
          
          <a-tabs>
            <a-tab-pane key="stats" tab="用户统计">
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-statistic title="答题总数" :value="currentUserDetail.stats.totalAttempts" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="正确率" :value="currentUserDetail.stats.accuracy" :precision="2" suffix="%" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="收藏数" :value="currentUserDetail.stats.favoriteCount" />
                </a-col>
              </a-row>
              <a-row :gutter="16" style="margin-top: 16px">
                <a-col :span="8">
                  <a-statistic title="讨论数" :value="currentUserDetail.stats.discussionCount" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="评论数" :value="currentUserDetail.stats.commentCount" />
                </a-col>
              </a-row>
            </a-tab-pane>
            
            <a-tab-pane key="activities" tab="最近活动">
              <a-timeline>
                <a-timeline-item 
                  v-for="(activity, index) in currentUserDetail.recentActivities"
                  :key="index"
                >
                  <template #dot>
                    <ClockCircleOutlined style="fontSize: 16px" />
                  </template>
                  <p>{{ activity.time }} - {{ activity.type }}</p>
                  <p style="color: rgba(0, 0, 0, 0.45)">{{ activity.description }}</p>
                </a-timeline-item>
              </a-timeline>
            </a-tab-pane>
            
            <a-tab-pane key="study-time" tab="学习时长">
              <div id="studyTimeChart" style="height: 300px"></div>
            </a-tab-pane>
          </a-tabs>
        </div>
        <a-empty v-else description="未找到用户信息" />
      </a-spin>
    </a-modal>

    <!-- 修改角色模态框 -->
    <a-modal
      v-model:visible="roleEditVisible"
      title="修改用户角色"
      :confirm-loading="roleEditLoading"
      @ok="submitRoleEdit"
    >
      <a-form :model="roleForm" layout="vertical">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="roleForm.username" disabled />
        </a-form-item>
        <a-form-item label="当前角色" name="currentRole">
          <a-input v-model:value="roleForm.currentRole" disabled />
        </a-form-item>
        <a-form-item label="新角色" name="newRole">
          <a-select v-model:value="roleForm.newRole">
            <a-select-option value="普通用户">普通用户</a-select-option>
            <a-select-option value="管理员">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="修改原因" name="reason">
          <a-textarea v-model:value="roleForm.reason" :rows="3" placeholder="请输入修改角色的原因" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import {
  DashboardOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  CommentOutlined,
  TrophyOutlined,
  BellOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { userStore } from '../store/user'
import * as echarts from 'echarts'

const router = useRouter()

// 检查是否是管理员
onMounted(async () => {
  if (!userStore.state.isLoggedIn) {
    message.error('请先登录')
    router.push('/login')
    return
  }
  
  if (userStore.state.role !== '管理员') {
    message.error('您没有管理员权限')
    router.push('/')
    return
  }
  
  // 初始化数据
  fetchDashboardStats()
  fetchUsers()
  fetchQuestions()
  fetchContests()
  fetchDiscussions()
  fetchNotifications()
})

// 导航状态
const selectedKeys = ref(['dashboard'])

// 仪表板数据
const dashboardStats = ref({
  totalUsers: 0,
  totalQuestions: 0,
  totalDiscussions: 0,
  totalContests: 0
})

const recentActivities = ref([])

// 获取仪表板数据
const fetchDashboardStats = async () => {
  try {
    // 这里需要后端提供一个统一的接口来获取系统概况数据
    // 如果没有，可以分别调用各个模块的统计接口
    const [usersRes, questionsRes, discussionsRes, contestsRes, activitiesRes] = await Promise.all([
      api.get('/users/all?limit=1'),
      api.get('/questions?limit=1'),
      api.get('/discussions?limit=1'),
      api.get('/contests?limit=1'),
      api.get('/admin/recent-activities') // 假设有这样一个接口
    ])
    
    dashboardStats.value = {
      totalUsers: usersRes.data.pagination?.total || 0,
      totalQuestions: questionsRes.data.pagination?.total || 0,
      totalDiscussions: discussionsRes.data.pagination?.total || 0,
      totalContests: contestsRes.data.pagination?.total || 0
    }
    
    // 假设活动数据格式如下
    recentActivities.value = activitiesRes.data.activities || []
  } catch (error) {
    console.error('获取仪表板数据失败', error)
    message.error('获取仪表板数据失败')
  }
}

// 用户管理相关
const users = ref([])
const userSearch = ref('')
const userPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const userColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: '注册时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const fetchUsers = async (page = 1, limit = 10, search = '') => {
  try {
    let url = `/users/all?page=${page}&limit=${limit}`
    if (search) {
      url += `&search=${search}`
    }
    
    const response = await api.get(url)
    users.value = response.data.users || []
    userPagination.total = response.data.pagination?.total || 0
    userPagination.current = response.data.pagination?.page || 1
  } catch (error) {
    console.error('获取用户列表失败', error)
    message.error('获取用户列表失败')
  }
}

const searchUsers = () => {
  fetchUsers(1, userPagination.pageSize, userSearch.value)
}

const handleUserTableChange = (pagination) => {
  fetchUsers(pagination.current, pagination.pageSize, userSearch.value)
}

// 题目管理相关
const questions = ref([])
const questionSearch = ref('')
const questionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const questionColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '难度',
    dataIndex: 'difficulty',
    key: 'difficulty'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const fetchQuestions = async (page = 1, limit = 10, search = '') => {
  try {
    let url = `/questions?page=${page}&limit=${limit}`
    if (search) {
      url += `&search=${search}`
    }
    
    const response = await api.get(url)
    questions.value = response.data.questions || []
    questionPagination.total = response.data.pagination?.total || 0
    questionPagination.current = response.data.pagination?.page || 1
  } catch (error) {
    console.error('获取题目列表失败', error)
    message.error('获取题目列表失败')
  }
}

const searchQuestions = () => {
  fetchQuestions(1, questionPagination.pageSize, questionSearch.value)
}

const handleQuestionTableChange = (pagination) => {
  fetchQuestions(pagination.current, pagination.pageSize, questionSearch.value)
}

// 题目表单相关
const questionForm = reactive({
  title: '',
  type: '单选',
  difficulty: '中等',
  options: ['', ''],
  correctAnswer: '',
  correctAnswers: [],
  explanation: ''
})

const questionRules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择题目难度', trigger: 'change' }],
  correctAnswer: [{ required: true, message: '请选择正确答案', trigger: 'change' }],
  explanation: [{ required: true, message: '请输入答案解释', trigger: 'blur' }]
}

const editingQuestion = ref(false)
const currentQuestionId = ref(null)

const createNewQuestion = () => {
  editingQuestion.value = false
  currentQuestionId.value = null
  resetQuestionForm()
  selectedKeys.value = ['create-question']
}

const editQuestion = (question) => {
  editingQuestion.value = true
  currentQuestionId.value = question.id
  
  // 获取题目详细信息
  api.get(`/questions/${question.id}`).then(response => {
    const questionData = response.data.question
    
    questionForm.title = questionData.title
    questionForm.type = questionData.type
    questionForm.difficulty = questionData.difficulty
    questionForm.options = questionData.options || ['', '']
    
    if (questionData.type === '单选') {
      questionForm.correctAnswer = questionData.correct_answer
    } else if (questionData.type === '多选') {
      questionForm.correctAnswers = questionData.correct_answer.split(',')
    } else {
      questionForm.correctAnswer = questionData.correct_answer
    }
    
    questionForm.explanation = questionData.explanation
    
    selectedKeys.value = ['create-question']
  }).catch(error => {
    console.error('获取题目详情失败', error)
    message.error('获取题目详情失败')
  })
}

const deleteQuestion = async (question) => {
  try {
    await api.delete(`/questions/${question.id}`)
    message.success('题目删除成功')
    fetchQuestions(questionPagination.current, questionPagination.pageSize, questionSearch.value)
  } catch (error) {
    console.error('删除题目失败', error)
    message.error('删除题目失败')
  }
}

const addOption = () => {
  questionForm.options.push('')
}

const removeOption = (index) => {
  questionForm.options.splice(index, 1)
}

const submitQuestionForm = async () => {
  try {
    // 验证表单
    if (!questionForm.title) {
      message.error('请输入题目标题')
      return
    }
    if (questionForm.type !== '判断' && questionForm.options.some(opt => !opt)) {
      message.error('请填写所有选项内容')
      return
    }
    if (!questionForm.difficulty) {
      message.error('请选择难度')
      return
    }
    if (questionForm.type === '单选' && !questionForm.correctAnswer) {
      message.error('请选择正确答案')
      return
    }
    if (questionForm.type === '多选' && !questionForm.correctAnswers.length) {
      message.error('请选择正确答案')
      return
    }

    // 处理选项和正确答案
    let options = []
    let correctAnswer = ''

    if (questionForm.type === '判断') {
      options = ['正确', '错误']
      correctAnswer = questionForm.correctAnswer
    } else {
      options = questionForm.options
      if (questionForm.type === '多选') {
        // 确保多选答案按字母顺序排序且长度不超过数据库限制
        correctAnswer = questionForm.correctAnswers.slice(0, 10).sort().join('')
      } else {
        correctAnswer = questionForm.correctAnswer
      }
    }

    const formData = {
      title: questionForm.title,
      options: options,
      type: questionForm.type,
      difficulty: questionForm.difficulty,
      explanation: questionForm.explanation || '',
      correctAnswer: correctAnswer
    }
    
    if (editingQuestion.value) {
      await api.put(`/questions/${currentQuestionId.value}`, formData)
      message.success('题目更新成功')
    } else {
      await api.post('/questions', formData)
      message.success('题目创建成功')
    }
    
    resetQuestionForm()
    selectedKeys.value = ['question-list']
    fetchQuestions()
  } catch (error) {
    console.error('提交题目失败', error)
    message.error('提交题目失败: ' + (error.response?.data?.message || '未知错误'))
  }
}

const resetQuestionForm = () => {
  questionForm.title = ''
  questionForm.type = '单选'
  questionForm.difficulty = '中等'
  questionForm.options = ['', '']
  questionForm.correctAnswer = ''
  questionForm.correctAnswers = []
  questionForm.explanation = ''
}

// 竞赛管理相关
const contests = ref([])
const contestPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const contestColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date'
  },
  {
    title: '参与人数',
    dataIndex: 'participantCount',
    key: 'participantCount'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const contestSimpleColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const fetchContests = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/contests?page=${page}&limit=${limit}`)
    contests.value = response.data.contests || []
    
    // 获取每个竞赛的参与人数
    for (const contest of contests.value) {
      try {
        const participantsRes = await api.get(`/contests/${contest.id}/users?limit=1`)
        contest.participantCount = participantsRes.data.totalItems || 0
      } catch (error) {
        console.error(`获取竞赛${contest.id}参与人数失败`, error)
        contest.participantCount = 0
      }
    }
    
    contestPagination.total = response.data.totalItems || 0
    contestPagination.current = response.data.currentPage || 1
  } catch (error) {
    console.error('获取竞赛列表失败', error)
    message.error('获取竞赛列表失败')
  }
}

const handleContestTableChange = (pagination) => {
  fetchContests(pagination.current, pagination.pageSize)
}

// 竞赛表单相关
const contestForm = reactive({
  title: '',
  date: null,
  description: ''
})

const contestRules = {
  title: [{ required: true, message: '请输入竞赛标题', trigger: 'blur' }],
  date: [{ required: true, message: '请选择竞赛日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入竞赛描述', trigger: 'blur' }]
}

const editingContest = ref(false)
const currentContestId = ref(null)

const createNewContest = () => {
  editingContest.value = false
  currentContestId.value = null
  resetContestForm()
  selectedKeys.value = ['create-contest']
}

const editContest = (contest) => {
  editingContest.value = true
  currentContestId.value = contest.id
  
  // 获取竞赛详细信息
  api.get(`/contests/${contest.id}`).then(response => {
    const contestData = response.data.contest
    
    contestForm.title = contestData.title
    contestForm.date = new Date(contestData.date)
    contestForm.description = contestData.description
    
    selectedKeys.value = ['create-contest']
  }).catch(error => {
    console.error('获取竞赛详情失败', error)
    message.error('获取竞赛详情失败')
  })
}

const deleteContest = async (contest) => {
  try {
    await api.delete(`/contests/${contest.id}`)
    message.success('竞赛删除成功')
    fetchContests(contestPagination.current, contestPagination.pageSize)
  } catch (error) {
    console.error('删除竞赛失败', error)
    message.error('删除竞赛失败')
  }
}

const submitContestForm = async () => {
  try {
    const formData = {
      title: contestForm.title,
      date: contestForm.date ? contestForm.date.toISOString().slice(0, 19).replace('T', ' ') : null,
      description: contestForm.description
    }
    
    if (editingContest.value) {
      await api.put(`/contests/${currentContestId.value}`, formData)
      message.success('竞赛更新成功')
    } else {
      await api.post('/contests', formData)
      message.success('竞赛创建成功')
    }
    
    resetContestForm()
    selectedKeys.value = ['contest-list']
    fetchContests()
  } catch (error) {
    console.error('提交竞赛失败', error)
    message.error('提交竞赛失败: ' + error.response?.data?.message || '未知错误')
  }
}

const resetContestForm = () => {
  contestForm.title = ''
  contestForm.date = null
  contestForm.description = ''
}

// 竞赛参与者相关
const selectedContest = ref(null)
const participants = ref([])
const participantPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const participantColumns = [
  {
    title: '用户ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '报名时间',
    dataIndex: 'registeredAt',
    key: 'registeredAt'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const viewContestParticipants = (contest) => {
  selectedContest.value = contest
  fetchParticipants(1, participantPagination.pageSize)
  selectedKeys.value = ['contest-participants']
}

const fetchParticipants = async (page = 1, limit = 20) => {
  if (!selectedContest.value) return
  
  try {
    const response = await api.get(`/contests/${selectedContest.value.id}/users?page=${page}&limit=${limit}`)
    participants.value = response.data.users || []
    participantPagination.total = response.data.totalItems || 0
    participantPagination.current = response.data.currentPage || 1
  } catch (error) {
    console.error('获取参与者列表失败', error)
    message.error('获取参与者列表失败')
  }
}

const handleParticipantTableChange = (pagination) => {
  fetchParticipants(pagination.current, pagination.pageSize)
}

const removeParticipant = async (participant) => {
  if (!selectedContest.value) return
  
  try {
    // 假设有一个API取消用户的竞赛报名
    await api.delete(`/contests/${selectedContest.value.id}/users/${participant.id}`)
    message.success('已移除参与者')
    fetchParticipants(participantPagination.current, participantPagination.pageSize)
  } catch (error) {
    console.error('移除参与者失败', error)
    message.error('移除参与者失败')
  }
}

// 讨论管理相关
const discussions = ref([])
const discussionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const discussionColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '作者',
    dataIndex: 'author_name',
    key: 'author_name'
  },
  {
    title: '标签',
    dataIndex: 'tag',
    key: 'tag'
  },
  {
    title: '评论数',
    dataIndex: 'comment_count',
    key: 'comment_count'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const fetchDiscussions = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/discussions?page=${page}&limit=${limit}`)
    discussions.value = response.data.discussions || []
    discussionPagination.total = response.data.totalItems || 0
    discussionPagination.current = response.data.currentPage || 1
  } catch (error) {
    console.error('获取讨论列表失败', error)
    message.error('获取讨论列表失败')
  }
}

const handleDiscussionTableChange = (pagination) => {
  fetchDiscussions(pagination.current, pagination.pageSize)
}

const viewDiscussionDetails = (discussion) => {
  // 实现查看讨论详情功能
  window.open(`/discuss?id=${discussion.id}`, '_blank')
}

const deleteDiscussion = async (discussion) => {
  try {
    await api.delete(`/discussions/${discussion.id}`)
    message.success('讨论删除成功')
    fetchDiscussions(discussionPagination.current, discussionPagination.pageSize)
  } catch (error) {
    console.error('删除讨论失败', error)
    message.error('删除讨论失败')
  }
}

// 通知管理相关
const notifications = ref([])
const notificationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const notificationColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content'
  },
  {
    title: '发送时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const fetchNotifications = async (page = 1, limit = 10) => {
  try {
    // 假设有一个API获取管理员创建的系统通知
    const response = await api.get(`/admin/notifications?page=${page}&limit=${limit}`)
    notifications.value = response.data.notifications || []
    notificationPagination.total = response.data.totalItems || 0
    notificationPagination.current = response.data.currentPage || 1
  } catch (error) {
    console.error('获取通知列表失败', error)
    message.error('获取通知列表失败')
  }
}

const handleNotificationTableChange = (pagination) => {
  fetchNotifications(pagination.current, pagination.pageSize)
}

const deleteNotification = async (notification) => {
  try {
    await api.delete(`/notifications/${notification.id}`)
    message.success('通知删除成功')
    fetchNotifications(notificationPagination.current, notificationPagination.pageSize)
  } catch (error) {
    console.error('删除通知失败', error)
    message.error('删除通知失败')
  }
}

// 创建通知相关
const notificationModalVisible = ref(false)
const notificationForm = reactive({
  type: '系统',
  content: '',
  target: 'all',
  userId: ''
})

const openCreateNotificationModal = () => {
  notificationModalVisible.value = true
  notificationForm.type = '系统'
  notificationForm.content = ''
  notificationForm.target = 'all'
  notificationForm.userId = ''
}

const submitNotification = async () => {
  try {
    if (!notificationForm.content) {
      message.error('请输入通知内容')
      return
    }
    
    if (notificationForm.target === 'specific' && !notificationForm.userId) {
      message.error('请输入用户ID')
      return
    }
    
    const formData = {
      type: notificationForm.type,
      content: notificationForm.content
    }
    
    if (notificationForm.target === 'specific') {
      formData.userIds = notificationForm.userId.split(',').map(id => id.trim())
    }
    
    // 假设有一个API用于创建系统通知
    await api.post('/admin/notifications', formData)
    
    message.success('通知创建成功')
    notificationModalVisible.value = false
    fetchNotifications()
  } catch (error) {
    console.error('创建通知失败', error)
    message.error('创建通知失败: ' + error.response?.data?.message || '未知错误')
  }
}

// 用户详情相关
const userDetailVisible = ref(false)
const userDetailLoading = ref(false)
const currentUserDetail = ref(null)

// 用户统计相关
const userStats = ref({
  totalUsers: 0,
  newToday: 0,
  newThisWeek: 0,
  newThisMonth: 0,
  registerTrend: [],
  activityData: [],
  roleDist: [],
  accuracyDist: [],
  activityFreq: [],
  mostActiveUsers: []
})

// 图表引用DOM
const userTrendChartRef = ref(null)
const userActivityChartRef = ref(null)
const userRoleChartRef = ref(null)
const accuracyChartRef = ref(null)
const activityFreqChartRef = ref(null)

// 用户答题记录列定义
const userAttemptColumns = [
  {
    title: '题目',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '难度',
    dataIndex: 'difficulty',
    key: 'difficulty'
  },
  {
    title: '答案',
    dataIndex: 'selected_answer',
    key: 'selected_answer'
  },
  {
    title: '结果',
    dataIndex: 'is_correct',
    key: 'is_correct'
  },
  {
    title: '时间',
    dataIndex: 'attempt_time',
    key: 'attempt_time'
  }
]

// 用户讨论列定义
const userDiscussionColumns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '标签',
    dataIndex: 'tag',
    key: 'tag'
  },
  {
    title: '评论数',
    dataIndex: 'comment_count',
    key: 'comment_count'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 用户评论列定义
const userCommentColumns = [
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    customRender: ({ text }) => truncateText(text, 30)
  },
  {
    title: '所属讨论',
    dataIndex: 'discussion_title',
    key: 'discussion_title'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 最活跃用户列定义
const activeUserColumns = [
  {
    title: '用户ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: '答题数',
    dataIndex: 'attempt_count',
    key: 'attempt_count',
    sorter: (a, b) => a.attempt_count - b.attempt_count
  },
  {
    title: '讨论数',
    dataIndex: 'discussion_count',
    key: 'discussion_count',
    sorter: (a, b) => a.discussion_count - b.discussion_count
  },
  {
    title: '评论数',
    dataIndex: 'comment_count',
    key: 'comment_count',
    sorter: (a, b) => a.comment_count - b.comment_count
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 角色编辑相关
const roleEditVisible = ref(false)
const roleEditLoading = ref(false)
const roleForm = reactive({
  userId: null,
  username: '',
  currentRole: '',
  newRole: '',
  reason: ''
})

// 删除用户评论
const deleteUserComment = async (comment) => {
  try {
    await api.delete(`/discussions/comments/${comment.id}`)
    message.success('评论删除成功')
    
    // 从当前用户评论列表中移除
    if (currentUserDetail.value && currentUserDetail.value.comments) {
      currentUserDetail.value.comments = currentUserDetail.value.comments.filter(c => c.id !== comment.id)
    }
  } catch (error) {
    console.error('删除评论失败', error)
    message.error('删除评论失败')
  }
}

// 评论管理相关
const comments = ref([])
const commentFilter = reactive({
  status: 'all',
  keyword: '',
  reportStatus: 'all' // 新增举报状态筛选
})
const commentPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})
const commentDetailVisible = ref(false)
const currentCommentDetail = ref(null)

const commentColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content'
  },
  {
    title: '作者',
    dataIndex: 'author_name',
    key: 'author_name'
  },
  {
    title: '所属讨论',
    dataIndex: 'discussion_title',
    key: 'discussion_title'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const fetchComments = async (page = 1) => {
  try {
    let url = `/admin/comments?page=${page}&limit=${commentPagination.pageSize}`
    
    if (commentFilter.status !== 'all') {
      url += `&status=${commentFilter.status}`
    }
    
    if (commentFilter.keyword) {
      url += `&keyword=${encodeURIComponent(commentFilter.keyword)}`
    }
    
    const response = await api.get(url)
    comments.value = response.data.comments || []
    commentPagination.total = response.data.totalItems || 0
    commentPagination.current = response.data.currentPage || 1
  } catch (error) {
    console.error('获取评论列表失败', error)
    message.error('获取评论列表失败')
  }
}

const handleCommentTableChange = (pagination) => {
  fetchComments(pagination.current)
}

const deleteCommentFromModal = async () => {
  if (!currentCommentDetail.value) return
  
  try {
    await api.delete(`/discussions/comments/${currentCommentDetail.value.id}`)
    message.success('评论删除成功')
    commentDetailVisible.value = false
    fetchComments(commentPagination.current)
  } catch (error) {
    console.error('删除评论失败', error)
    message.error('删除评论失败')
  }
}

// 辅助函数
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 页面监听及相关逻辑
watch(() => selectedKeys, () => {
  if (selectedKeys.value[0] === 'user-stats') {
    fetchUserStats()
  } else if (selectedKeys.value[0] === 'comment-management') {
    fetchComments()
  }
}, { deep: true })

// 查看用户详情
const viewUserDetails = async (user) => {
userDetailVisible.value = true
userDetailLoading.value = true
currentUserDetail.value = null

try {
  // 获取用户详情数据
  const response = await api.get(`/admin/users/${user.id}/detail`)
  
  if (response.data && response.data.user) {
    const userData = response.data.user
    
    // 将API返回的数据结构转换为前端所需的格式
    currentUserDetail.value = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      created_at: userData.created_at,
      last_login: userData.last_login,
      stats: {
        totalAttempts: userData.stats.total_attempts,
        correctAttempts: userData.stats.correct_attempts,
        accuracy: ((userData.stats.correct_attempts / userData.stats.total_attempts) * 100).toFixed(2),
        favoriteCount: userData.stats.favorite_count,
        discussionCount: userData.stats.discussion_count,
        commentCount: userData.stats.comment_count
      },
      recentActivities: userData.recentActivities.map(activity => ({
        type: activity.type,
        description: activity.description,
        time: activity.time
      })),
      studyTimeStats: userData.studyTimeStats.map(stat => ({
        date: stat.date,
        totalTime: stat.total_time
      }))
    }
  } else {
    throw new Error('获取用户详情失败: 数据格式不正确')
  }
} catch (error) {
  console.error('获取用户详情失败', error)
  message.error('获取用户详情失败: ' + (error.response?.data?.message || error.message || '未知错误'))
} finally {
  userDetailLoading.value = false
}
}

// 显示修改角色模态框
const showRoleEditModal = () => {
if (!currentUserDetail.value) return

roleForm.userId = currentUserDetail.value.id
roleForm.username = currentUserDetail.value.username
roleForm.currentRole = currentUserDetail.value.role
roleForm.newRole = currentUserDetail.value.role
roleForm.reason = ''

roleEditVisible.value = true
}

// 提交角色修改
const submitRoleEdit = async () => {
if (!roleForm.reason) {
  message.warning('请填写修改原因')
  return
}

if (roleForm.currentRole === roleForm.newRole) {
  message.info('角色未发生变化')
  roleEditVisible.value = false
  return
}

roleEditLoading.value = true

try {
  await api.put(`/admin/users/${roleForm.userId}/role`, {
    role: roleForm.newRole,
    reason: roleForm.reason
  })
  
  message.success('角色修改成功')
  
  // 更新本地数据
  if (currentUserDetail.value) {
    currentUserDetail.value.role = roleForm.newRole
  }
  
  // 刷新用户列表
  fetchUsers()
  
  roleEditVisible.value = false
} catch (error) {
  console.error('修改角色失败', error)
  message.error('修改角色失败: ' + (error.response?.data?.message || '未知错误'))
} finally {
  roleEditLoading.value = false
}
}

// 删除用户讨论
const deleteUserDiscussion = async (discussion) => {
try {
  await api.delete(`/discussions/${discussion.id}`)
  message.success('讨论删除成功')
  
  // 从当前用户讨论列表中移除
  if (currentUserDetail.value && currentUserDetail.value.discussions) {
    currentUserDetail.value.discussions = currentUserDetail.value.discussions.filter(d => d.id !== discussion.id)
  }
  
  // 刷新讨论列表
  fetchDiscussions()
} catch (error) {
  console.error('删除讨论失败', error)
  message.error('删除讨论失败')
}
}


const resetCommentFilter = () => {
commentFilter.status = 'all'
commentFilter.keyword = ''
fetchComments(1)
}

const viewCommentDetails = async (comment) => {
try {
  // 获取评论详情数据
  const response = await api.get(`/admin/comments/${comment.id}/detail`).catch(() => ({
    data: {
      id: comment.id,
      content: comment.content,
      author_id: comment.author_id,
      author_name: comment.author_name,
      discussion_id: comment.discussion_id,
      discussion_title: comment.discussion_title,
      created_at: comment.created_at,
      reported: comment.reported,
      reports: comment.reported ? [
        {
          reporter_id: 1,
          reporter_name: 'admin',
          report_time: '2024-01-06 18:30:00',
          reason: '包含不适当内容'
        }
      ] : []
    }
  }))
  
  currentCommentDetail.value = response.data
  commentDetailVisible.value = true
} catch (error) {
  console.error('获取评论详情失败', error)
  message.error('获取评论详情失败')
}
}

const navigateToDiscussion = (discussionId) => {
window.open(`/discuss?id=${discussionId}`, '_blank')
}


// 初始化用户统计相关图表
const initUserCharts = () => {
try {
  // 检查数据是否存在
  if (!userStats.value || !userStats.value.registerTrend || !userStats.value.activityData || 
      !userStats.value.roleDist || !userStats.value.accuracyDist || !userStats.value.activityFreq) {
    console.warn('用户统计数据不完整，无法初始化图表')
    return
  }

  // 用户注册趋势图
  const trendChart = document.getElementById('userTrendChart')
  if (trendChart) {
    const chart = echarts.init(trendChart)
    const trendData = userStats.value.registerTrend || []
    chart.setOption({
      title: {
        text: '用户注册趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: trendData.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新注册用户',
          type: 'line',
          data: trendData.map(item => item.count),
          smooth: true,
          areaStyle: {}
        }
      ]
    })
  }
  
  // 用户活跃度分析图
  const activityChart = document.getElementById('userActivityChart')
  if (activityChart) {
    const chart = echarts.init(activityChart)
    const activityData = userStats.value.activityData || []
    chart.setOption({
      title: {
        text: '活跃度分析'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['答题次数', '讨论数', '评论数']
      },
      xAxis: {
        type: 'category',
        data: activityData.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '答题次数',
          type: 'bar',
          data: activityData.map(item => item.attempts)
        },
        {
          name: '讨论数',
          type: 'bar',
          data: activityData.map(item => item.discussions)
        },
        {
          name: '评论数',
          type: 'bar',
          data: activityData.map(item => item.comments)
        }
      ]
    })
  }
  
  // 用户角色分布饼图
  const roleChart = document.getElementById('userRoleChart')
  if (roleChart) {
    const chart = echarts.init(roleChart)
    const roleData = userStats.value.roleDist || []
    chart.setOption({
      title: {
        text: '用户角色分布'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: roleData.map(item => item.name)
      },
      series: [
        {
          name: '角色分布',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: roleData
        }
      ]
    })
  }
  
  // 正确率分布饼图
  const accuracyChart = document.getElementById('accuracyChart')
  if (accuracyChart) {
    const chart = echarts.init(accuracyChart)
    const accuracyData = userStats.value.accuracyDist || []
    chart.setOption({
      title: {
        text: '答题正确率分布'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: accuracyData.map(item => item.name)
      },
      series: [
        {
          name: '正确率分布',
          type: 'pie',
          radius: ['50%', '70%'],
          data: accuracyData,
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
  }
  
  // 用户活跃频次饼图
  const activityFreqChart = document.getElementById('activityFreqChart')
  if (activityFreqChart) {
    const chart = echarts.init(activityFreqChart)
    const freqData = userStats.value.activityFreq || []
    chart.setOption({
      title: {
        text: '用户活跃频次'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: freqData.map(item => item.name)
      },
      series: [
        {
          name: '活跃程度',
          type: 'pie',
          radius: ['50%', '70%'],
          data: freqData,
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
  }
} catch (error) {
  console.error('初始化图表失败', error)
}
}

// 修改 fetchUserStats 函数
const fetchUserStats = async () => {
try {
  const response = await api.get('/admin/user-stats')
  userStats.value = response.data
  
  // 等待DOM更新后初始化图表
  nextTick(() => {
    try {
      initUserCharts()
    } catch (e) {
      console.error('初始化图表失败', e)
    }
  })
} catch (error) {
  console.error('获取用户统计失败', error)
  message.error('获取用户统计数据失败')
}
}

// 监听路由变化，当进入用户统计页面时加载数据
watch(() => selectedKeys.value, (newVal) => {
if (newVal[0] === 'user-stats') {
  fetchUserStats()
}
}, { immediate: true })


// 重写编辑用户角色的函数，显示编辑角色的模态框
const editUserRole = (user) => {
// 先获取用户详情
viewUserDetails(user)

// 用户详情加载完成后显示角色编辑模态框
setTimeout(() => {
  showRoleEditModal()
}, 800)
}

// 添加CDN引入echarts的脚本
onMounted(() => {
// 已有的初始化代码

// 如果页面没有echarts，动态添加echarts脚本
if (!window.echarts) {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'
  script.onload = () => {
    console.log('echarts加载成功')
    if (selectedKeys.value[0] === 'user-stats') {
      fetchUserStats()
    }
  }
  document.head.appendChild(script)
}
})

// 添加举报管理相关的数据
const reportedItems = ref({
comments: [],
discussions: []
})

// 添加举报列表的分页配置
const reportPagination = reactive({
comments: {
  current: 1,
  pageSize: 10,
  total: 0
},
discussions: {
  current: 1,
  pageSize: 10,
  total: 0
}
})

// 获取举报列表
const fetchReports = async () => {
try {
  const [commentReports, discussionReports] = await Promise.all([
    api.get(`/discussions/reports/comments?page=${reportPagination.comments.current}&limit=${reportPagination.comments.pageSize}`),
    api.get(`/discussions/reports/discussions?page=${reportPagination.discussions.current}&limit=${reportPagination.discussions.pageSize}`)
  ])
  
  reportedItems.value.comments = commentReports.data.reports || []
  reportedItems.value.discussions = discussionReports.data.reports || []
  
  reportPagination.comments.total = commentReports.data.pagination?.total || 0
  reportPagination.discussions.total = discussionReports.data.pagination?.total || 0
} catch (error) {
  console.error('获取举报列表失败', error)
  message.error('获取举报列表失败')
}
}

// 处理举报
const handleReport = async (type, id, action) => {
try {
  let url;
  if (action === 'delete') {
    // 删除操作应使用 DELETE 方法
    url = `/${type}/reports/${id}`;
    await api.delete(url);
  } else {
    // 举报操作使用 POST 方法
    url = `/${type}/${id}/report`;
    await api.post(url);
  }
  message.success('处理成功');
  fetchReports(); // 刷新举报列表
} catch (error) {
  console.error('处理举报失败', error);
  message.error('处理举报失败');
}
};

// 更新举报评论的列定义
const reportedCommentColumns = [
{
  title: '举报ID',
  dataIndex: 'id',
  key: 'id'
},
{
  title: '评论ID',
  dataIndex: 'comment_id',
  key: 'comment_id'
},
{
  title: '评论内容',
  dataIndex: 'comment_content',
  key: 'comment_content'
},
{
  title: '评论作者',
  dataIndex: 'comment_author_name',
  key: 'comment_author_name'
},
{
  title: '举报人',
  dataIndex: 'reporter_name',
  key: 'reporter_name'
},
{
  title: '举报原因',
  dataIndex: 'reason',
  key: 'reason'
},
{
  title: '举报时间',
  dataIndex: 'created_at',
  key: 'created_at'
},
{
  title: '操作',
  key: 'action'
}
]

// 更新举报讨论的列定义
const reportedDiscussionColumns = [
{
  title: '举报ID',
  dataIndex: 'id',
  key: 'id'
},
{
  title: '讨论ID',
  dataIndex: 'discussion_id',
  key: 'discussion_id'
},
{
  title: '讨论标题',
  dataIndex: 'discussion_title',
  key: 'discussion_title'
},
{
  title: '讨论作者',
  dataIndex: 'discussion_author_name',
  key: 'discussion_author_name'
},
{
  title: '举报人',
  dataIndex: 'reporter_name',
  key: 'reporter_name'
},
{
  title: '举报原因',
  dataIndex: 'reason',
  key: 'reason'
},
{
  title: '举报时间',
  dataIndex: 'created_at',
  key: 'created_at'
},
{
  title: '操作',
  key: 'action'
}
]

// 处理举报列表分页变化
const handleReportTableChange = (type, pagination) => {
reportPagination[type].current = pagination.current
fetchReports()
}

// 在组件挂载时获取举报数据
onMounted(() => {
// ... existing code ...
if (selectedKeys.value[0] === 'comment-management') {
  fetchReports()
}
})

// 监听标签页切换
watch(() => selectedKeys.value, (newVal) => {
if (newVal[0] === 'comment-management') {
  fetchReports()
}
})
</script>

<style scoped>
.admin-dashboard {
min-height: 100vh;
}

.ant-layout-content {
margin: 24px 16px;
padding: 24px;
background: #fff;
min-height: 280px;
}

.ant-statistic {
margin-bottom: 16px;
}

.ant-card {
margin-bottom: 16px;
}
</style>