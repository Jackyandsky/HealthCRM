# 客户健康与消费管理系统 (USANA 产品)

一个基于Next.js、MongoDB Atlas、shadcn/ui 和 TypeScript 构建的，专注于USANA产品客户健康与消费管理的系统。

## 🚀 功能特性

### 核心模块
-   **仪表盘 (Dashboard)** [cite: 1, 2]
    -   关键指标汇总 (销售额、客户总数、新增客户数) [cite: 1, 2]
    -   预警中心 [cite: 1, 2]
        -   产品余量预警 (例如：余量 < 20% 的前5名客户，按百分比小到大排序) [cite: 1, 2]
        -   定期回访预警 (例如：距离上次回访记录到目前未回访的用户列表，时间跨度大到小排序) [cite: 1, 2]
    -   营销数据洞察 (如图表、趋势线) [cite: 1, 2]
    -   待办事项提醒 (例如：今日需回访客户) [cite: 2]

-   **客户信息管理 (CRM)** [cite: 1, 2]
    -   客户档案 (基本信息、健康状况、联系方式) [cite: 2]
    -   CRUD (创建、读取、更新、删除) [cite: 1, 2]
    -   动态分类与标签管理 (便于筛选与分组) [cite: 1, 2]
    -   客户筛选与排序 (支持多维度，如按预警指标、购买力、活跃度) [cite: 1, 2]
    -   客户 Timeline 视图 [cite: 1, 2]
        -   购买记录时间轴 [cite: 1, 2]
        -   服用计划与调整历史 [cite: 1, 2]
        -   健康反馈与回访记录时间轴 [cite: 1, 2]

-   **商品管理 (USANA 保健品)** [cite: 1, 3]
    -   商品基础信息 (名称、品牌、规格、单价、功效简述) [cite: 1, 3]
    -   商品图片 (支持 URL 引用) [cite: 1, 3]
    -   商品分类管理 [cite: 3]

-   **服用计划 (Plan) 管理** [cite: 1, 4]
    -   计划模板创建与管理 [cite: 1, 4]
        -   针对特定健康目标/症状 (如：贫血改善计划、关节维护计划) [cite: 1, 4]
        -   包含产品组合 (USANA 产品) [cite: 1, 4]
        -   定义各种产品服用频次、剂量、周期 [cite: 1, 4]
    -   客户个性化计划定制与指派 [cite: 4]
        -   基于客户健康状况和需求调整模板 [cite: 4]
    -   计划分享与查阅 [cite: 1, 4]
        -   管理员分享计划给客户 [cite: 1, 4]
        -   客户查看自己的计划详情及预期服用进度 [cite: 1, 4]

-   **购买记录管理** [cite: 1, 5]
    -   记录客户购买的商品/计划 [cite: 1, 5]
    -   关联客户、商品/计划、订单时间、金额 [cite: 1, 5]
    -   支持按时间、客户、产品等多维度查询 [cite: 5]

-   **回访记录管理** [cite: 1, 5]
    -   记录与客户的沟通详情 (文本记录) [cite: 1, 5]
    -   追踪客户产品使用反馈、健康改善情况 [cite: 1, 5]
    -   关联客户与回访时间 [cite: 5]
    -   支持查看客户历史回访列表 [cite: 1, 5]

-   **公开产品展示页** [cite: 1, 5]
    -   USANA 产品列表展示 (对公网用户可见) [cite: 1, 5]
    -   产品分类浏览 [cite: 1, 5]
    -   产品搜索功能 [cite: 1, 5]
    -   (可选) 产品详情页，引导潜在客户联系管理员 [cite: 5]

-   **用户与权限管理** [cite: 1, 6]
    -   角色定义： [cite: 1, 6]
        -   系统管理员 (Super Admin): 最高权限，管理所有数据和用户，可创建其他角色。 [cite: 1, 6]
        -   管理员 (Admin/User): 负责管理名下客户，查看销售数据，制定计划等。 [cite: 1, 6]
        -   客户 (Client): 查看个人信息、购买记录、服用计划、反馈。 [cite: 1, 6]
    -   用户信息管理 (统一用户表，通过角色区分) [cite: 1, 6]
    -   权限细分与控制 (确保数据隔离与安全) [cite: 6]

## 🛠️ 技术栈

-   **集成开发环境 (IDE):** VSCode [cite: 6]
-   **核心框架:** Next.js (基于 React 的生产级框架，内置支持前端路由、后端 API 路由 (Node.js 环境)、服务端渲染 (SSR)、静态站点生成 (SSG)、图片优化等功能) [cite: 6]
-   **UI 组件与样式:** shadcn/ui (构建于 Tailwind CSS 和 Radix UI 之上，提供设计精美、高度可定制、注重可访问性的 UI 组件) [cite: 6]
-   **数据库:** MongoDB Atlas (云端托管的 NoSQL 文档数据库服务) [cite: 6]
-   **后端逻辑:** Next.js API Routes (在与前端相同的项目中使用 Node.js 环境创建和管理后端 API 接口) [cite: 6]
-   **开发工具 (推荐):** ESLint, PostCSS, TypeScript

## 📦 安装与运行

### 环境要求
-   Node.js 18+
-   MongoDB Atlas 数据库 [cite: 6]

### 快速开始

1.  **克隆项目**
    ```bash
    git clone <repository-url>
    cd YourProjectName
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **环境配置**
    复制 `.env.local.example` (如果提供) 或创建 `.env.local` 文件并配置数据库连接：
    ```env
    MONGODB_URI=your-mongodb-atlas-connection-string # 例如: mongodb+srv://<user>:<password>@cluster.mongodb.net/your_db_name
    DB_NAME=your_db_name 
    NEXTAUTH_URL=http://localhost:3000 # (如果使用 NextAuth.js)
    NEXTAUTH_SECRET=your-nextauth-secret-key # (如果使用 NextAuth.js, 生成一个强密钥)
    ```

4.  **数据库初始化 (可选)**
    如果项目包含种子数据脚本 (例如 `scripts/seed.js`):
    ```bash
    npm run seed
    ```

5.  **启动开发服务器**
    ```bash
    npm run dev
    ```

6.  **访问应用**
    打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 👥 用户角色

系统核心用户角色包括：[cite: 1]

| 角色           | 描述                                                                 |
|----------------|----------------------------------------------------------------------|
| 系统管理员     | 最高权限，管理所有数据和用户，可创建其他角色。兼容管理员角色。                 |
| 管理员 (用户)  | 负责管理名下客户，查看销售数据，制定计划等。客户归属管理员或系统管理员。 |
| 客户           | 查看个人信息、购买记录、服用计划、反馈。                                 |

## 📁 项目结构 (示例)

HEALTHCRM/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── api/              # API路由 (后端逻辑) 
│   │   ├── (auth)/           # 认证相关页面 (示例)
│   │   ├── (dashboard)/      # 应用核心页面 (示例)
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 首页
│   ├── components/           # 可复用UI组件 (shadcn/ui 组件等) 
│   │   └── ui/               # shadcn/ui 生成的组件 (根据其推荐方式)
│   ├── lib/                  # 工具库
│   │   ├── mongodb.ts        # MongoDB Atlas 连接 
│   │   └── utils.ts          # 通用工具函数
│   └── models/               # MongoDB 数据模型 (Mongoose Schemas 或接口定义)
│       ├── User.ts           # 用户模型
│       ├── Product.ts        # 商品模型
│       ├── Plan.ts           # 计划模型
│       ├── PurchaseLog.ts    # 购买记录模型
│       ├── FollowUp.ts       # 回访记录模型
│       ├── Tag.ts            # 标签模型
│       └── Category.ts       # 分类模型
├── public/                   # 静态资源
├── scripts/                  # 脚本 (如数据填充 seed.js)
├── .env.local                # 环境变量 (请勿提交到版本库)
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md

## 🗄️ 数据模型 (MongoDB Atlas Schemas 概述)

-   **`users`**: 存储用户账户信息，包括姓名、邮箱、角色（系统管理员、管理员、客户）、关联的管理员ID等。 [cite: 8, 9, 10, 11]
-   **`tags`**: 存储标签信息，用于对用户、商品、计划模板等进行动态分类。 [cite: 11, 12]
-   **`categories`**: 存储分类信息，用于组织商品和计划模板。 [cite: 12, 13, 14]
-   **`products`**: 存储 USANA 商品的详细信息，如名称、品牌、描述、价格、图片URL、分类等。 [cite: 14, 15, 16, 17]
-   **`plan_templates`**: 存储服用计划的模板，包含计划名称、描述、针对症状、产品组合及默认用法。 [cite: 17, 18, 19, 20, 21]
-   **`plans`**: 存储分配给具体客户的个性化服用计划，包括客户ID、管理员ID、计划起止日期、状态、包含的产品及具体用法。 [cite: 21, 22, 23, 24, 25]
-   **`purchase_logs`**: 记录客户的购买历史，包括客户ID、购买日期、购买项目（产品、数量、价格快照）、总金额等。 [cite: 25, 26, 27, 28, 29]
-   **`follow_ups`**: 记录对客户进行的回访信息，包括客户ID、回访日期、沟通详情、客户反馈、管理员备注等。 [cite: 29, 30, 31, 32, 33]

*注：详细的字段定义和索引建议请参考 `description.txt` 中提供的 schema 定义。* [cite: 7]

## 🔐 权限控制 (示例)

| 功能模块         | 系统管理员 | 管理员     | 客户               |
|------------------|------------|------------|--------------------|
| 仪表盘           | ✅          | ✅          | 有限信息/N/A       |
| 客户信息管理     | ✅          | ✅ (名下客户) | 查看/编辑个人资料    |
| 商品管理         | ✅          | ✅ (查看/使用) | (通过公开页查看) |
| 服用计划管理     | ✅          | ✅ (创建/分配) | 查看我的计划 |
| 购买记录管理     | ✅          | ✅ (记录/查看) | 查看我的购买记录 |
| 回访记录管理     | ✅          | ✅ (记录/查看) | 查看/参与反馈 |
| 公开产品展示页   | (内容管理)  | (内容管理)  | ✅ (浏览)   |
| 用户与权限管理   | ✅          | 有限管理    | (管理个人账户)     |

## 🚀 部署

### Vercel 部署 (推荐用于 Next.js)
1.  推送代码到 GitHub/GitLab/Bitbucket。
2.  在 Vercel 上连接您的 Git 仓库。
3.  配置项目设置和环境变量 (如 `MONGODB_URI`, `DB_NAME`, `NEXTAUTH_SECRET` 等)。
4.  Vercel 将自动构建和部署您的应用。

### Docker 部署
1.  **创建 Dockerfile** (示例):
    ```dockerfile
    FROM node:18-alpine AS base
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    CMD ["npm", "start"]
    ```
2.  **构建镜像**
    ```bash
    docker build -t your-app-name .
    ```
3.  **运行容器**
    ```bash
    docker run -p 3000:3000 -e MONGODB_URI="your-mongodb-uri" -e DB_NAME="your_db_name" your-app-name
    ```

## 📚 API 文档 (基于 Next.js API Routes)

项目通过 Next.js API Routes 提供 RESTful API 接口，用于驱动前后端数据交互。 [cite: 6] 主要接口将围绕以下资源展开：

-   **认证接口**: `/api/auth/...` (例如：登录、注册、登出)
-   **用户接口**: `/api/users/...` (例如：CRUD 用户信息)
-   **客户接口**: `/api/customers/...` (或集成在 `/api/users` 中，根据角色区分)
-   **商品接口**: `/api/products/...` (例如：CRUD 商品信息，列表查询)
-   **计划模板接口**: `/api/plan-templates/...` (例如：CRUD 计划模板)
-   **计划接口**: `/api/plans/...` (例如：CRUD 客户计划)
-   **购买记录接口**: `/api/purchase-logs/...` (例如：记录购买，查询记录)
-   **回访记录接口**: `/api/follow-ups/...` (例如：记录回访，查询记录)
-   **分类接口**: `/api/categories/...`
-   **标签接口**: `/api/tags/...`

具体的API端点和请求/响应格式应在开发过程中进一步定义和文档化。

## 🧪 测试

运行测试套件 (如果配置了 Jest, Cypress 等):
```bash
npm test

🤝 贡献指南
Fork 项目
创建特性分支 (git checkout -b feature/AmazingFeature)
提交更改 (git commit -m 'Add some AmazingFeature')
推送到分支 (git push origin feature/AmazingFeature)
打开 Pull Request
📝 更新日志
(在此记录版本变更和重要更新)

v1.0.0 (规划中)
初始版本，包含核心功能模块的实现。
📄 许可证
本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情 (如果项目中包含 LICENSE 文件)。

🙏 致谢
Next.js - React 框架 
shadcn/ui - UI 组件库 
Tailwind CSS - CSS 框架 
Radix UI - 底层 UI 组件库 
MongoDB Atlas - 数据库服务 
USANA (品牌参考) 
📞 支持
如果您有任何问题或建议，请通过以下方式联系我们：

📧 Email: your-support-email@example.com
💬 Issues: (项目 GitHub/GitLab Issues 地址)
📖 文档: (项目详细文档链接，如果适用)
客户健康与消费管理系统 - 助力健康管理与业务增长! ✨