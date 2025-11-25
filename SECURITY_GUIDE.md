# 🔒 項目安全指南 - 敏感信息保護

📅 **創建日期**：2025-01-24  
🎯 **目的**：保護 API 密鑰、參考資料和敏感信息，確保安全上傳 GitHub

---

## ⚠️ 當前安全狀況評估

### ✅ 已保護的內容

1. **API 密鑰存儲** ✅
   - DeepSeek API 密鑰存放在 `.dev.vars` 文件中
   - `.dev.vars` 已在 `.gitignore` 中，**不會上傳到 GitHub**
   - 代碼中使用 `c.env.DEEPSEEK_API_KEY` 讀取，沒有硬編碼

2. **構建輸出和緩存** ✅
   - `dist/` 目錄（構建輸出）已忽略
   - `.wrangler/` 目錄（本地緩存）已忽略
   - `node_modules/` 目錄已忽略

3. **參考文檔** ✅
   - 沒有 `.docx`、`.pdf` 文件被追蹤
   - 您提供的《評分參考範例.docx》和《角色設定.docx》沒有被提交

### ⚠️ 需要處理的安全問題

#### 問題 1：硬編碼的登錄密碼 ⚠️

**位置**：`src/index.tsx` 第 28 行
```typescript
const isValid = password === 'Aileen!2025'  // ⚠️ 硬編碼在源代碼中
```

**風險**：
- 密碼會被上傳到 GitHub（源代碼的一部分）
- 任何人都可以查看源代碼並獲取登錄密碼
- 無法輕鬆修改密碼（需要修改代碼並重新部署）

**解決方案**：將密碼移到環境變量中（見下文）

---

## 🛡️ 安全加固方案

### 方案 A：完全移除登錄密碼（推薦用於演示系統）

**適用場景**：
- 這是內部培訓系統
- 部署在私有沙箱環境
- URL 已經足夠複雜，不易被猜測

**操作**：
1. 移除密碼驗證功能
2. 直接進入主頁
3. 依靠 URL 的複雜性保護系統

**優點**：
- 無需管理密碼
- 用戶體驗更好
- 沒有密碼洩露風險

**缺點**：
- 任何知道 URL 的人都可以訪問

---

### 方案 B：將密碼移到環境變量（推薦用於生產環境）

**適用場景**：
- 需要密碼保護
- 部署到 Cloudflare Pages
- 需要靈活修改密碼

**操作步驟**：

#### 1. 修改 `.dev.vars` 文件

**當前內容**：
```
DEEPSEEK_API_KEY=sk-972ffa8d666d4363a10a09fdb88234a7
```

**修改後**：
```
DEEPSEEK_API_KEY=sk-972ffa8d666d4363a10a09fdb88234a7
LOGIN_PASSWORD=Aileen!2025
```

#### 2. 修改 `src/index.tsx`

**修改前**（第 28 行）：
```typescript
const isValid = password === 'Aileen!2025'
```

**修改後**：
```typescript
const isValid = password === c.env.LOGIN_PASSWORD
```

#### 3. 更新 TypeScript 類型定義

**修改前**（第 10 行）：
```typescript
type Bindings = {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
}
```

**修改後**：
```typescript
type Bindings = {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
  LOGIN_PASSWORD: string;  // 新增
}
```

#### 4. 部署到 Cloudflare Pages 時設置環境變量

```bash
# 開發環境（已在 .dev.vars 中）
# 無需額外操作

# 生產環境（Cloudflare Pages）
npx wrangler pages secret put LOGIN_PASSWORD --project-name webapp
# 輸入密碼：Aileen!2025
```

---

### 方案 C：創建範例配置文件（推薦用於開源項目）

**適用場景**：
- 項目可能開源
- 需要讓其他人能夠部署自己的實例
- 不希望洩露自己的配置

**操作步驟**：

#### 1. 創建 `.dev.vars.example` 文件

```bash
# .dev.vars.example（可以上傳到 GitHub）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
LOGIN_PASSWORD=your_password_here
```

#### 2. 更新 `.gitignore`（已完成）

```
.dev.vars        # 真實的密鑰文件（不上傳）
.env             # 環境變量（不上傳）
```

#### 3. 在 README 中添加配置說明

```markdown
## 🔧 環境配置

1. 複製 `.dev.vars.example` 為 `.dev.vars`
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. 編輯 `.dev.vars`，填入您的實際配置
   ```
   DEEPSEEK_API_KEY=sk-your-actual-key
   LOGIN_PASSWORD=your-actual-password
   ```

3. 啟動開發服務器
   ```bash
   npm run build
   pm2 start ecosystem.config.cjs
   ```
```

---

## 📋 上傳 GitHub 前的檢查清單

在執行 `git push` 之前，請確認：

### ✅ 文件檢查

- [ ] `.dev.vars` 文件在 `.gitignore` 中
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] `dist/` 目錄在 `.gitignore` 中
- [ ] `.wrangler/` 目錄在 `.gitignore` 中
- [ ] 沒有 `.docx` 或 `.pdf` 參考文檔被追蹤

### ✅ 代碼檢查

- [ ] 沒有硬編碼的 API 密鑰（`sk-*****`）
- [ ] 沒有硬編碼的密碼（如果採用方案 B）
- [ ] 沒有敏感的個人信息
- [ ] 沒有客戶數據或真實對話記錄

### ✅ 驗證命令

```bash
# 檢查哪些文件會被上傳
git status

# 檢查 .gitignore 是否生效
git ls-files | grep -E "\.env|\.dev\.vars|dist/|\.wrangler/"
# 應該沒有任何輸出

# 檢查是否有硬編碼的密鑰
grep -r "sk-" src/ public/ --include="*.ts" --include="*.tsx" --include="*.js"
# 應該只顯示註釋或 c.env.DEEPSEEK_API_KEY

# 檢查待提交的文件
git diff --cached --name-only
```

---

## 🚨 如果不小心上傳了敏感信息

### 情況 A：剛剛提交，還沒有 push

```bash
# 撤銷最後一次提交（保留修改）
git reset --soft HEAD~1

# 修改問題後重新提交
git add .
git commit -m "Fix: Remove sensitive information"
```

### 情況 B：已經 push 到 GitHub

⚠️ **非常重要**：一旦 push 到 GitHub，即使刪除提交，密鑰仍然存在於 Git 歷史中！

**必須操作**：

1. **立即更換 API 密鑰**
   - 登錄 DeepSeek 控制台
   - 刪除舊密鑰
   - 生成新密鑰
   - 更新 `.dev.vars` 和 Cloudflare Pages 環境變量

2. **修改登錄密碼**
   - 更新 `.dev.vars` 中的 `LOGIN_PASSWORD`
   - 或移除密碼驗證（方案 A）

3. **清理 Git 歷史（高級操作）**
   ```bash
   # 使用 git filter-branch 或 BFG Repo-Cleaner
   # 注意：這會重寫整個 Git 歷史，需要謹慎操作
   ```

---

## 🔐 密鑰管理最佳實踐

### 開發環境
- ✅ 使用 `.dev.vars` 文件
- ✅ 添加到 `.gitignore`
- ✅ 定期更換密鑰

### 生產環境
- ✅ 使用 Cloudflare Pages Secrets
- ✅ 通過 `wrangler pages secret put` 設置
- ✅ 絕不在代碼中硬編碼

### 團隊協作
- ✅ 提供 `.dev.vars.example` 範例文件
- ✅ 在 README 中說明配置方法
- ✅ 每個開發者使用自己的密鑰

---

## 📂 當前 .gitignore 配置

```gitignore
# Dependencies
node_modules/

# Build output
dist/
.wrangler/

# Environment variables（✅ 已保護）
.env
.dev.vars

# Runtime data
*.log
*.pid

# PM2
.pm2/
pids/
logs/

# Backup files
*.backup
*.bak
*.tar.gz
*.zip

# OS
.DS_Store
```

---

## 🎯 推薦的安全配置流程

### 對於您的項目（內部培訓系統）

我建議採用 **方案 B**（環境變量 + 範例文件）：

1. ✅ 創建 `.dev.vars.example` 範例文件（可上傳）
2. ✅ 將密碼移到 `.dev.vars` 環境變量（已保護）
3. ✅ 修改代碼使用環境變量讀取密碼
4. ✅ 在 README 中說明配置方法
5. ✅ 驗證 `.dev.vars` 在 `.gitignore` 中

**這樣做的好處**：
- ✅ 您的真實密鑰和密碼不會上傳到 GitHub
- ✅ 其他人可以部署自己的實例（使用自己的密鑰）
- ✅ 可以靈活修改密碼，無需修改代碼
- ✅ 符合安全最佳實踐

---

## 📞 需要我幫您實施嗎？

我可以立即為您：

1. **創建 `.dev.vars.example` 範例文件**
2. **修改 `src/index.tsx` 使用環境變量讀取密碼**
3. **更新 README 添加配置說明**
4. **驗證沒有敏感信息會被上傳**
5. **提交安全加固的版本**

請告訴我您希望採用哪個方案，我會立即幫您實施！🔒

---

**重要提醒**：
- ✅ `.dev.vars` 已在 `.gitignore` 中，您的 DeepSeek API 密鑰是安全的
- ⚠️ 登錄密碼 `Aileen!2025` 當前硬編碼在源代碼中，建議移到環境變量
- ✅ 沒有參考文檔（.docx）被追蹤，您的參考資料是安全的

如果您準備上傳到 GitHub，請先告訴我，我會幫您完成安全加固！🛡️
