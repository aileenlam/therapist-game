import { Hono } from 'hono'
import { cors } from 'hono/cors'

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

    // 構建系統 Prompt
    const systemPrompt = `你是一位正在尋求痛症治療的顧客（${role}），主要問題是「${bodyPart}」疼痛。

**角色設定**：
- 你是真實的顧客，不是治療師
- 你會根據對方的問題和解釋做出自然的回應
- 你可能會有疑慮、擔心、或提出異議

**回應原則**：
1. 簡短自然（20-50字）
2. 根據對話進展逐步表達你的顧慮
3. 如果對方解釋清楚，你會逐漸信任
4. 如果對方沒有了解你的需求，你會感到不滿

**常見異議類型**：
- 價格疑慮：「會不會很貴？」
- 效果質疑：「真的有用嗎？」
- 時間問題：「需要治療多久？」
- 比較競品：「按摩/針灸是否更好？」

請扮演好顧客角色，讓對話盡可能真實。`

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
    const therapistMessages = conversation.filter((msg: any) => msg.role === 'assistant')
    const conversationRounds = therapistMessages.length

    console.log(`[Score] Scoring request (rounds: ${conversationRounds}, bodyPart: ${bodyPart}, role: ${role})`)

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

    // ACADEMI 專業評分標準 Prompt（嚴格版 + Few-Shot Learning）
    const scoringPrompt = `你是 ACADEMI 痛症治療師培訓的專業評分專家。請根據以下對話記錄，**嚴格、客觀**地評估治療師的表現。

**評分對話**（共 ${conversationRounds} 輪）：
${conversation.map((msg: any) => `${msg.role === 'assistant' ? '治療師' : '顧客'}: ${msg.content}`).join('\n')}

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

## 📚 評分示例（Few-Shot Learning）

### **示例 1：2 輪對話（極差表現）**
**對話**：
- 治療師：你好
- 顧客：我頸部很痛
- 治療師：哦

**評分結果**：
- 溝通能力：4 分（僅打招呼，無後續關心）
- 提問技巧：2 分（沒有任何提問）
- 方案解釋：1 分（完全沒有解釋）
- 異議處理：1 分（無異議出現）
- **總分：8/80**

**評語基調**：「對話嚴重不足，未展示任何專業能力...」

---

### **示例 2：3 輪對話（基本表現）**
**對話**：
- 治療師：你好，請問哪裡不舒服？
- 顧客：我肩膀痛了一個月
- 治療師：痛得嚴重嗎？
- 顧客：挺嚴重的
- 治療師：我們可以做按摩治療

**評分結果**：
- 溝通能力：8 分（基本禮貌，但缺乏同理心）
- 提問技巧：7 分（有基本提問，但不夠深入）
- 方案解釋：6 分（提到治療方案，但過於簡單）
- 異議處理：3 分（沒有異議出現，但準備不足）
- **總分：24/80**

**評語基調**：「展示了基本溝通能力，但提問不夠深入，方案解釋過於簡單...」

---

### **示例 3：5 輪對話（良好表現）**
**對話**：
- 治療師：您好！我是治療師小王。請問您今天哪裡不舒服？
- 顧客：我腰痛了三個月了
- 治療師：腰痛三個月確實很辛苦。請問是突然開始的還是逐漸加重的？痛的位置在哪裡？
- 顧客：是久坐後慢慢加重的，下背部
- 治療師：我了解了。久坐確實容易導致腰肌勞損。我建議先做深層組織按摩放鬆肌肉，再配合拉伸運動改善姿勢
- 顧客：按摩會痛嗎？
- 治療師：我理解您的顧慮。很多客人一開始也擔心。我會根據您的承受度調整力度，過程中可以隨時告訴我。之前有位客人和您情況類似，治療三次後明顯改善

**評分結果**：
- 溝通能力：14 分（禮貌、自我介紹、展示同理心）
- 提問技巧：13 分（針對性提問：位置、時間、誘因）
- 方案解釋：12 分（清晰解釋治療方案和原理）
- 異議處理：13 分（使用 FFF 法，提供案例）
- **總分：52/80**

**評語基調**：「展示了良好的專業能力，提問針對性強，方案解釋清晰，異議處理得當...」

---

### **示例 4：7 輪對話（卓越表現）**
**對話內容**：完整展示了問候、深入提問、方案解釋、異議處理、總結跟進的完整流程

**評分結果**：
- 溝通能力：18 分（卓越同理心，建立深度信任）
- 提問技巧：17 分（開放式+封閉式結合，深入了解）
- 方案解釋：16 分（詳細且易懂，強調價值）
- 異議處理：17 分（完美使用 FFF 法，提供多個案例）
- **總分：68/80**

**評語基調**：「展示了卓越的專業能力，全面掌握 ACADEMI 標準...」

---

### **示例 5：2 輪對話但內容充實（中等表現）**
**對話**：
- 治療師：您好！歡迎來到我們診所。我是專業痛症治療師 Aileen。請問您今天主要是哪個部位不舒服？這個問題困擾您多久了？
- 顧客：我頸部很痛，已經兩週了
- 治療師：頸部痛兩週確實會影響生活品質。讓我先了解一下：1) 疼痛是持續性的還是間歇性的？2) 有沒有特定動作會加劇疼痛？3) 您平時工作是否需要長時間使用電腦？4) 之前有沒有試過其他治療方法？
- 顧客：持續性的痛，轉頭會更痛，我是程式員每天用電腦 10 小時，還沒試過治療
- 治療師：我完全理解您的情況。作為程式員長時間保持固定姿勢，頸部肌肉（特別是胸鎖乳突肌和斜方肌）會持續緊張，導致血液循環不良。我建議的治療方案包括：1) 首先進行深層組織按摩，針對風池穴和大椎穴進行穴位按摩，放鬆緊繃的肌肉；2) 配合頸部拉伸運動，改善柔軟度；3) 教您正確的坐姿和每小時 5 分鐘的頸部放鬆操。通常 3-5 次療程就能明顯改善，很多 IT 從業者都反映效果很好。您覺得這個方案如何？

**評分結果**：
- 溝通能力：15 分（專業自我介紹，展示同理心）
- 提問技巧：16 分（一次提出多個針對性問題，非常專業）
- 方案解釋：15 分（詳細解釋病因、治療方案、預期效果）
- 異議處理：8 分（主動預防異議，但未實際處理異議）
- **總分：54/80**

**評語基調**：「儘管對話輪次較少，但展示了紮實的專業能力。提問全面且針對性強，方案解釋詳細易懂...」

---

## ⚠️ 嚴格禁止行為（每次扣 10 分）
- 討論醫學證據/研究
- 報具體價格
- 聲稱醫療效果（如「保證治癒」）
- 引用統計數據

---

## 🎯 評分規則總結

### **對話輪次與總分對照表**（嚴格遵守）
| 對話輪次 | 總分上限 | 評語基調 |
|---------|---------|---------|
| 2 輪    | ≤30 分  | 嚴厲批評 |
| 3 輪    | ≤45 分  | 明確不足 |
| 4 輪    | ≤60 分  | 需要改進 |
| 5+ 輪   | ≤80 分  | 根據質量評分 |

### **評分原則**
1. ❌ **完全沒有表現**某個維度 → 1-5 分
2. ⚠️  **基本表現** → 6-10 分
3. ✅ **良好表現** → 11-15 分
4. 🌟 **卓越表現** → 16-20 分

### **特別注意**
- 對話輪次 ≤3 輪，總分必須 ≤45 分
- 評語必須基於實際對話內容，引用具體例子
- 如果治療師在某個維度沒有任何表現，該項給 1-3 分
- 不可給予「客氣分」或「鼓勵分」

---

## 📤 輸出格式（嚴格遵守 JSON）

{
  "scores": {
    "communication": 1到20之間的整數,
    "questioning": 1到20之間的整數,
    "explanation": 1到20之間的整數,
    "objection": 1到20之間的整數
  },
  "strengths": ["具體優點1（必須有對話支持）", "具體優點2", "具體優點3"],
  "improvements": ["具體改進建議1", "具體改進建議2", "具體改進建議3"],
  "detailedFeedback": "200-300字的專業評語，必須：1) 基於實際對話內容，2) 引用具體例子，3) 指出明確改進方向"
}

**最後檢查清單**：
✅ 每個分數在 1-20 之間
✅ 總分符合對話輪次限制
✅ 評語引用了具體對話內容
✅ 沒有給予不符合表現的高分
✅ JSON 格式完全正確`

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
