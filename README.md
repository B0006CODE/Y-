# 🏯 凤鸣九霄 - 古风宫廷恋爱 RPG

> *元和三年，春。一场惊天冤案，一位隐姓埋名的将门千金，一段错综复杂的宫廷爱恨...*

一款基于 LLM（大语言模型）驱动的古风宫廷恋爱文字冒险游戏。玩家将扮演前朝名将之女沈晚棠，在危机四伏的后宫中寻找真相、伺机复仇，同时邂逅五位性格迥异的攻略对象。

![游戏截图](./public/bg_main.png)

## ✨ 功能特性

### 🎮 核心玩法
- **LLM 驱动剧情** - 基于大语言模型实时生成剧情，每次游玩都有不同体验
- **自由文字输入** - 无固定选项，您可以输入任何想说的话、想做的事
- **多角色攻略** - 5 位可攻略男主角，每位都有独特性格和专属剧情线

### 📊 游戏系统
- **属性系统** - 好感度、信任、权势、风险四大核心属性，影响剧情走向
- **详细好感度** - 追踪每位男主的独立好感度
- **场景切换** - 动态背景系统，根据剧情自动切换场景
- **CG 图鉴** - 收集解锁 11 张精美 CG
- **章节系统** - 从序章到终章的完整故事线
- **多结局分支** - 10 种不同结局，根据您的选择和属性决定

### 💾 存档功能
- **用户账号** - 本地账号系统，保存您的游戏进度
- **5 个存档槽位** - 多周目体验不同路线
- **完整状态保存** - 保存所有属性、好感度、已解锁 CG

### ⚙️ 自定义配置
- **API 设置** - 支持配置自己的 LLM API（兼容 OpenAI 格式）
- **多模型支持** - 可使用不同的大语言模型

## 🎭 可攻略角色

| 角色 | 身份 | 性格 | 攻略难度 |
|------|------|------|----------|
| **萧煜** | 摄政王 | 冷峻深沉，城府极深 | ⭐⭐⭐⭐⭐ |
| **顾行舟** | 谋士 | 温润如玉，腹黑 | ⭐⭐⭐⭐ |
| **陆无忧** | 护卫 | 寡言忠诚，默默守护 | ⭐⭐⭐ |
| **李景珩** | 太子 | 纯善温柔，优柔寡断 | ⭐⭐⭐ |
| **沈墨寒** | 公子 | 风流不羁，实则深情 | ⭐⭐⭐⭐ |

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 pnpm
- 支持 OpenAI API 格式的 LLM 服务（如阿里云通义千问、OpenAI 等）

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd ancient-love-game

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 配置 API

1. 启动游戏后，点击右上角 ⚙️ 设置按钮
2. 输入您的 API 配置：
   - **API Base URL**: 如 `https://dashscope.aliyuncs.com/compatible-mode/v1`
   - **API Key**: 您的 API 密钥
   - **Model**: 模型名称，如 `qwen-plus`

### 后端服务（账号/云存档/LLM 代理）

> 需要 Node.js 18+，并在 `server/` 目录启动。

后端使用 **MySQL 5.7** 存储账号与云存档（首次启动会自动建表）。

```bash
# 1. 安装依赖
cd server
npm install

# 2. 配置环境变量
copy .env.example .env  # Windows
# 或：cp .env.example .env  # Linux/macOS

# 3. 启动服务
npm run dev
```

前端使用后端服务（根目录创建 `.env.local`）：

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_LLM_BASE_URL=http://localhost:3001/api/v1
```

> 说明：
> - 如果你“不提供大模型 Key”，也可以使用后端代理来解决浏览器 CORS：前端仍需要填写自己的 API Key，但请求会走 `VITE_LLM_BASE_URL`（同域）并由后端把 `Authorization` 透传给上游；上游地址由后端的 `LLM_BASE_URL` 决定。
> - 如果你希望前端直连模型服务（不走后端），请不要设置 `VITE_LLM_BASE_URL`，并确保模型服务允许浏览器跨域请求（CORS）。

### 生产部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署 dist 目录到您的服务器
```

## 📁 项目结构

```
├── public/                 # 静态资源
│   ├── bg_*.png           # 背景图片
│   └── char_*.png         # 角色立绘
├── src/
│   ├── components/        # React 组件
│   │   ├── AuthModal.jsx       # 登录/注册弹窗
│   │   ├── GalleryModal.jsx    # CG 图鉴
│   │   ├── ProfileModal.jsx    # 人物档案
│   │   ├── SaveModal.jsx       # 存档管理
│   │   └── SettingsModal.jsx   # 设置弹窗
│   ├── config/
│   │   └── storyConfig.js      # 故事配置（角色、章节、CG、提示词）
│   ├── services/
│   │   ├── apiSettings.js      # API 配置管理
│   │   ├── authService.js      # 用户认证服务
│   │   ├── endingService.js    # 结局计算服务
│   │   ├── llmService.js       # LLM 调用服务
│   │   └── saveService.js      # 存档服务
│   ├── AncientLoveGame.jsx     # 主游戏组件
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🛠️ 技术栈

- **前端框架**: React 19
- **构建工具**: Vite 7
- **样式方案**: Tailwind CSS
- **图标库**: Lucide React
- **LLM 集成**: 兼容 OpenAI API 格式

## 📖 开发指南

### 添加新角色

编辑 `src/config/storyConfig.js`：

```javascript
// 在 CHARACTERS.protagonists 中添加
newCharacter: {
    name: '角色名',
    title: '称号',
    age: 25,
    personality: '性格描述',
    background: '背景故事',
    speakingStyle: '说话风格',
    avatar: '/char_new.png',
    difficulty: 4
}
```

### 添加新 CG

在 `CGS` 数组中添加：

```javascript
{
    id: 'cg_new_event',
    title: 'CG 标题',
    description: 'CG 描述',
    image: '/cg_new.png',
    unlockCondition: '解锁条件',
    chapter: 'chapter1',
    character: 'roleId'
}
```

### 调整 LLM 行为

修改 `src/config/storyConfig.js` 中的 `SYSTEM_PROMPT` 来调整 AI 的回复风格和游戏规则。

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 5 位可攻略角色
- 11 个 CG 事件
- 5 个章节 + 10 种结局
- 完整的存档系统
- API 自定义配置

## 🙏 致谢

- 游戏概念和剧本创作
- React 和 Vite 社区
- Tailwind CSS 团队
- 所有大语言模型提供商

## 📄 许可证

本项目仅供学习和个人使用。

---

> 🎮 **开始您的宫廷冒险吧！** 点击"开始游戏"，命运的齿轮开始转动...
