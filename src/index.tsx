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

    console.log(`[Score] Scoring request (rounds: ${conversation.length / 2}, bodyPart: ${bodyPart}, role: ${role})`)

    // ACADEMI 專業評分標準 Prompt
    const scoringPrompt = `你是 ACADEMI 痛症治療師培訓的專業評分專家。請根據以下對話記錄，評估治療師的表現。

**評分對話**：
${conversation.map((msg: any) => `${msg.role === 'assistant' ? '治療師' : '顧客'}: ${msg.content}`).join('\n')}

**評分標準（共 80 分）**：

1. **溝通能力 (20分)**：
   - 禮貌、同理心、積極聆聽
   - 語氣友善、建立信任
   - 回應及時、清晰

2. **提問技巧 (20分)**：
   - 開放式問題（「怎麼樣？」「什麼時候開始？」）
   - 針對性問題（痛症位置、強度、頻率）
   - 了解需求和期望

3. **方案解釋 (20分)**：
   - 清晰介紹治療方案
   - 強調改善生活質量的價值
   - 避免醫學術語，用顧客能理解的語言

4. **異議處理 (20分)**：
   - 使用 FFF 法：Feel（同理）→ Felt（共鳴）→ Found（解決）
   - 正面回應顧客疑慮
   - 提供案例或證據

**嚴格禁止行為**（如出現扣 10 分/次）：
- 討論醫學證據/研究
- 報具體價格
- 聲稱醫療效果
- 引用統計數據

**輸出格式**（必須嚴格遵守 JSON 格式）：
{
  "scores": {
    "communication": 0-20,
    "questioning": 0-20,
    "explanation": 0-20,
    "objection": 0-20
  },
  "strengths": ["優點1", "優點2", "優點3"],
  "improvements": ["改進1", "改進2", "改進3"],
  "detailedFeedback": "詳細的專業評語（200-300字）"
}

**注意**：每個維度最低給 1 分，確保 JSON 格式完全正確。`

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

    // 驗證數據結構
    const { scores } = scoreData
    if (!scores || typeof scores.communication !== 'number') {
      throw new Error('評分數據格式錯誤')
    }

    console.log(`[Score] Scoring completed: Communication=${scores.communication}, Questioning=${scores.questioning}, Explanation=${scores.explanation}, Objection=${scores.objection}`)

    return c.json(scoreData)
  } catch (error) {
    console.error('[Score] Error:', error)
    return c.json({
      error: '評分系統暫時無法使用',
      scores: {
        communication: 10,
        questioning: 10,
        explanation: 10,
        objection: 10
      },
      strengths: ['已完成對話練習'],
      improvements: ['評分系統維護中，請稍後再試'],
      detailedFeedback: '由於技術問題，暫時無法生成詳細評分。請稍後重試或聯繫管理員。'
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
