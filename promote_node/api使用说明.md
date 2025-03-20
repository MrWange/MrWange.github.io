# 题目促进网站API使用说明

## 基础说明

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT令牌，在需要认证的接口中添加请求头 `Authorization: Bearer 你的令牌`
- **返回格式**: 所有API返回JSON格式数据

## 用户管理相关API

### 1. 用户注册
- **URL**: `/users/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱@example.com",
    "password": "密码"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "注册成功",
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱@example.com"
    }
  }
  ```

### 2. 用户登录
- **URL**: `/users/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "登录成功",
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱@example.com",
      "role": "普通用户"
    },
    "token": "JWT令牌"
  }
  ```

### 3. 获取当前用户信息
- **URL**: `/users/me`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱@example.com",
      "avatar": "头像URL",
      "role": "普通用户",
      "created_at": "创建时间"
    }
  }
  ```

### 4. 更新用户信息
- **URL**: `/users/update`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "username": "新用户名",
    "email": "新邮箱@example.com",
    "avatar": "新头像URL"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "用户信息更新成功",
    "user": {
      "id": 1,
      "username": "新用户名",
      "email": "新邮箱@example.com",
      "avatar": "新头像URL",
      "role": "普通用户"
    }
  }
  ```

### 5. 修改密码
- **URL**: `/users/change-password`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "currentPassword": "当前密码",
    "newPassword": "新密码"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "密码更新成功"
  }
  ```

### 6. 获取所有用户列表 (仅管理员)
- **URL**: `/users/all`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌` (必须是管理员)
- **查询参数**: `?page=1&limit=10`
- **成功响应** (200):
  ```json
  {
    "users": [
      {
        "id": 1,
        "username": "用户名",
        "email": "邮箱@example.com",
        "avatar": "头像URL",
        "role": "普通用户",
        "created_at": "创建时间"
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 7. 获取用户统计数据
- **URL**: `/users/stats`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "stats": {
      "totalAttempts": 50,
      "correctAttempts": 40,
      "accuracy": 80.00,
      "totalFavorites": 15,
      "weeklyStudyTime": 720,
      "difficultyStats": [
        {"difficulty": "简单", "count": 30},
        {"difficulty": "中等", "count": 15},
        {"difficulty": "困难", "count": 5}
      ],
      "recentAttempts": [
        {
          "id": 1,
          "question_id": 1,
          "selected_answer": "A",
          "is_correct": true,
          "attempt_time": "2023-06-15T10:30:00",
          "title": "问题标题",
          "difficulty": "简单",
          "type": "单选"
        }
      ],
      "studyRecords": [
        {"date": "2023-06-10", "study_time": 120},
        {"date": "2023-06-11", "study_time": 90}
      ]
    }
  }
  ```

## 问题管理相关API

### 1. 获取问题列表
- **URL**: `/questions`
- **方法**: GET
- **查询参数**: `?page=1&limit=10&difficulty=简单&type=单选`
- **成功响应** (200):
  ```json
  {
    "questions": [
      {
        "id": 1,
        "title": "问题标题",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "difficulty": "简单",
        "type": "单选",
        "created_at": "创建时间"
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 2. 获取单个问题
- **URL**: `/questions/:id`
- **方法**: GET
- **成功响应** (200):
  ```json
  {
    "question": {
      "id": 1,
      "title": "问题标题",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correct_answer": "A",
      "explanation": "解释",
      "difficulty": "简单",
      "type": "单选",
      "created_at": "创建时间"
    }
  }
  ```

### 3. 创建新问题 (仅管理员)
- **URL**: `/questions`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌` (必须是管理员)
- **请求体**:
  ```json
  {
    "title": "问题标题",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": "A",
    "explanation": "解释",
    "difficulty": "简单",
    "type": "单选"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "问题创建成功",
    "question": {
      "id": 1,
      "title": "问题标题",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correct_answer": "A",
      "explanation": "解释",
      "difficulty": "简单",
      "type": "单选"
    }
  }
  ```

### 4. 更新问题 (仅管理员)
- **URL**: `/questions/:id`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌` (必须是管理员)
- **请求体**:
  ```json
  {
    "title": "新问题标题",
    "options": ["新选项A", "新选项B", "新选项C", "新选项D"],
    "correctAnswer": "B",
    "explanation": "新解释",
    "difficulty": "中等",
    "type": "单选"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "问题更新成功",
    "question": {
      "id": 1,
      "title": "新问题标题",
      "options": ["新选项A", "新选项B", "新选项C", "新选项D"],
      "correct_answer": "B",
      "explanation": "新解释",
      "difficulty": "中等",
      "type": "单选"
    }
  }
  ```

### 5. 删除问题 (仅管理员)
- **URL**: `/questions/:id`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌` (必须是管理员)
- **成功响应** (200):
  ```json
  {
    "message": "问题删除成功"
  }
  ```

### 6. 收藏问题
- **URL**: `/questions/:id/favorite`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "收藏成功"
  }
  ```

### 7. 取消收藏
- **URL**: `/questions/:id/favorite`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "取消收藏成功"
  }
  ```

### 8. 获取用户收藏的问题
- **URL**: `/questions/user/favorites`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **查询参数**: `?page=1&limit=10`
- **成功响应** (200):
  ```json
  {
    "questions": [
      {
        "id": 1,
        "title": "问题标题",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "correct_answer": "A",
        "explanation": "解释",
        "difficulty": "简单",
        "type": "单选",
        "favorited_at": "收藏时间"
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 9. 提交答案
- **URL**: `/questions/:id/submit`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "selectedAnswer": "A"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "答案提交成功",
    "isCorrect": true,
    "correctAnswer": "A",
    "explanation": "解释"
  }
  ```

### 10. 获取用户答题历史
- **URL**: `/questions/user/attempts`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **查询参数**: `?page=1&limit=10`
- **成功响应** (200):
  ```json
  {
    "attempts": [
      {
        "id": 1,
        "question_id": 1,
        "selected_answer": "A",
        "is_correct": true,
        "attempt_time": "答题时间",
        "title": "问题标题",
        "difficulty": "简单",
        "type": "单选"
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

## 讨论相关API

### 1. 获取讨论列表
- **URL**: `/discussions`
- **方法**: GET
- **查询参数**: `?page=1&limit=10&tag=题解`
- **成功响应** (200):
  ```json
  {
    "discussions": [
      {
        "id": 1,
        "title": "讨论标题",
        "content": "讨论内容",
        "author_id": 1,
        "author_name": "作者用户名",
        "author_avatar": "作者头像URL",
        "tag": "题解",
        "created_at": "创建时间",
        "comment_count": 5
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 2. 创建讨论
- **URL**: `/discussions`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "title": "讨论标题",
    "content": "讨论内容",
    "tag": "题解" // 可选值: "题解", "讨论", "分享"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "讨论创建成功",
    "discussion": {
      "id": 1,
      "title": "讨论标题",
      "content": "讨论内容",
      "author_id": 1,
      "tag": "题解"
    }
  }
  ```

### 3. 获取单个讨论
- **URL**: `/discussions/:id`
- **方法**: GET
- **成功响应** (200):
  ```json
  {
    "discussion": {
      "id": 1,
      "title": "讨论标题",
      "content": "讨论内容",
      "author_id": 1,
      "author_name": "作者用户名",
      "author_avatar": "作者头像URL",
      "tag": "题解",
      "created_at": "创建时间"
    },
    "comments": [
      {
        "id": 1,
        "discussion_id": 1,
        "author_id": 2,
        "author_name": "评论者用户名",
        "author_avatar": "评论者头像URL",
        "content": "评论内容",
        "created_at": "评论时间"
      }
    ],
    "pagination": {
      "total": 评论总数,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 4. 更新讨论
- **URL**: `/discussions/:id`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "title": "新讨论标题",
    "content": "新讨论内容",
    "tag": "分享"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "讨论更新成功",
    "discussion": {
      "id": 1,
      "title": "新讨论标题",
      "content": "新讨论内容",
      "author_id": 1,
      "author_name": "作者用户名",
      "author_avatar": "作者头像URL",
      "tag": "分享",
      "created_at": "创建时间"
    }
  }
  ```

### 5. 删除讨论
- **URL**: `/discussions/:id`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "讨论删除成功"
  }
  ```

### 6. 获取用户的讨论列表
- **URL**: `/discussions/user/:userId?`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **查询参数**: `?page=1&limit=10`
- **说明**: 如果不提供userId，则获取当前登录用户的讨论列表
- **成功响应** (200):
  ```json
  {
    "discussions": [
      {
        "id": 1,
        "title": "讨论标题",
        "content": "讨论内容",
        "author_id": 1,
        "author_name": "作者用户名",
        "author_avatar": "作者头像URL",
        "tag": "题解",
        "created_at": "创建时间",
        "comment_count": 5
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 7. 获取讨论的评论列表
- **URL**: `/discussions/:discussionId/comments`
- **方法**: GET
- **查询参数**: `?page=1&limit=20`
- **成功响应** (200):
  ```json
  {
    "comments": [
      {
        "id": 1,
        "discussion_id": 1,
        "author_id": 2,
        "author_name": "评论者用户名",
        "author_avatar": "评论者头像URL",
        "content": "评论内容",
        "created_at": "评论时间"
      }
    ],
    "pagination": {
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页限制,
      "totalPages": 总页数
    }
  }
  ```

### 8. 发表评论
- **URL**: `/discussions/:discussionId/comments`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "content": "评论内容"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "评论发布成功",
    "comment": {
      "id": 1,
      "discussion_id": 1,
      "author_id": 2,
      "author_name": "评论者用户名",
      "author_avatar": "评论者头像URL",
      "content": "评论内容",
      "created_at": "评论时间"
    }
  }
  ```

### 9. 更新评论
- **URL**: `/discussions/comments/:id`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "content": "新评论内容"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "评论更新成功",
    "comment": {
      "id": 1,
      "discussion_id": 1,
      "author_id": 2,
      "author_name": "评论者用户名",
      "author_avatar": "评论者头像URL",
      "content": "新评论内容",
      "created_at": "评论时间"
    }
  }
  ```

### 10. 删除评论
- **URL**: `/discussions/comments/:id`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "评论删除成功"
  }
  ```

### 11. 给讨论点赞
- **URL**: `/discussions/:id/like`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "点赞成功",
    "likesCount": 10
  }
  ```
- **错误响应** (400):
  ```json
  {
    "message": "您已经点赞过该讨论"
  }
  ```

### 12. 取消讨论点赞
- **URL**: `/discussions/:id/like`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "取消点赞成功",
    "likesCount": 9
  }
  ```

### 13. 获取讨论点赞状态
- **URL**: `/discussions/:id/like`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "isLiked": true,
    "likesCount": 10
  }
  ```

## 学习时间记录相关API

### 1. 记录学习时间
- **URL**: `/study/record`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "minutes": 30
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "学习时间记录成功"
  }
  ```

### 2. 获取学习记录
- **URL**: `/study/records`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **查询参数**: `?days=7`
- **成功响应** (200):
  ```json
  {
    "records": [
      {
        "date": "2023-06-10",
        "study_time": 120
      },
      {
        "date": "2023-06-11",
        "study_time": 90
      }
    ]
  }
  ```

### 3. 获取今日学习时间
- **URL**: `/study/today`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "studyTime": 45
  }
  ```

### 4. 获取本周学习时间
- **URL**: `/study/weekly`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "studyTime": 720
  }
  ```

## 使用说明

1. 对于需要认证的API，必须在请求头中添加`Authorization: Bearer JWT令牌`
2. JWT令牌在登录成功后获取，有效期为24小时
3. 分页参数`page`和`limit`可以调整以获取不同数量的结果
4. 问题难度可以是`简单`、`中等`或`困难`
5. 问题类型可以是`单选`、`多选`或`判断`
6. 讨论标签可以是`题解`、`讨论`或`分享`
7. 管理员相关API只有角色为`管理员`的用户才能访问
8. 在使用前请确保数据库已正确初始化（使用 `npm run init-db` 命令）

## 常见错误码说明

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权（令牌无效或已过期）
- 403: 没有权限
- 404: 资源不存在
- 500: 服务器内部错误

## 测试说明

推荐使用Postman或其他API测试工具测试这些接口:

1. 首先注册一个用户
2. 使用注册的用户登录获取令牌
3. 在后续请求中使用该令牌进行认证
4. 测试各种功能接口

## 示例流程

1. 注册用户 → 登录 → 获取令牌
2. 使用令牌查看题目列表 → 答题 → 查看答题历史
3. 收藏题目 → 查看收藏列表 → 取消收藏
4. 创建讨论 → 查看讨论 → 发表评论
5. 管理员创建问题 → 修改问题 → 删除问题
6. 记录学习时间 → 查看学习时间统计 → 查看个人总体统计

## 讨论模块

### 获取讨论列表
- 请求方式：GET
- 接口地址：`/api/discussions`
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为10
  - `tag`: 可选，按标签筛选
- 成功响应：
```json
{
  "success": true,
  "discussions": [
    {
      "id": 1,
      "title": "讨论标题",
      "content": "讨论内容",
      "tag": "question",
      "authorId": 1,
      "username": "用户名",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  ],
  "totalItems": 20,
  "currentPage": 1,
  "totalPages": 2
}
```

### 创建讨论
- 请求方式：POST
- 接口地址：`/api/discussions`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "title": "讨论标题",
  "content": "讨论内容",
  "tag": "question" // 可选值：question, experience, resource
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "讨论创建成功",
  "discussion": {
    "id": 1,
    "title": "讨论标题",
    "content": "讨论内容",
    "tag": "question",
    "authorId": 1,
    "createdAt": "2023-06-01T12:00:00Z",
    "updatedAt": "2023-06-01T12:00:00Z"
  }
}
```

### 获取单个讨论
- 请求方式：GET
- 接口地址：`/api/discussions/:id`
- 成功响应：
```json
{
  "success": true,
  "discussion": {
    "id": 1,
    "title": "讨论标题",
    "content": "讨论内容",
    "tag": "question",
    "authorId": 1,
    "username": "用户名",
    "createdAt": "2023-06-01T12:00:00Z",
    "updatedAt": "2023-06-01T12:00:00Z"
  },
  "comments": [
    {
      "id": 1,
      "content": "评论内容",
      "authorId": 2,
      "username": "评论者",
      "discussionId": 1,
      "createdAt": "2023-06-01T12:30:00Z",
      "updatedAt": "2023-06-01T12:30:00Z"
    }
  ],
  "totalComments": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

### 更新讨论
- 请求方式：PUT
- 接口地址：`/api/discussions/:id`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "title": "更新的标题",
  "content": "更新的内容",
  "tag": "experience"
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "讨论更新成功",
  "discussion": {
    "id": 1,
    "title": "更新的标题",
    "content": "更新的内容",
    "tag": "experience",
    "authorId": 1,
    "createdAt": "2023-06-01T12:00:00Z",
    "updatedAt": "2023-06-01T13:00:00Z"
  }
}
```

### 删除讨论
- 请求方式：DELETE
- 接口地址：`/api/discussions/:id`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "message": "讨论删除成功"
}
```

### 获取用户的讨论列表
- 请求方式：GET
- 接口地址：`/api/discussions/user/:userId?`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为10
- 成功响应：
```json
{
  "success": true,
  "discussions": [
    {
      "id": 1,
      "title": "讨论标题",
      "content": "讨论内容",
      "tag": "question",
      "authorId": 1,
      "username": "用户名",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  ],
  "totalItems": 5,
  "currentPage": 1,
  "totalPages": 1
}
```

### 获取讨论的评论列表
- 请求方式：GET
- 接口地址：`/api/discussions/:discussionId/comments`
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为20
- 成功响应：
```json
{
  "success": true,
  "comments": [
    {
      "id": 1,
      "content": "评论内容",
      "authorId": 2,
      "username": "评论者",
      "discussionId": 1,
      "createdAt": "2023-06-01T12:30:00Z",
      "updatedAt": "2023-06-01T12:30:00Z"
    }
  ],
  "totalItems": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

### 发表评论
- 请求方式：POST
- 接口地址：`/api/discussions/:discussionId/comments`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "content": "评论内容"
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "评论发表成功",
  "comment": {
    "id": 1,
    "content": "评论内容",
    "authorId": 2,
    "username": "评论者",
    "discussionId": 1,
    "createdAt": "2023-06-01T12:30:00Z",
    "updatedAt": "2023-06-01T12:30:00Z"
  }
}
```

### 更新评论
- 请求方式：PUT
- 接口地址：`/api/discussions/comments/:id`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "content": "更新的评论内容"
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "评论更新成功",
  "comment": {
    "id": 1,
    "content": "更新的评论内容",
    "authorId": 2,
    "discussionId": 1,
    "createdAt": "2023-06-01T12:30:00Z",
    "updatedAt": "2023-06-01T13:30:00Z"
  }
}
```

### 删除评论
- 请求方式：DELETE
- 接口地址：`/api/discussions/comments/:id`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "message": "评论删除成功"
}
```

## 竞赛模块

### 获取竞赛列表
- 请求方式：GET
- 接口地址：`/api/contests`
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为10
- 成功响应：
```json
{
  "success": true,
  "contests": [
    {
      "id": 1,
      "title": "竞赛标题",
      "date": "2023-07-15T09:00:00Z",
      "description": "竞赛描述",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  ],
  "totalItems": 5,
  "currentPage": 1,
  "totalPages": 1
}
```

### 获取单个竞赛详情
- 请求方式：GET
- 接口地址：`/api/contests/:id`
- 成功响应：
```json
{
  "success": true,
  "contest": {
    "id": 1,
    "title": "竞赛标题",
    "date": "2023-07-15T09:00:00Z",
    "description": "竞赛描述",
    "createdAt": "2023-06-01T12:00:00Z",
    "updatedAt": "2023-06-01T12:00:00Z"
  }
}
```

### 报名竞赛
- 请求方式：POST
- 接口地址：`/api/contests/:contestId/register`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "message": "竞赛报名成功"
}
```

### 取消报名
- 请求方式：DELETE
- 接口地址：`/api/contests/:contestId/register`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "message": "取消报名成功"
}
```

### 检查报名状态
- 请求方式：GET
- 接口地址：`/api/contests/:contestId/check-registration`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "isRegistered": true
}
```

### 获取用户报名的竞赛
- 请求方式：GET
- 接口地址：`/api/contests/user/registered`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为10
- 成功响应：
```json
{
  "success": true,
  "contests": [
    {
      "id": 1,
      "title": "竞赛标题",
      "date": "2023-07-15T09:00:00Z",
      "description": "竞赛描述",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z",
      "registeredAt": "2023-06-02T10:00:00Z"
    }
  ],
  "totalItems": 2,
  "currentPage": 1,
  "totalPages": 1
}
```

### 创建竞赛（管理员）
- 请求方式：POST
- 接口地址：`/api/contests`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "title": "竞赛标题",
  "date": "2023-07-15T09:00:00Z",
  "description": "竞赛描述"
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "竞赛创建成功",
  "contest": {
    "id": 1,
    "title": "竞赛标题",
    "date": "2023-07-15T09:00:00Z",
    "description": "竞赛描述",
    "createdAt": "2023-06-01T12:00:00Z",
    "updatedAt": "2023-06-01T12:00:00Z"
  }
}
```

### 更新竞赛（管理员）
- 请求方式：PUT
- 接口地址：`/api/contests/:id`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "title": "更新的竞赛标题",
  "date": "2023-07-20T09:00:00Z",
  "description": "更新的竞赛描述"
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "竞赛更新成功",
  "contest": {
    "id": 1,
    "title": "更新的竞赛标题",
    "date": "2023-07-20T09:00:00Z",
    "description": "更新的竞赛描述",
    "createdAt": "2023-06-01T12:00:00Z",
    "updatedAt": "2023-06-02T12:00:00Z"
  }
}
```

### 删除竞赛（管理员）
- 请求方式：DELETE
- 接口地址：`/api/contests/:id`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "message": "竞赛删除成功"
}
```

### 获取竞赛报名用户列表（管理员）
- 请求方式：GET
- 接口地址：`/api/contests/:contestId/users`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为20
- 成功响应：
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "用户名",
      "email": "user@example.com",
      "registeredAt": "2023-06-02T10:00:00Z"
    }
  ],
  "totalItems": 15,
  "currentPage": 1,
  "totalPages": 1
}
```

## 知识点分析相关API

### 获取用户知识点雷达图数据
- 请求方式：GET
- 接口地址：`/api/users/knowledge-radar`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": [
    {
      "category": "数据结构",
      "correctCount": 15,
      "attemptCount": 20,
      "masteryLevel": 75
    },
    {
      "category": "算法",
      "correctCount": 8,
      "attemptCount": 15,
      "masteryLevel": 53
    }
  ]
}
```

### 获取用户学习进度
- 请求方式：GET
- 接口地址：`/api/users/learning-progress`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": {
    "attemptedCount": 50,
    "totalCount": 120,
    "progressPercentage": 42
  }
}
```

### 获取用户弱点知识点
- 请求方式：GET
- 接口地址：`/api/users/weak-points`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `limit`: 返回结果数量限制，默认为5
- 成功响应：
```json
{
  "success": true,
  "data": [
    {
      "category": "网络编程",
      "attempt_count": 10,
      "incorrect_count": 8,
      "error_rate": 80.00
    },
    {
      "category": "动态规划",
      "attempt_count": 12,
      "incorrect_count": 7,
      "error_rate": 58.33
    }
  ]
}
```

### 获取用户近期提升最快的知识点
- 请求方式：GET
- 接口地址：`/api/users/improved-points`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `limit`: 返回结果数量限制，默认为3
- 成功响应：
```json
{
  "success": true,
  "data": [
    {
      "category": "数据结构",
      "recent_attempts": 5,
      "recent_accuracy": 80.00,
      "previous_accuracy": 50.00,
      "improvement": 30
    },
    {
      "category": "算法",
      "recent_attempts": 7,
      "recent_accuracy": 71.43,
      "previous_accuracy": 45.00,
      "improvement": 26
    }
  ]
}
```

### 获取推荐学习的知识点
- 请求方式：GET
- 接口地址：`/api/users/recommended-topics`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `limit`: 返回结果数量限制，默认为5
- 成功响应：
```json
{
  "success": true,
  "data": {
    "type": "weak_points",
    "message": "基于您的弱点知识点推荐",
    "recommendations": [
      {
        "id": 45,
        "title": "网络编程问题",
        "category": "网络编程",
        "difficulty": "简单"
      },
      {
        "id": 68,
        "title": "动态规划基础题",
        "category": "动态规划",
        "difficulty": "中等"
      }
    ]
  }
}
```

### 获取用户全面的知识点分析
- 请求方式：GET
- 接口地址：`/api/users/knowledge-analysis`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": {
    "knowledgeRadar": [
      {
        "category": "数据结构",
        "correctCount": 15,
        "attemptCount": 20,
        "masteryLevel": 75
      }
    ],
    "learningProgress": {
      "attemptedCount": 50,
      "totalCount": 120,
      "progressPercentage": 42
    },
    "weakPoints": [
      {
        "category": "网络编程",
        "attempt_count": 10,
        "incorrect_count": 8,
        "error_rate": 80.00
      }
    ],
    "improvedPoints": [
      {
        "category": "数据结构",
        "recent_attempts": 5,
        "recent_accuracy": 80.00,
        "previous_accuracy": 50.00,
        "improvement": 30
      }
    ],
    "recommendations": {
      "type": "weak_points",
      "message": "基于您的弱点知识点推荐",
      "recommendations": [
        {
          "id": 45,
          "title": "网络编程问题",
          "category": "网络编程",
          "difficulty": "简单"
        }
      ]
    }
  }
}
```

### 获取用户答题趋势数据
- 请求方式：GET
- 接口地址：`/api/users/trend`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `days`: 获取的天数范围，默认为30天
- 成功响应：
```json
{
  "success": true,
  "data": {
    "trendData": [
      {
        "date": "2023-05-01",
        "attemptCount": 10,
        "correctCount": 8,
        "accuracy": 80
      },
      {
        "date": "2023-05-02",
        "attemptCount": 15,
        "correctCount": 12,
        "accuracy": 80
      }
    ],
    "summary": {
      "totalAttempts": 120,
      "totalCorrect": 92,
      "overallAccuracy": 77,
      "activeDays": 18,
      "currentStreak": 5,
      "maxStreak": 7
    }
  }
}
```

## 答题记录相关API

### 记录用户答题
- 请求方式：POST
- 接口地址：`/api/questions/attempt`
- 请求头：
  - `Authorization`: Bearer [token]
- 请求体：
```json
{
  "questionId": 1,
  "selectedAnswer": "A"
}
```
- 成功响应：
```json
{
  "success": true,
  "message": "回答正确！",
  "data": {
    "isCorrect": true,
    "attemptId": 123,
    "correctAnswer": "A",
    "explanation": "解释为什么这个答案是正确的"
  }
}
```

### 获取用户答题历史
- 请求方式：GET
- 接口地址：`/api/questions/attempt/history`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为10
- 成功响应：
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": 123,
        "question_id": 1,
        "title": "什么是数组？",
        "selected_answer": "A",
        "is_correct": true,
        "attempt_time": "2023-06-05T14:30:00Z",
        "difficulty": "简单",
        "type": "单选",
        "category": "数据结构"
      }
    ],
    "totalItems": 25,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

### 获取用户答题统计
- 请求方式：GET
- 接口地址：`/api/questions/attempt/stats`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": {
    "totalAttempts": 100,
    "correctAttempts": 75,
    "accuracy": 75.00,
    "difficultyStats": [
      {
        "difficulty": "简单",
        "count": 40
      },
      {
        "difficulty": "中等",
        "count": 30
      },
      {
        "difficulty": "困难",
        "count": 30
      }
    ],
    "recentAttempts": [
      {
        "id": 123,
        "question_id": 1,
        "title": "什么是数组？",
        "selected_answer": "A",
        "is_correct": true,
        "attempt_time": "2023-06-05T14:30:00Z",
        "difficulty": "简单",
        "type": "单选",
        "category": "数据结构"
      }
    ]
  }
}
```

### 获取用户特定问题的尝试记录
- 请求方式：GET
- 接口地址：`/api/questions/attempt/:questionId`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": 1,
      "question_id": 1,
      "selected_answer": "A",
      "is_correct": true,
      "attempt_time": "2023-06-05T14:30:00Z"
    },
    {
      "id": 124,
      "user_id": 1,
      "question_id": 1,
      "selected_answer": "B",
      "is_correct": false,
      "attempt_time": "2023-06-04T10:15:00Z"
    }
  ]
}
```

### 获取用户今日完成的题目
- 请求方式：GET
- 接口地址：`/api/questions/today-completed`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question_id": 1,
        "title": "什么是数组？",
        "difficulty": "简单",
        "type": "单选",
        "category": "数据结构",
        "is_correct": true,
        "latest_attempt": "2023-06-05T14:30:00Z"
      }
    ],
    "statistics": {
      "totalCompleted": 5,
      "correctCount": 4,
      "accuracy": 80
    }
  }
}
```

### 获取用户打卡信息
- 请求方式：GET
- 接口地址：`/api/questions/streak-info`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": {
    "checkedToday": true,
    "currentStreak": 3,
    "maxStreak": 5,
    "totalDays": 12
  }
}
```

### 获取用户完整学习数据
- 请求方式：GET
- 接口地址：`/api/questions/learning-data`
- 请求头：
  - `Authorization`: Bearer [token]
- 成功响应：
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalAttempts": 100,
      "correctAttempts": 75,
      "accuracy": 75.00,
      "difficultyStats": [
        {
          "difficulty": "简单",
          "count": 40
        }
      ],
      "recentAttempts": [
        {
          "id": 123,
          "question_id": 1,
          "title": "什么是数组？",
          "selected_answer": "A",
          "is_correct": true,
          "attempt_time": "2023-06-05T14:30:00Z",
          "difficulty": "简单",
          "type": "单选",
          "category": "数据结构"
        }
      ]
    },
    "todayCompleted": {
      "questions": [
        {
          "question_id": 1,
          "title": "什么是数组？",
          "difficulty": "简单",
          "type": "单选",
          "category": "数据结构",
          "is_correct": true,
          "latest_attempt": "2023-06-05T14:30:00Z"
        }
      ],
      "statistics": {
        "totalCompleted": 5,
        "correctCount": 4,
        "accuracy": 80
      }
    },
    "streakInfo": {
      "checkedToday": true,
      "currentStreak": 3,
      "maxStreak": 5,
      "totalDays": 12
    }
  }
}
```

### 获取用户活动记录
- 请求方式：GET
- 接口地址：`/api/questions/user/attempts`
- 请求头：
  - `Authorization`: Bearer [token]
- 查询参数：
  - `page`: 页码，默认为1
  - `limit`: 每页条数，默认为10
- 成功响应：
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": 123,
        "question_id": 1,
        "title": "什么是数组？",
        "selected_answer": "A",
        "is_correct": true,
        "attempt_time": "2023-06-05T14:30:00Z",
        "difficulty": "简单",
        "type": "单选",
        "category": "数据结构"
      }
    ],
    "totalItems": 25,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

## 通知相关API

### 1. 获取用户通知列表
- **URL**: `/api/notifications`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **查询参数**: `?page=1&limit=20`
- **成功响应** (200):
  ```json
  {
    "notifications": [
      {
        "id": 1,
        "user_id": 1,
        "content": "用户xxx评论了你的讨论",
        "type": "评论",
        "related_id": 123,
        "is_read": false,
        "created_at": "2023-07-10T08:30:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

### 2. 获取未读通知数量
- **URL**: `/api/notifications/unread-count`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "count": 5
  }
  ```

### 3. 标记通知为已读
- **URL**: `/api/notifications/:id/read`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "通知已标记为已读"
  }
  ```

### 4. 标记所有通知为已读
- **URL**: `/api/notifications/mark-all-read`
- **方法**: PUT
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "所有通知已标记为已读",
    "count": 5
  }
  ```

### 5. 删除单个通知
- **URL**: `/api/notifications/:id`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "通知已删除"
  }
  ```

### 6. 清空所有通知
- **URL**: `/api/notifications`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`
- **成功响应** (200):
  ```json
  {
    "message": "所有通知已清空",
    "count": 15
  }
  ```

### 7. 创建测试通知（仅开发环境）
- **URL**: `/api/notifications/test`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`
- **请求体**:
  ```json
  {
    "content": "这是一条测试通知",
    "type": "系统"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "测试通知创建成功",
    "notification": {
      "id": 1,
      "user_id": 1,
      "content": "这是一条测试通知",
      "type": "系统",
      "related_id": null,
      "is_read": false,
      "created_at": "2023-07-10T08:30:00Z"
    }
  }
  ```

## 管理员API

### 1. 获取所有用户的通知
- **URL**: `/api/admin/notifications`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`（需要管理员权限）
- **查询参数**: `?page=1&limit=10`
- **成功响应** (200):
  ```json
  {
    "notifications": [
      {
        "id": 1,
        "user_id": 5,
        "content": "系统通知: 网站将于下周维护",
        "type": "系统",
        "is_read": false,
        "created_at": "2023-07-10T08:30:00Z",
        "recipient_name": "username1"
      },
      // 更多通知...
    ],
    "totalItems": 25,
    "currentPage": 1,
    "totalPages": 3
  }
  ```

### 2. 创建系统通知
- **URL**: `/api/admin/notifications`
- **方法**: POST
- **请求头**: `Authorization: Bearer JWT令牌`（需要管理员权限）
- **请求体**:
  ```json
  {
    "content": "系统通知: 新功能上线",
    "userId": 3  // 可选，如果提供则只发送给特定用户，否则发送给所有用户
  }
  ```
- **成功响应** (201):
  ```json
  {
    "message": "已向所有用户发送通知",
    "userCount": 50
  }
  ```
  或
  ```json
  {
    "message": "通知发送成功"
  }
  ```

### 3. 删除通知
- **URL**: `/api/admin/notifications/:id`
- **方法**: DELETE
- **请求头**: `Authorization: Bearer JWT令牌`（需要管理员权限）
- **成功响应** (200):
  ```json
  {
    "message": "通知已删除"
  }
  ```

### 4. 获取最近活动
- **URL**: `/api/admin/recent-activities`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`（需要管理员权限）
- **查询参数**: `?limit=10`
- **成功响应** (200):
  ```json
  {
    "activities": [
      {
        "id": 1,
        "userId": 3,
        "username": "user123",
        "type": "登录",
        "description": "用户登录成功",
        "time": "2023-07-10T08:30:00Z"
      },
      // 更多活动...
    ]
  }
  ```

### 5. 获取仪表板统计数据
- **URL**: `/api/admin/dashboard-stats`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`（需要管理员权限）
- **成功响应** (200):
  ```json
  {
    "totalUsers": 120,
    "totalQuestions": 500,
    "totalDiscussions": 350,
    "totalContests": 15,
    "todayActiveUsers": 25,
    "todayNewUsers": 5
  }
  ```

### 6. 获取用户详情
- **URL**: `/api/admin/users/:id/detail`
- **方法**: GET
- **请求头**: `Authorization: Bearer JWT令牌`（需要管理员权限）
- **成功响应** (200):
  ```json
  {
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱@example.com",
      "role": "普通用户",
      "created_at": "2023-07-10T08:30:00Z",
      "last_login": "2023-07-15T14:20:00Z",
      "stats": {
        "total_attempts": 50,
        "correct_attempts": 40,
        "favorite_count": 15,
        "discussion_count": 8,
        "comment_count": 25
      },
      "recentActivities": [
        {
          "type": "登录",
          "description": "用户登录成功",
          "time": "2023-07-15T14:20:00Z"
        }
      ],
      "studyTimeStats": [
        {
          "date": "2023-07-15",
          "total_time": 120
        }
      ]
    }
  }
  ```
