# Health CRM - 医疗客户关系管理系统

一个现代化的医疗保健CRM系统，基于Next.js 14、MongoDB和TypeScript构建。

## 🚀 功能特性

### 核心功能
- **患者管理** - 完整的患者信息档案管理
- **预约调度** - 智能预约系统和日程管理
- **医疗记录** - 电子病历和诊疗记录
- **账单管理** - 自动化计费和保险处理
- **数据分析** - 实时报表和业务洞察
- **多角色权限** - 管理员、医生、护士、前台等角色

### 技术特性
- **现代化UI** - 基于Tailwind CSS的响应式设计
- **类型安全** - 完整的TypeScript类型定义
- **安全认证** - JWT令牌认证和角色权限控制
- **数据库优化** - MongoDB聚合查询和索引优化
- **RESTful API** - 标准化的API接口设计

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, Heroicons
- **后端**: Next.js API Routes
- **数据库**: MongoDB with Mongoose
- **认证**: JWT + bcryptjs
- **开发工具**: ESLint, PostCSS

## 📦 安装与运行

### 环境要求
- Node.js 18+
- MongoDB 数据库

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd HealthCRM
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
复制 `.env.local` 文件并配置数据库连接：
```env
MONGODB_URI=mongodb+srv://iptable:Jacky789@cluster0.2n8ys.mongodb.net/?retryWrites=true&w=majority
DB_NAME=health_crm
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. **数据库初始化**
```bash
npm run seed
```

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 👥 测试账户

系统预设了以下测试账户：

| 角色 | 邮箱 | 密码 | 权限 |
|------|------|------|------|
| 管理员 | admin@healthcrm.com | admin123 | 所有功能 |
| 医生 | dr.johnson@healthcrm.com | doctor123 | 患者、预约、病历 |
| 护士 | nurse.wong@healthcrm.com | nurse123 | 患者、预约 |
| 前台 | receptionist@healthcrm.com | reception123 | 患者、预约、账单 |

## 📁 项目结构

```
HealthCRM/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API路由
│   │   ├── auth/              # 认证页面
│   │   ├── dashboard/         # 仪表板页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # 可复用组件
│   ├── lib/                   # 工具库
│   │   ├── mongodb.ts         # 数据库连接
│   │   ├── auth.ts            # 认证工具
│   │   └── types.ts           # TypeScript类型
│   └── models/                # Mongoose模型
│       ├── User.ts
│       ├── Patient.ts
│       ├── Appointment.ts
│       ├── MedicalRecord.ts
│       └── Billing.ts
├── scripts/
│   └── seed.js                # 数据填充脚本
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🗄️ 数据模型

### 用户 (Users)
- 多角色权限管理
- 部门分组
- 活跃状态控制

### 患者 (Patients)
- 完整个人信息
- 医疗史和过敏史
- 保险信息
- 紧急联系人

### 预约 (Appointments)
- 医生和患者关联
- 时间冲突检测
- 预约状态管理
- 重复预约支持

### 医疗记录 (Medical Records)
- 生命体征记录
- 诊断和治疗方案
- 检验结果
- 随访计划

### 账单 (Billing)
- 服务项目计费
- 保险理赔处理
- 付款状态跟踪
- 发票生成

## 🔐 权限控制

| 功能模块 | 管理员 | 医生 | 护士 | 前台 |
|----------|--------|------|------|------|
| 患者管理 | ✅ | ✅ | ✅ | ✅ |
| 预约管理 | ✅ | ✅ | ✅ | ✅ |
| 医疗记录 | ✅ | ✅ | ✅ | ❌ |
| 账单管理 | ✅ | ❌ | ❌ | ✅ |
| 数据分析 | ✅ | ✅ | ❌ | ❌ |
| 系统设置 | ✅ | ❌ | ❌ | ❌ |

## 🚀 部署

### Vercel 部署
1. 推送代码到GitHub
2. 连接Vercel账户
3. 配置环境变量
4. 自动部署

### Docker 部署
```bash
# 构建镜像
docker build -t health-crm .

# 运行容器
docker run -p 3000:3000 health-crm
```

## 📚 API 文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### 患者接口
- `GET /api/patients` - 获取患者列表
- `POST /api/patients` - 创建患者
- `GET /api/patients/[id]` - 获取患者详情
- `PUT /api/patients/[id]` - 更新患者信息
- `DELETE /api/patients/[id]` - 删除患者

### 预约接口
- `GET /api/appointments` - 获取预约列表
- `POST /api/appointments` - 创建预约
- `GET /api/appointments/[id]` - 获取预约详情
- `PUT /api/appointments/[id]` - 更新预约
- `DELETE /api/appointments/[id]` - 取消预约

### 医疗记录接口
- `GET /api/medical-records` - 获取病历列表
- `POST /api/medical-records` - 创建病历
- `GET /api/medical-records/[id]` - 获取病历详情
- `PUT /api/medical-records/[id]` - 更新病历

### 账单接口
- `GET /api/billing` - 获取账单列表
- `POST /api/billing` - 创建账单
- `GET /api/billing/[id]` - 获取账单详情
- `PUT /api/billing/[id]` - 更新账单状态

## 🧪 测试

运行测试套件：
```bash
npm test
```

运行端到端测试：
```bash
npm run test:e2e
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础CRUD功能
- 用户认证系统
- 角色权限控制

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [MongoDB](https://www.mongodb.com/) - 数据库
- [Heroicons](https://heroicons.com/) - 图标库

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系我们：

- 📧 Email: support@healthcrm.com
- 💬 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档: [项目文档](https://docs.healthcrm.com)

---

**Health CRM** - 让医疗管理更简单、更高效! 🏥✨
