# 阿里云（宝塔）完整部署文档（MySQL 5.7 + Nginx + Node）

适用：阿里云 ECS（Alibaba Cloud Linux 3 / CentOS 类）+ 宝塔面板。

项目结构：前端 `Vite/React`（构建后静态 `dist/`）+ 后端 `Node/Express`（账号/云存档）+ **MySQL 5.7**。

LLM Key 策略：**服务器不保存大模型 Key**，用户在前端设置里自己填写 Key；可选启用“后端 LLM 代理”解决浏览器 CORS（后端只透传 `Authorization`，不落库）。

---

## 0. 你需要准备的东西

- 服务器：2C2G 够用（你现在的配置 OK）
- 域名（推荐）：便于开 HTTPS；没有域名也可先用公网 IP
- 宝塔安装完成，能正常访问面板

---

## 1. 宝塔初始化：套件怎么选？

在宝塔的“初始化推荐配置”界面：

- 选 **LNMP（Nginx）**
- 必装：`Nginx`
- MySQL：选择 **MySQL 5.7**
- PHP / phpMyAdmin / FTP：**不需要**（可不装）
- Docker：不需要（除非你计划容器化）

原因：本项目不依赖 PHP/Apache/Java；Nginx 负责静态站点 + 反代后端即可。

---

## 2. 安全组与端口

阿里云安全组“入方向”建议放行：

- `22`（SSH）
- `80`（HTTP）
- `443`（HTTPS，强烈建议）

不要对公网放行：

- `3001`（后端 Node 端口，让 Nginx 本机反代即可）
- `3306`（MySQL 端口，只允许本机访问）

---

## 3. MySQL 5.7：建库建用户（宝塔里操作）

推荐使用这些固定值（与你要求一致：不保留 SQLite，且账号密码由我们约定）：

- 数据库名：`ancient_love_game`
- 用户名：`alg_user`
- 密码：你自己换成强密码（比如 20+ 位随机）

在宝塔的 MySQL 管理里创建数据库与用户后，或直接执行以下 SQL（在宝塔“数据库/SQL”里）：

```sql
CREATE DATABASE IF NOT EXISTS ancient_love_game DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'alg_user'@'127.0.0.1' IDENTIFIED BY 'replace-with-strong-password';
GRANT ALL PRIVILEGES ON ancient_love_game.* TO 'alg_user'@'127.0.0.1';

CREATE USER IF NOT EXISTS 'alg_user'@'localhost' IDENTIFIED BY 'replace-with-strong-password';
GRANT ALL PRIVILEGES ON ancient_love_game.* TO 'alg_user'@'localhost';

FLUSH PRIVILEGES;
```

说明：
- 后端会在首次启动时自动建表（`users`、`saves`），无需手动建表。

---

## 4. 上传项目到服务器

建议部署目录：

- 项目根目录：`/srv/ancient-love-game`
- 前端静态：`/srv/ancient-love-game/dist`
- 后端：`/srv/ancient-love-game/server`

上传方式任选：
- 宝塔“文件”上传（小项目可用）
- `scp` 上传
- `git clone`（如果你有仓库）

---

## 5. 安装 Node.js（18/20 LTS）

在宝塔里安装 Node 的方式有两种：

1) 宝塔软件商店：安装 **Node.js 版本管理器**（推荐）并选择 Node 18 或 20  
2) 命令行安装（你熟悉命令行时用）

验证：

```bash
node -v
npm -v
```

---

## 6. 配置后端（MySQL + JWT + CORS）

进入后端目录并安装依赖：

```bash
cd /srv/ancient-love-game/server
npm install --omit=dev
cp .env.example .env
```

编辑 `server/.env`，至少要改这些：

```ini
PORT=3001
JWT_SECRET=replace-with-strong-secret
CORS_ORIGIN=https://你的域名

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=ancient_love_game
MYSQL_USER=alg_user
MYSQL_PASSWORD=replace-with-strong-password
```

### LLM（不提供 Key）的两种模式

**A) 推荐：走后端 LLM 代理（解决 CORS）**
- 后端：`LLM_BASE_URL` 指向你选定的上游（例如通义千问兼容地址）
- 前端：把“API 地址”填成你自己的代理地址（例如 `https://你的域名/api/v1`），Key 仍由用户填写

`server/.env` 示例：

```ini
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_REQUIRE_AUTH=true
```

**B) 直连上游（不走后端）**
- 不设置 `VITE_LLM_BASE_URL`
- 上游必须允许浏览器跨域（CORS），否则会直接报错

---

## 7. 启动后端（推荐 PM2 或 systemd）

### 方式 1：宝塔 PM2 管理器（推荐）

在宝塔软件商店安装 “PM2 管理器”，新增项目：

- 启动文件：`/srv/ancient-love-game/server/index.js`
- 工作目录：`/srv/ancient-love-game/server`
- 端口：`3001`
- 环境变量：让 PM2 读取 `server/.env`（或在面板里填写同样的变量）

### 方式 2：systemd（命令行）

创建 `/etc/systemd/system/ancient-love-game.service`：

```ini
[Unit]
Description=ancient-love-game server
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/ancient-love-game/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

启动：

```bash
systemctl daemon-reload
systemctl enable --now ancient-love-game
systemctl status ancient-love-game --no-pager
```

健康检查：

```bash
curl -sS http://127.0.0.1:3001/api/health
```

---

## 8. 构建前端并部署到站点目录

### 8.1 生产环境变量（关键）

生产构建建议固定：

- `VITE_API_BASE_URL=/api`（账号/云存档走同域 Nginx 反代）
- `VITE_LLM_BASE_URL=/api/v1`（仅在你启用“后端 LLM 代理”时设置）

推荐做法：在服务器构建时通过环境变量设置。

### 8.2 在服务器构建（简单）

```bash
cd /srv/ancient-love-game
npm install

export VITE_API_BASE_URL=/api
export VITE_LLM_BASE_URL=/api/v1

npm run build
```

构建结果在 `/srv/ancient-love-game/dist`。

也可以本地构建后只上传 `dist/` 到服务器站点目录（更快）。

---

## 9. 宝塔网站：创建站点 + Nginx 反代配置

### 9.1 创建站点

宝塔 “网站” → “添加站点”：

- 域名：填你的域名（没有域名可先填公网 IP 访问，后续再改）
- 根目录：建议设置为 `/srv/ancient-love-game/dist`

### 9.2 Nginx 配置（核心）

在站点的 Nginx 配置里加入/确认以下内容（替换为你的实际路径）：

```nginx
root /srv/ancient-love-game/dist;
index index.html;

location / {
  try_files $uri $uri/ /index.html;
}

location /api/ {
  proxy_pass http://127.0.0.1:3001/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/v1/ {
  proxy_pass http://127.0.0.1:3001/api/v1/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_buffering off;
}
```

说明：
- `try_files ... /index.html` 是 SPA 必需，否则刷新子路由会 404
- `/api/v1/` 只有你启用“后端 LLM 代理”才需要

---

## 10. HTTPS（强烈建议）

宝塔站点 → SSL：

- 有域名：申请 Let’s Encrypt 并开启强制 HTTPS
- 没域名：建议先上域名再做 HTTPS（否则浏览器会对一些能力限制更多）

---

## 11. 最终验证（上线前 5 分钟检查单）

1) 后端健康：

```bash
curl -sS http://127.0.0.1:3001/api/health
```

2) 网站访问：
- 打开 `https://你的域名/` 能看到首页
- 注册/登录正常
- 存档能保存/读取

3) LLM 调用（你不提供 Key）：
- 前端设置里填 Key
- 若启用代理：前端 “API 地址” 填 `https://你的域名/api/v1`（Key 仍由用户填）

4) 安全：
- 安全组未放行 `3001` / `3306`
- `JWT_SECRET` 不是默认值
- 若启用代理：`LLM_REQUIRE_AUTH=true`

---

## 12. 常见问题排查

- 打不开接口/登录失败：检查 Nginx 反代 `/api` 是否指向 `127.0.0.1:3001`，以及后端是否在跑
- 502：后端没启动、端口不对、或后端启动失败（常见是 MySQL 连接失败）
- MySQL 连接失败：确认 `MYSQL_*`、账号权限、MySQL 服务状态、且仅本机访问
- LLM 不工作：
  - 直连上游：多半是 CORS，被浏览器拦
  - 走代理：确认 `LLM_BASE_URL` 指向正确上游，且用户填写的“API 地址”是 `https://你的域名/api/v1`
