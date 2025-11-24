import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCustomerRolePrompt } from './customerRolesData'

// Type definitions
type Bindings = {
  DB: D1Database
  DEEPSEEK_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all API routes
app.use('/api/*', cors())

// ========================================
// 數據定義
// ========================================

// 8 個身體部位（含專業信息）
const bodyParts = [
  { 
    id: 'neck', 
    name: '頸部', 
    icon: '🦴',
    conditions: ['頸椎病', '落枕', '頸部僵硬'],
    muscles: ['胸鎖乳突肌', '斜方肌', '頸夾肌'],
    acupoints: ['風池穴', '大椎穴', '天柱穴']
  },
  { 
    id: 'shoulder', 
    name: '肩部', 
    icon: '💪',
    conditions: ['肩周炎', '肩頸痛', '五十肩'],
    muscles: ['三角肌', '岡上肌', '肩胛提肌'],
    acupoints: ['肩井穴', '肩髃穴', '曲池穴']
  },
  { 
    id: 'upper-back', 
    name: '上背', 
    icon: '🔺',
    conditions: ['上背痛', '駝背', '肩胛骨痛'],
    muscles: ['菱形肌', '豎脊肌', '背闊肌'],
    acupoints: ['膏肓穴', '大杼穴', '心俞穴']
  },
  { 
    id: 'lower-back', 
    name: '下背', 
    icon: '🔻',
    conditions: ['腰痛', '腰肌勞損', '椎間盤突出'],
    muscles: ['腰方肌', '豎脊肌', '多裂肌'],
    acupoints: ['腎俞穴', '命門穴', '腰陽關穴']
  },
  { 
    id: 'knee', 
    name: '膝關節', 
    icon: '🦵',
    conditions: ['膝關節炎', '髕骨軟化', '半月板損傷'],
    muscles: ['股四頭肌', '膕繩肌', '小腿三頭肌'],
    acupoints: ['犢鼻穴', '陽陵泉穴', '陰陵泉穴']
  },
  { 
    id: 'wrist', 
    name: '手腕', 
    icon: '✋',
    conditions: ['腕管綜合症', '手腕扭傷', '媽媽手'],
    muscles: ['橈側腕屈肌', '尺側腕屈肌', '伸腕肌群'],
    acupoints: ['陽池穴', '大陵穴', '神門穴']
  },
  { 
    id: 'ankle', 
    name: '腳底和腳踋附近', 
    icon: '🦶',
    conditions: ['足底筋膜炎', '足跟痛', '扁平足'],
    muscles: ['腓腸肌', '比目魚肌', '足底筋膜'],
    acupoints: ['太溪穴', '崑崙穴', '湧泉穴']
  },
  { 
    id: 'elbow', 
    name: '手肘外側', 
    icon: '💪',
    conditions: ['網球肘', '高爾夫球肘', '肘關節炎'],
    muscles: ['肱二頭肌', '肱三頭肌', '前臂伸肌群'],
    acupoints: ['曲池穴', '手三里穴', '少海穴']
  }
]

// 16 個顧客角色
const customerRoles = [
  { id: 'programmer-zhang', name: 'IT程式員 張先生', age: 28, occupation: 'IT程式員', profile: '長期久坐，頸肩痛' },
  { id: 'office-li', name: '辦公室職員 李小姐', age: 32, occupation: '行政助理', profile: '久坐辦公，下背不適' },
  { id: 'teacher-wang', name: '教師 王老師', age: 45, occupation: '中學教師', profile: '長時間站立授課，腰背疼痛' },
  { id: 'nurse-chen', name: '護士 陳小姐', age: 29, occupation: '註冊護士', profile: '輪班工作，肩頸緊張' },
  { id: 'driver-huang', name: '司機 黃先生', age: 50, occupation: '貨車司機', profile: '長途駕駛，腰椎問題' },
  { id: 'sales-lin', name: '銷售員 林小姐', age: 26, occupation: '零售銷售', profile: '長時間站立，足底筋膜炎' },
  { id: 'chef-wu', name: '廚師 吳師傅', age: 38, occupation: '中餐廚師', profile: '高強度工作，手腕勞損' },
  { id: 'accountant-xu', name: '會計師 徐先生', age: 42, occupation: '執業會計師', profile: '長期伏案，頸椎病' },
  { id: 'designer-zhao', name: '設計師 趙小姐', age: 30, occupation: '平面設計師', profile: '電腦作業，手臂酸痛' },
  { id: 'worker-sun', name: '工人 孫師傅', age: 55, occupation: '建築工人', profile: '體力勞動，關節退化' },
  { id: 'manager-ma', name: '經理 馬先生', age: 40, occupation: '項目經理', profile: '工作壓力大，肩頸僵硬' },
  { id: 'musician-zhou', name: '音樂教師 周老師', age: 35, occupation: '鋼琴教師', profile: '長時間彈奏，手腕疼痛' },
  { id: 'athlete-zheng', name: '退役運動員 鄭先生', age: 33, occupation: '健身教練', profile: '運動損傷，膝蓋不適' },
  { id: 'writer-qian', name: '作家 錢小姐', age: 37, occupation: '自由撰稿人', profile: '久坐寫作，腰背痛' },
  { id: 'dentist-shen', name: '牙醫 沈醫生', age: 44, occupation: '牙科醫生', profile: '特殊姿勢工作，頸肩不適' },
  { id: 'hairdresser-han', name: '髮型師 韓小姐', age: 27, occupation: '髮型設計師', profile: '長時間站立，腳踝痠痛' }
]

// ========================================
// API 路由
// ========================================

// 密碼驗證
app.post('/api/verify-password', async (c) => {
  const { password } = await c.req.json()
  const isValid = password === 'Aileen!2025'
  
  console.log(`[Auth] Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`)
  
  return c.json({ 
    valid: isValid,
    message: isValid ? '驗證成功' : '密碼錯誤'
  })
})

// 獲取身體部位列表
app.get('/api/body-parts', (c) => {
  console.log('[Data] Fetching body parts list')
  return c.json({ bodyParts })
})

// 獲取顧客角色列表
app.get('/api/customer-roles', (c) => {
  console.log('[Data] Fetching customer roles list')
  return c.json({ customerRoles })
})

// AI 對話引擎
app.post('/api/chat', async (c) => {
  try {
    const { messages, bodyPart, role } = await c.req.json()
    const apiKey = c.env.DEEPSEEK_API_KEY

    console.log(`[Chat] New message (bodyPart: ${bodyPart}, role: ${role})`)

    // ✅ 使用完整的角色設定 Prompt（來自角色設定.docx）
    const systemPrompt = getCustomerRolePrompt(role, bodyPart)

    // 調用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const aiMessage = data.choices[0].message.content

    console.log(`[Chat] AI response generated (length: ${aiMessage.length})`)

    return c.json({ message: aiMessage })
  } catch (error) {
    console.error('[Chat] Error:', error)
    return c.json({ 
      error: '對話系統暫時無法使用，請稍後再試',
      message: '不好意思，我現在有點忙，可以等一下再聊嗎？'
    }, 500)
  }
})

// 智能評分系統
app.post('/api/score', async (c) => {
  try {
    const { conversation, bodyPart, role } = await c.req.json()
    const apiKey = c.env.DEEPSEEK_API_KEY

    // 計算實際對話輪次（只計算治療師的發言）
    // 注意：前端會自動發送AI客戶的第一條開場白（role='assistant'），需要排除
    // 真正的對話應該從用戶（治療師）的第一句話開始計算
    const userMessages = conversation.filter((msg: any) => msg.role === 'user')
    const conversationRounds = userMessages.length

    console.log(`[Score] Scoring request (rounds: ${conversationRounds}, bodyPart: ${bodyPart}, role: ${role})`)
    console.log(`[Score] Conversation details: total messages=${conversation.length}, user messages=${userMessages.length}`)

    // ✅ 前置驗證：如果對話為空或治療師沒有任何輸入，直接返回最低分
    if (conversationRounds === 0 || conversation.length === 0) {
      console.log('[Score] Empty conversation detected - returning minimum scores')
      return c.json({
        scores: {
          communication: 1,
          questioning: 1,
          explanation: 1,
          objection: 1
        },
        strengths: [],
        improvements: ['未進行任何對話', '請開始與顧客互動', '建議先了解顧客的痛症情況'],
        detailedFeedback: '本次練習未進行任何對話。建議您主動與顧客打招呼，詢問痛症情況，展示專業的溝通能力。每次練習至少應進行 3-5 輪完整對話，才能有效評估您的專業表現。'
      })
    }

    // ✅ 檢查對話是否過於簡短（少於 2 輪）
    if (conversationRounds < 2) {
      console.log('[Score] Too few conversation rounds - returning low scores')
      return c.json({
        scores: {
          communication: 3,
          questioning: 2,
          explanation: 1,
          objection: 1
        },
        strengths: ['已嘗試開始對話'],
        improvements: ['對話輪次不足，無法全面評估', '建議進行至少 3-5 輪對話', '需要更深入了解顧客需求'],
        detailedFeedback: '本次練習對話輪次過少（僅 ${conversationRounds} 輪），無法完整展示您的專業能力。建議您進行更完整的對話流程：1) 主動問候與建立信任，2) 詳細詢問痛症情況，3) 介紹治療方案，4) 處理顧客疑慮。建議每次練習進行 3-5 輪完整對話。'
      })
    }

    // 🎯 ACADEMI 專業評分標準 Prompt（整合《評分參考範例.docx》完整案例）
    const scoringPrompt = `你是 ACADEMI 痛症治療師培訓的資深評分專家。請根據以下對話記錄，**嚴格、客觀**地評估治療師的表現。

**評分對話**（共 ${conversationRounds} 輪）：
${conversation.map((msg: any) => `${msg.role === 'assistant' ? '治療師' : '顧客'}: ${msg.content}`).join('\n')}

---

## 📖 標準對話流程（8輪理想架構）

ACADEMI 標準流程分為以下階段：
1. **第1-2輪：開放式提問** - 了解問題背景、持續時間、基本情況
2. **第3-4輪：指向性提問** - 深入挖掘影響（工作效率、生活品質、人際關係）
3. **第5-6輪：創造急迫性 + 方案介紹** - 強調拖延成本，介紹解決方案
4. **第7輪：FFF方法處理異議** - Feel（同理）→ Felt（共鳴）→ Found（解決）
5. **第8輪：轉介健康顧問** - 自然引導至下一步（時間安排、進一步諮詢）

---

## 📊 評分標準（總分 80 分，每項 1-20 分）

### 1. **溝通能力 (1-20分)**
   - 禮貌、同理心、積極聆聽
   - 語氣友善、建立信任
   - 回應及時、清晰
   - **評分標準**：1-5分=態度冷淡/無禮，6-10分=基本禮貌，11-15分=良好溝通，16-20分=卓越同理心

### 2. **提問技巧 (1-20分)**
   - 開放式問題（「怎麼樣？」「什麼時候開始？」）
   - 針對性問題（痛症位置、強度、頻率）
   - 了解需求和期望
   - **評分標準**：1-5分=沒有提問，6-10分=基本提問，11-15分=針對性提問，16-20分=專業深入

### 3. **方案解釋 (1-20分)**
   - 清晰介紹治療方案
   - 強調改善生活質量的價值
   - 避免醫學術語，用顧客能理解的語言
   - **評分標準**：1-5分=沒有解釋，6-10分=簡單說明，11-15分=清晰解釋，16-20分=專業且易懂

### 4. **異議處理 (1-20分)**
   - 使用 FFF 法：Feel（同理）→ Felt（共鳴）→ Found（解決）
   - 正面回應顧客疑慮
   - 提供案例或證據
   - **評分標準**：1-5分=迴避異議，6-10分=基本回應，11-15分=有效處理，16-20分=完美化解

---

## 📚 專業評分參考案例（來自《評分參考範例.docx》）

### **案例 1：IT程式員張先生（頸椎+手腕痛）- 優秀表現（總分 72/80）**
**對話特點**（8輪完整對話）：
- 開放式提問自然獲取客戶完整信息（第1-2輪）
- 指向性提問層層深入，挖掘工作效率、睡眠、感情關係影響（第3-4輪）
- 創造急迫性並自然介紹方案（第5-6輪）
- FFF方法流暢處理時間異議（第7輪）
- 自然轉介健康顧問（第8輪）

**評分結果**：溝通能力18分，提問技巧19分，方案解釋17分，異議處理18分
**優點**：開放式提問運用出色、指向性提問層層深入、FFF方法運用流暢、完全遵守合規要求
**合規性**：✅ 完全合規（無醫學證據、無價格討論、無醫療效果宣稱）

---

### **案例 2：護士陳小姐（腰背痛）- 良好表現（總分 68/80）**
**對話特點**（8輪完整對話）：
- 針對醫護專業人士調整溝通方式，展現對職業特性的理解
- 成功挖掘職業安全風險（操作失誤、患者照護品質）
- FFF方法巧妙處理「已了解相關知識」的專業異議
- 理解輪班制時間限制，提供彈性解決方案

**評分結果**：溝通能力17分，提問技巧18分，方案解釋16分，異議處理17分
**優點**：理解職業特性、成功挖掘職業安全風險、巧妙處理專業人士異議
**合規性**：✅ 完全合規

---

### **案例 3：家庭主婦林太太（膝蓋痛）- 優秀表現（總分 72/80）**
**對話特點**（8輪完整對話）：
- 同理心表達出色，理解家庭主婦「為家人著想」的心理
- 巧妙將問題與照顧家庭能力掛鉤，創造強烈動機
- FFF方法將「花錢」轉化為「對家庭最好的投資」
- 語氣溫和親切，符合目標客群的溝通偏好

**評分結果**：溝通能力19分，提問技巧17分，方案解釋18分，異議處理18分
**優點**：同理心出色、將問題與家庭能力掛鉤、FFF方法巧妙轉化經濟異議
**合規性**：✅ 完全合規

---

### **案例 4：金融經紀黃先生（肩頸痛+頭痛）- 優秀表現（總分 74/80）**
**對話特點**（8輪完整對話）：
- 語言風格完美匹配金融業客戶（投資、回報、效率）
- 精準抓住金融業核心痛點：判斷力、專業形象、職業生涯
- FFF方法將時間成本轉化為投資回報概念，極具說服力
- 節奏掌控出色，符合高效人士的溝通偏好

**評分結果**：溝通能力18分，提問技巧19分，方案解釋18分，異議處理19分
**優點**：語言風格匹配客群、精準抓住核心痛點、FFF方法說服力強
**合規性**：✅ 完全合規

---

### **案例 5：產後媽媽王太太（骨盆前傾）- 良好表現（總分 69/80）**
**對話特點**（8輪完整對話）：
- 高度同理心，理解產後媽媽的身心壓力
- 成功平衡外觀自信和育兒能力兩大訴求
- FFF方法將「投資自己」定位為「成為更好的媽媽」
- 語氣溫暖鼓勵，給予產後媽媽正向支持

**評分結果**：溝通能力18分，提問技巧17分，方案解釋17分，異議處理17分
**優點**：高度同理心、平衡雙重訴求、正向支持
**合規性**：✅ 完全合規

---

### **案例 6：辦公室OL李小姐（局部脂肪）- 良好表現（總分 66/80）**
**對話特點**（8輪完整對話）：
- 準確捕捉年輕女性的核心焦慮：外觀、自信、職場形象
- 使用「最好的年華」創造時間急迫性，極具說服力
- 理解年輕上班族的預算限制，主動提及分期方案
- 語言風格年輕化，容易與目標客群建立共鳴

**評分結果**：溝通能力17分，提問技巧16分，方案解釋17分，異議處理16分
**優點**：捕捉核心焦慮、創造時間急迫性、理解預算限制
**合規性**：✅ 完全合規

---

## ⚠️ 嚴格禁止行為（每次扣 10 分）

以下行為將導致嚴重扣分：
1. **討論醫學證據/研究** - 例如：「68%的人有效」「臨床研究證明」「FDA認證」
2. **報具體價格** - 例如：「療程XX元」「費用是XX」（應轉介健康顧問）
3. **聲稱醫療效果** - 例如：「保證治癒」「根治疾病」「100%有效」
4. **引用統計數據** - 例如：「根據數據」「百分之XX」「研究指出」

**合規性檢測關鍵詞**：
❌ 醫學證據：68%、臨床研究、FDA認證、統計數據、醫學證據、研究報告、科學證明
❌ 價格討論：XX元、價格是、費用是、收費標準、多少錢、具體價格
❌ 醫療宣稱：保證治癒、100%有效、根治、醫療效果、診斷為、治療疾病
❌ 統計引用：根據數據、百分之、%的人、統計顯示、研究指出

---

## 🎯 評分規則總結

### **對話輪次與總分對照表**（嚴格遵守）
| 對話輪次 | 總分範圍 | 評語基調 | 參考標準 |
|---------|---------|---------|---------|
| 0 輪    | 4 分    | 未開始對話 | 直接返回最低分 |
| 1 輪    | 4-7 分  | 對話嚴重不足 | 僅打招呼或簡單回應 |
| 2 輪    | 8-30 分 | 嚴厲批評 | 基本互動，未展示專業能力 |
| 3 輪    | 10-45 分 | 明確不足 | 有基本提問，但流程不完整 |
| 4 輪    | 15-60 分 | 需要改進 | 展示部分專業能力 |
| 5-7 輪  | 25-75 分 | 根據質量評分 | 完整流程，根據執行品質評分 |
| 8+ 輪   | 30-80 分 | 優秀或卓越 | 完整且深入，可能達到優秀 |

### **評分原則**
1. ❌ **完全沒有表現**某個維度 → 1-5 分
2. ⚠️  **基本表現**（有動作但不專業）→ 6-10 分
3. ✅ **良好表現**（專業且有效）→ 11-15 分
4. 🌟 **卓越表現**（完美執行ACADEMI標準）→ 16-20 分

### **特別注意（防止評分虛高）**
- ⚠️ 對話輪次 ≤2 輪，總分必須 ≤30 分
- ⚠️ 對話輪次 ≤3 輪，總分必須 ≤45 分
- ⚠️ 對話輪次 ≤4 輪，總分必須 ≤60 分
- ⚠️ 評語必須基於實際對話內容，**引用具體對話內容**
- ⚠️ 如果治療師在某個維度**完全沒有任何表現**，該項必須給 1-3 分
- ❌ **絕對禁止給予「客氣分」或「鼓勵分」**

---

## 📤 輸出格式（嚴格遵守 JSON）

{
  "scores": {
    "communication": 1到20之間的整數,
    "questioning": 1到20之間的整數,
    "explanation": 1到20之間的整數,
    "objection": 1到20之間的整數
  },
  "strengths": ["具體優點1（必須有對話支持）", "具體優點2（引用對話內容）", "具體優點3"],
  "improvements": ["具體改進建議1（針對實際問題）", "具體改進建議2", "具體改進建議3"],
  "detailedFeedback": "200-300字的專業評語，必須包含：1) 基於實際對話內容的具體分析，2) 引用對話中的實例，3) 明確指出優點和不足，4) 提供可執行的改進方向"
}

**最後檢查清單**（生成評分前必須驗證）：
✅ 每個分數在 1-20 之間
✅ 總分符合對話輪次限制（2輪≤30, 3輪≤45, 4輪≤60）
✅ 評語**引用了具體對話內容**（不是泛泛而談）
✅ 沒有給予不符合實際表現的高分
✅ 檢查是否觸犯合規性禁止行為（醫學證據、價格、醫療效果、統計數據）
✅ JSON 格式完全正確（無多餘文字）`

    // 調用 DeepSeek Scoring API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: scoringPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    let rawContent = data.choices[0].message.content

    console.log(`[Score] Raw API response length: ${rawContent.length}`)

    // 解析 JSON（移除可能的 Markdown 代碼塊）
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    let scoreData
    try {
      scoreData = JSON.parse(rawContent)
    } catch (parseError) {
      console.error('[Score] JSON parse error:', parseError)
      throw new Error('評分數據解析失敗')
    }

    // ✅ 驗證並修正分數範圍（確保每項 1-20 分，總分 4-80 分）
    const { scores } = scoreData
    if (!scores || typeof scores.communication !== 'number') {
      throw new Error('評分數據格式錯誤')
    }

    // 強制分數範圍限制
    const clampScore = (score: number): number => {
      return Math.max(1, Math.min(20, Math.round(score)))
    }

    scores.communication = clampScore(scores.communication)
    scores.questioning = clampScore(scores.questioning)
    scores.explanation = clampScore(scores.explanation)
    scores.objection = clampScore(scores.objection)

    const totalScore = scores.communication + scores.questioning + scores.explanation + scores.objection

    console.log(`[Score] Scoring completed: Communication=${scores.communication}, Questioning=${scores.questioning}, Explanation=${scores.explanation}, Objection=${scores.objection}, Total=${totalScore}/80`)

    // ✅ 二次驗證：如果對話輪次少但分數過高，進行調整
    if (conversationRounds < 3 && totalScore > 40) {
      console.log(`[Score] Adjusting scores due to low conversation rounds (${conversationRounds} rounds, original total: ${totalScore})`)
      const scaleFactor = Math.min(1, 40 / totalScore)
      scores.communication = Math.max(1, Math.round(scores.communication * scaleFactor))
      scores.questioning = Math.max(1, Math.round(scores.questioning * scaleFactor))
      scores.explanation = Math.max(1, Math.round(scores.explanation * scaleFactor))
      scores.objection = Math.max(1, Math.round(scores.objection * scaleFactor))
    }

    return c.json(scoreData)
  } catch (error) {
    console.error('[Score] Error:', error)
    return c.json({
      error: '評分系統暫時無法使用',
      scores: {
        communication: 1,
        questioning: 1,
        explanation: 1,
        objection: 1
      },
      strengths: [],
      improvements: ['評分系統維護中，請稍後再試'],
      detailedFeedback: '由於技術問題，暫時無法生成詳細評分。請稍後重試或聯繫管理員。系統會在恢復後提供完整的專業評估。'
    }, 500)
  }
})

// 保存評估記錄（僅面試模式）
app.post('/api/assessments', async (c) => {
  try {
    const { sessionId, mode, bodyPart, role, conversation, scores } = await c.req.json()

    // 只有面試模式才保存
    if (mode !== 'interview') {
      return c.json({ message: '練習模式不保存記錄', saved: false })
    }

    const db = c.env.DB
    if (!db) {
      throw new Error('數據庫未配置')
    }

    console.log(`[DB] Saving assessment (session: ${sessionId}, mode: ${mode})`)

    // 插入評估記錄
    await db.prepare(`
      INSERT INTO assessments (
        session_id, mode, body_part, customer_role, 
        total_score, communication_score, questioning_score, 
        explanation_score, objection_score,
        strengths, improvements, detailed_feedback
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      mode,
      bodyPart,
      role,
      scores.communication + scores.questioning + scores.explanation + scores.objection,
      scores.communication,
      scores.questioning,
      scores.explanation,
      scores.objection,
      JSON.stringify(scores.strengths || []),
      JSON.stringify(scores.improvements || []),
      scores.detailedFeedback || ''
    ).run()

    // 插入對話記錄
    for (const msg of conversation) {
      await db.prepare(`
        INSERT INTO conversations (session_id, role, message)
        VALUES (?, ?, ?)
      `).bind(sessionId, msg.role, msg.content).run()
    }

    console.log(`[DB] Assessment saved successfully`)

    return c.json({ message: '評估記錄已保存', saved: true })
  } catch (error) {
    console.error('[DB] Save error:', error)
    return c.json({ 
      error: '保存失敗',
      message: '記錄未能保存，但不影響查看評分報告',
      saved: false
    }, 500)
  }
})

// 獲取歷史記錄（僅面試模式）
app.get('/api/assessments', async (c) => {
  try {
    const db = c.env.DB
    if (!db) {
      throw new Error('數據庫未配置')
    }

    console.log('[DB] Fetching assessment history')

    const { results } = await db.prepare(`
      SELECT 
        session_id, mode, body_part, customer_role,
        total_score, communication_score, questioning_score,
        explanation_score, objection_score,
        strengths, improvements, detailed_feedback,
        created_at
      FROM assessments
      WHERE mode = 'interview'
      ORDER BY created_at DESC
      LIMIT 50
    `).all()

    // 解析 JSON 字段
    const assessments = results.map((row: any) => ({
      ...row,
      strengths: JSON.parse(row.strengths || '[]'),
      improvements: JSON.parse(row.improvements || '[]')
    }))

    console.log(`[DB] Fetched ${assessments.length} assessment records`)

    return c.json({ assessments })
  } catch (error) {
    console.error('[DB] Fetch error:', error)
    return c.json({ 
      error: '獲取記錄失敗',
      assessments: []
    }, 500)
  }
})

// ========================================
// 前端路由
// ========================================

// 主頁 - 完整前端應用
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-HK">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>痛症治療師評測及培訓系統 v2.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-indigo-900 mb-2">
                    <i class="fas fa-user-md mr-3"></i>
                    痛症治療師評測及培訓系統
                </h1>
            </div>

            <!-- Main App Container -->
            <div id="app">
                <!-- Dynamic content will be rendered here -->
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-gray-600 text-sm">
                <p>
                    <i class="fas fa-copyright mr-2"></i>
                    Built & Copyright by Aileen Lam
                </p>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
