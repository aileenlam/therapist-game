// 痛症治療師評測及培訓系統 v2.0 - Frontend Application
// 重點：正確的數據訪問順序，避免 v1 的問題

const AppState = {
  currentPage: 'login',
  password: '',
  mode: '', // 'practice' or 'interview'
  sessionId: '',
  bodyPart: '',
  bodyPartName: '',
  customerRole: '',
  customerRoleName: '',
  conversation: [],
  scoreData: null,
  bodyParts: [],
  customerRoles: [],
  assessments: [],
  timerInterval: null,
  timeRemaining: 900 // 15 minutes for interview mode
}

// ========================================
// 工具函數
// ========================================

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ========================================
// API 調用函數
// ========================================

async function verifyPassword(password) {
  try {
    const response = await axios.post('/api/verify-password', { password })
    return response.data.valid
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

async function fetchBodyParts() {
  try {
    const response = await axios.get('/api/body-parts')
    AppState.bodyParts = response.data.bodyParts
  } catch (error) {
    console.error('Failed to fetch body parts:', error)
    AppState.bodyParts = []
  }
}

async function fetchCustomerRoles() {
  try {
    const response = await axios.get('/api/customer-roles')
    AppState.customerRoles = response.data.customerRoles
  } catch (error) {
    console.error('Failed to fetch customer roles:', error)
    AppState.customerRoles = []
  }
}

async function sendChatMessage(message) {
  try {
    const response = await axios.post('/api/chat', {
      messages: [
        ...AppState.conversation,
        { role: 'user', content: message }
      ],
      bodyPart: AppState.bodyPartName,
      role: AppState.customerRoleName
    })
    return response.data.message
  } catch (error) {
    console.error('Chat error:', error)
    return '抱歉，我現在有點忙，可以稍後再聊嗎？'
  }
}

async function getScore() {
  try {
    console.log('🎯 開始評分...')
    
    // ✅ 前端攔截：檢查用戶是否有實際輸入
    const therapistMessages = AppState.conversation.filter(msg => msg.role === 'assistant')
    const userInputCount = therapistMessages.length
    
    console.log(`📊 對話統計：總計 ${AppState.conversation.length} 條訊息，治療師發言 ${userInputCount} 次`)
    
    // ✅ 如果用戶完全沒有輸入，直接返回最低分（不調用 AI）
    if (userInputCount === 0) {
      console.log('⚠️ 前端攔截：用戶無任何輸入，返回最低分')
      return {
        scores: {
          communication: 1,
          questioning: 1,
          explanation: 1,
          objection: 1
        },
        strengths: [],
        improvements: [
          '未進行任何對話',
          '請主動與顧客打招呼',
          '建議了解顧客的痛症情況',
          '需要展示基本的溝通能力'
        ],
        detailedFeedback: '本次練習您完全沒有參與對話。作為痛症治療師，主動溝通是最基本的職業要求。建議您：1) 主動問候顧客並自我介紹，2) 詢問顧客的痛症位置、強度和持續時間，3) 展示同理心和專業態度，4) 提供初步的建議或解決方案。請重新開始練習，至少進行 3-5 輪完整對話。'
      }
    }
    
    // ✅ 如果只有 1 次輸入，給予低分警告
    if (userInputCount === 1) {
      console.log('⚠️ 前端攔截：對話過少（僅 1 輪），返回低分')
      return {
        scores: {
          communication: 3,
          questioning: 2,
          explanation: 1,
          objection: 1
        },
        strengths: ['已嘗試開始對話'],
        improvements: [
          '對話輪次嚴重不足（僅 1 輪）',
          '未能深入了解顧客需求',
          '缺少完整的對話流程',
          '建議進行至少 3-5 輪對話'
        ],
        detailedFeedback: '本次練習僅進行了 1 輪對話，無法展示您的專業能力。完整的痛症諮詢流程應包括：1) 建立信任關係（問候、自我介紹），2) 詳細詢問痛症情況（位置、強度、頻率、誘因），3) 解釋治療方案和預期效果，4) 處理顧客的疑慮和異議。請重新練習，進行更完整的對話。'
      }
    }
    
    // 正常情況：調用 AI 評分
    const response = await axios.post('/api/score', {
      conversation: AppState.conversation,
      bodyPart: AppState.bodyPartName,
      role: AppState.customerRoleName
    }, {
      timeout: 90000 // 90 seconds timeout
    })
    
    console.log('✅ 評分完成:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 評分失敗:', error)
    return {
      error: true,
      scores: {
        communication: 1,
        questioning: 1,
        explanation: 1,
        objection: 1
      },
      strengths: [],
      improvements: ['評分系統暫時無法使用，請稍後再試'],
      detailedFeedback: '由於技術問題，暫時無法生成詳細評分。請稍後重試或聯繫管理員。'
    }
  }
}

async function saveAssessment(scoreData) {
  try {
    await axios.post('/api/assessments', {
      sessionId: AppState.sessionId,
      mode: AppState.mode,
      bodyPart: AppState.bodyPartName,
      role: AppState.customerRoleName,
      conversation: AppState.conversation,
      scores: scoreData
    })
    console.log('✅ 記錄已保存')
  } catch (error) {
    console.error('❌ 保存記錄失敗:', error)
  }
}

async function fetchAssessments() {
  try {
    const response = await axios.get('/api/assessments')
    AppState.assessments = response.data.assessments || []
  } catch (error) {
    console.error('Failed to fetch assessments:', error)
    AppState.assessments = []
  }
}

// ========================================
// 頁面渲染函數
// ========================================

function renderLoginPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-user-md text-4xl text-indigo-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">系統登入</h2>
          <p class="text-gray-600 mt-2">請輸入訪問密碼</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密碼</label>
            <input 
              type="password" 
              id="password-input"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="請輸入密碼"
              onkeypress="if(event.key==='Enter') handleLogin()"
            >
          </div>
          
          <button 
            onclick="handleLogin()"
            class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            登入系統
          </button>
          
          <div id="login-error" class="hidden">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <i class="fas fa-exclamation-circle mr-2"></i>
              密碼錯誤，請重試
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderModeSelectionPage() {
  return `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">選擇訓練模式</h2>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 練習模式 -->
        <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 cursor-pointer"
             onclick="selectMode('practice')">
          <div class="text-center">
            <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-dumbbell text-4xl text-green-600"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">練習模式</h3>
            <p class="text-gray-600 mb-6">自由練習，提升技能</p>
            
            <ul class="text-left space-y-3 mb-6">
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                <span class="text-gray-700">無時間限制，輕鬆練習</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                <span class="text-gray-700">自選情境組合</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                <span class="text-gray-700">即時評分反饋</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-times-circle text-gray-400 mr-3 mt-1"></i>
                <span class="text-gray-500">不保存記錄</span>
              </li>
            </ul>
            
            <button class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200">
              開始練習
            </button>
          </div>
        </div>
        
        <!-- 面試模式 -->
        <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 cursor-pointer"
             onclick="selectMode('interview')">
          <div class="text-center">
            <div class="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-briefcase text-4xl text-orange-600"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">面試模式</h3>
            <p class="text-gray-600 mb-6">模擬真實面試情境</p>
            
            <ul class="text-left space-y-3 mb-6">
              <li class="flex items-start">
                <i class="fas fa-check-circle text-orange-500 mr-3 mt-1"></i>
                <span class="text-gray-700">15分鐘倒計時</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-orange-500 mr-3 mt-1"></i>
                <span class="text-gray-700">系統隨機抽取情境</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-orange-500 mr-3 mt-1"></i>
                <span class="text-gray-700">專業評分報告</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-orange-500 mr-3 mt-1"></i>
                <span class="text-gray-700">自動保存記錄</span>
              </li>
            </ul>
            
            <button class="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200">
              開始面試
            </button>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-8">
        <button onclick="logout()" class="text-gray-600 hover:text-gray-800">
          <i class="fas fa-sign-out-alt mr-2"></i>
          登出系統
        </button>
      </div>
    </div>
  `
}

function renderCardSelectionPage() {
  if (AppState.bodyParts.length === 0 || AppState.customerRoles.length === 0) {
    return `
      <div class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
        <p class="text-gray-600">載入中...</p>
      </div>
    `
  }
  
  return `
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-dumbbell text-green-600 mr-2"></i>
          練習模式 - 選擇情境
        </h2>
        <p class="text-gray-600">請選擇身體部位和顧客角色</p>
      </div>
      
      <!-- 身體部位選擇 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          <i class="fas fa-user-injured text-indigo-600 mr-2"></i>
          1. 選擇身體部位
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${AppState.bodyParts.map(part => `
            <button 
              onclick="selectBodyPart('${part.id}', '${part.name}')"
              class="body-part-card p-4 border-2 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition duration-200 text-left ${AppState.bodyPart === part.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}"
            >
              <div class="text-3xl mb-2 text-center">${part.icon}</div>
              <div class="font-semibold text-gray-800 mb-2 text-center">${part.name}</div>
              <div class="text-xs text-gray-600 space-y-1">
                <div><strong>痛症：</strong>${(part.conditions || []).join('、')}</div>
                <div><strong>肌肉：</strong>${(part.muscles || []).join('、')}</div>
                <div><strong>穴位：</strong>${(part.acupoints || []).join('、')}</div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- 顧客角色選擇 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          <i class="fas fa-users text-indigo-600 mr-2"></i>
          2. 選擇顧客角色
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${AppState.customerRoles.map(role => `
            <button 
              onclick="selectCustomerRole('${role.id}', '${role.name}')"
              class="customer-role-card p-4 border-2 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition duration-200 text-left ${AppState.customerRole === role.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}"
            >
              <div class="font-semibold text-gray-800 mb-1">${role.name}</div>
              <div class="text-sm text-gray-600">${role.age}歲 · ${role.occupation}</div>
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- 開始按鈕 -->
      <div class="flex justify-center space-x-4">
        <button 
          onclick="goToModeSelection()"
          class="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          返回
        </button>
        <button 
          onclick="startConversation()"
          id="start-btn"
          class="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          ${!AppState.bodyPart || !AppState.customerRole ? 'disabled' : ''}
        >
          <i class="fas fa-play mr-2"></i>
          開始對話
        </button>
      </div>
    </div>
  `
}

function renderConversationPage() {
  const isInterview = AppState.mode === 'interview'
  
  // 獲取當前身體部位的提示卡資訊
  const bodyPartInfo = AppState.bodyParts.find(bp => bp.name === AppState.bodyPartName) || {}
  
  return `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-xl p-4 mb-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold text-gray-800">
              ${isInterview ? '<i class="fas fa-briefcase text-orange-600 mr-2"></i>面試模式' : '<i class="fas fa-dumbbell text-green-600 mr-2"></i>練習模式'}
            </h3>
            <p class="text-sm text-gray-600">
              ${AppState.bodyPartName} · ${AppState.customerRoleName}
            </p>
          </div>
          <div class="text-right">
            ${isInterview ? `
              <div class="text-2xl font-bold ${AppState.timeRemaining <= 60 ? 'text-red-600' : 'text-gray-800'}" id="timer">
                ${formatTime(AppState.timeRemaining)}
              </div>
              <div class="text-xs text-gray-500">剩餘時間</div>
            ` : `
              <div class="text-sm text-gray-600">
                第 ${Math.floor(AppState.conversation.length / 2) + 1} 輪對話
              </div>
            `}
          </div>
        </div>
      </div>
      
      <!-- 主要內容區域：左側對話 + 右側提示卡 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- 左側對話區域（佔 2/3 寬度） -->
        <div class="lg:col-span-2 space-y-4">
          <!-- 對話區域 -->
          <div class="bg-white rounded-2xl shadow-xl p-6" style="height: 500px; overflow-y: auto;" id="chat-container">
            <div id="messages">
              ${AppState.conversation.length === 0 ? `
                <div class="text-center py-12 text-gray-500">
                  <i class="fas fa-comments text-4xl mb-4"></i>
                  <p>開始您的對話吧！</p>
                  <p class="text-sm mt-2">右側有提示卡可供參考</p>
                </div>
              ` : AppState.conversation.map(msg => `
                <div class="mb-4 ${msg.role === 'assistant' ? 'text-left' : 'text-right'}">
                  <div class="inline-block max-w-[70%] ${msg.role === 'assistant' ? 'bg-gray-100' : 'bg-indigo-600 text-white'} rounded-lg px-4 py-3">
                    <div class="text-xs ${msg.role === 'assistant' ? 'text-gray-600' : 'text-indigo-200'} mb-1">
                      ${msg.role === 'assistant' ? '顧客' : '治療師'}
                    </div>
                    <div class="text-sm">${msg.content}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div id="loading-indicator" class="hidden text-center py-4">
              <i class="fas fa-spinner fa-spin text-indigo-600"></i>
              <span class="ml-2 text-gray-600">AI 正在回應...</span>
            </div>
          </div>
          
          <!-- 輸入區域 -->
          <div class="bg-white rounded-2xl shadow-xl p-4">
            <div class="flex space-x-2">
              <input 
                type="text" 
                id="message-input"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="輸入您的訊息..."
                onkeypress="if(event.key==='Enter') sendMessage()"
              >
              <button 
                onclick="sendMessage()"
                class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
            
            <div class="mt-4 text-center">
              <button 
                onclick="endConversation()"
                class="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200"
              >
                <i class="fas fa-stop mr-2"></i>
                結束${isInterview ? '面試' : '練習'}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 右側提示卡（佔 1/3 寬度） -->
        <div class="lg:col-span-1">
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 sticky top-4">
            <h3 class="text-lg font-bold text-indigo-800 mb-4 flex items-center">
              <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
              專業提示卡
            </h3>
            
            <!-- 身體部位名稱 -->
            <div class="mb-4 bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center mb-2">
                <span class="text-2xl mr-2">${bodyPartInfo.icon || '🦴'}</span>
                <h4 class="font-bold text-gray-800">${AppState.bodyPartName}</h4>
              </div>
            </div>
            
            <!-- 常見痛症問題 -->
            <div class="mb-4 bg-white rounded-lg p-4 shadow-sm">
              <h5 class="font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                常見痛症問題
              </h5>
              <div class="flex flex-wrap gap-2">
                ${(bodyPartInfo.conditions || []).map(condition => `
                  <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">${condition}</span>
                `).join('')}
              </div>
            </div>
            
            <!-- 相關肌肉組織 -->
            <div class="mb-4 bg-white rounded-lg p-4 shadow-sm">
              <h5 class="font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-dumbbell text-blue-500 mr-2"></i>
                相關肌肉組織
              </h5>
              <div class="flex flex-wrap gap-2">
                ${(bodyPartInfo.muscles || []).map(muscle => `
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${muscle}</span>
                `).join('')}
              </div>
            </div>
            
            <!-- 經絡穴位名稱 -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h5 class="font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-compass text-green-500 mr-2"></i>
                經絡穴位名稱
              </h5>
              <div class="flex flex-wrap gap-2">
                ${(bodyPartInfo.acupoints || []).map(acupoint => `
                  <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">${acupoint}</span>
                `).join('')}
              </div>
            </div>
            
            <!-- 提示說明 -->
            <div class="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p class="text-xs text-yellow-800">
                <i class="fas fa-info-circle mr-1"></i>
                這些資訊可以幫助您在對話中展示專業知識
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderReportPage() {
  const scoreData = AppState.scoreData
  
  // 🔥 關鍵修復：正確的數據訪問順序
  // 優先使用 scoreData 的頂層屬性，然後才是 scores 對象
  const scores = scoreData.scores || {}
  const total = (scores.communication || 0) + (scores.questioning || 0) + 
                (scores.explanation || 0) + (scores.objection || 0)
  
  // 🔥 關鍵修復：優先從 scoreData 頂層讀取，避免 undefined 錯誤
  const strengths = scoreData.strengths || scores.strengths || []
  const improvements = scoreData.improvements || scores.improvements || []
  const detailedFeedback = scoreData.detailedFeedback || scores.detailedFeedback || '暫無詳細評語'
  
  const level = total >= 60 ? '優秀' : total >= 40 ? '良好' : total >= 20 ? '及格' : '需加強'
  const levelColor = total >= 60 ? 'green' : total >= 40 ? 'blue' : total >= 20 ? 'yellow' : 'red'
  
  console.log('📊 渲染報告頁面:', { scoreData, scores, strengths, improvements, total })
  
  return `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-chart-line text-indigo-600 mr-2"></i>
          評估報告
        </h2>
        <p class="text-gray-600">${AppState.bodyPartName} · ${AppState.customerRoleName}</p>
      </div>
      
      <!-- 總分卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
        <div class="text-6xl font-bold text-${levelColor}-600 mb-2">
          ${total} <span class="text-3xl text-gray-500">/ 80</span>
        </div>
        <div class="text-2xl font-semibold text-${levelColor}-700 mb-4">${level}</div>
        <div class="flex justify-center space-x-8 text-sm">
          <div>
            <div class="text-gray-600">溝通</div>
            <div class="font-bold text-gray-800">${scores.communication || 0}/20</div>
          </div>
          <div>
            <div class="text-gray-600">提問</div>
            <div class="font-bold text-gray-800">${scores.questioning || 0}/20</div>
          </div>
          <div>
            <div class="text-gray-600">方案</div>
            <div class="font-bold text-gray-800">${scores.explanation || 0}/20</div>
          </div>
          <div>
            <div class="text-gray-600">異議</div>
            <div class="font-bold text-gray-800">${scores.objection || 0}/20</div>
          </div>
        </div>
      </div>
      
      <!-- 表現優點 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-xl font-bold text-green-700 mb-4">
          <i class="fas fa-check-circle mr-2"></i>
          表現優點
        </h3>
        <div class="space-y-2">
          ${strengths.length > 0 ? strengths.map((item, index) => `
            <div class="flex items-start bg-green-50 p-3 rounded-lg">
              <div class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                ${index + 1}
              </div>
              <div class="text-gray-800">${item}</div>
            </div>
          `).join('') : `
            <div class="text-gray-500 text-center py-4">暫無優點記錄</div>
          `}
        </div>
      </div>
      
      <!-- 改進建議 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-xl font-bold text-blue-700 mb-4">
          <i class="fas fa-lightbulb mr-2"></i>
          改進建議
        </h3>
        <div class="space-y-2">
          ${improvements.length > 0 ? improvements.map((item, index) => `
            <div class="flex items-start bg-blue-50 p-3 rounded-lg">
              <div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                ${index + 1}
              </div>
              <div class="text-gray-800">${item}</div>
            </div>
          `).join('') : `
            <div class="text-gray-500 text-center py-4">暫無改進建議</div>
          `}
        </div>
      </div>
      
      <!-- 詳細評語 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          <i class="fas fa-comment-dots mr-2"></i>
          詳細評語
        </h3>
        <div class="text-gray-700 leading-relaxed space-y-2">
          ${detailedFeedback.split('\n').filter(p => p.trim()).map(paragraph => `
            <p>${paragraph}</p>
          `).join('')}
        </div>
      </div>
      
      <!-- 操作按鈕 -->
      <div class="flex justify-center space-x-4">
        ${AppState.mode === 'interview' ? `
          <button 
            onclick="goToHistory()"
            class="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition duration-200"
          >
            <i class="fas fa-history mr-2"></i>
            查看歷史
          </button>
        ` : ''}
        <button 
          onclick="goToModeSelection()"
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
        >
          <i class="fas fa-redo mr-2"></i>
          開始新的${AppState.mode === 'interview' ? '面試' : '練習'}
        </button>
      </div>
    </div>
  `
}

function renderHistoryPage() {
  if (AppState.assessments.length === 0) {
    return `
      <div class="max-w-4xl mx-auto text-center py-12">
        <i class="fas fa-inbox text-6xl text-gray-400 mb-4"></i>
        <p class="text-xl text-gray-600 mb-8">暫無歷史記錄</p>
        <button 
          onclick="goToModeSelection()"
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          返回主頁
        </button>
      </div>
    `
  }
  
  return `
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-history text-indigo-600 mr-2"></i>
          歷史記錄
        </h2>
        <p class="text-gray-600">共 ${AppState.assessments.length} 條面試記錄</p>
      </div>
      
      <div class="space-y-4 mb-8">
        ${AppState.assessments.map((assessment, index) => {
          const total = assessment.total_score
          const level = total >= 60 ? '優秀' : total >= 40 ? '良好' : total >= 20 ? '及格' : '需加強'
          const levelColor = total >= 60 ? 'green' : total >= 40 ? 'blue' : total >= 20 ? 'yellow' : 'red'
          
          return `
            <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                      面試模式
                    </span>
                    <span class="text-gray-500 text-sm">
                      ${new Date(assessment.created_at).toLocaleString('zh-HK')}
                    </span>
                  </div>
                  <div class="text-lg font-semibold text-gray-800 mb-2">
                    ${assessment.body_part} · ${assessment.customer_role}
                  </div>
                  <div class="flex space-x-4 text-sm text-gray-600">
                    <span>溝通: ${assessment.communication_score}/20</span>
                    <span>提問: ${assessment.questioning_score}/20</span>
                    <span>方案: ${assessment.explanation_score}/20</span>
                    <span>異議: ${assessment.objection_score}/20</span>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <div class="text-3xl font-bold text-${levelColor}-600">
                    ${total}
                  </div>
                  <div class="text-sm text-${levelColor}-700 font-semibold">${level}</div>
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
      
      <div class="text-center">
        <button 
          onclick="goToModeSelection()"
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          返回主頁
        </button>
      </div>
    </div>
  `
}

// ========================================
// 主渲染函數
// ========================================

function render() {
  const app = document.getElementById('app')
  
  let content = ''
  switch (AppState.currentPage) {
    case 'login':
      content = renderLoginPage()
      break
    case 'mode-selection':
      content = renderModeSelectionPage()
      break
    case 'card-selection':
      content = renderCardSelectionPage()
      break
    case 'conversation':
      content = renderConversationPage()
      break
    case 'report':
      content = renderReportPage()
      break
    case 'history':
      content = renderHistoryPage()
      break
    default:
      content = renderLoginPage()
  }
  
  app.innerHTML = content
  
  // 對話頁面需要啟動計時器
  if (AppState.currentPage === 'conversation' && AppState.mode === 'interview' && !AppState.timerInterval) {
    startTimer()
  }
}

// ========================================
// 事件處理函數
// ========================================

async function handleLogin() {
  const input = document.getElementById('password-input')
  const password = input.value.trim()
  const errorDiv = document.getElementById('login-error')
  
  if (!password) {
    input.focus()
    return
  }
  
  const isValid = await verifyPassword(password)
  
  if (isValid) {
    AppState.password = password
    AppState.currentPage = 'mode-selection'
    render()
  } else {
    errorDiv.classList.remove('hidden')
    input.value = ''
    input.focus()
  }
}

function logout() {
  AppState.currentPage = 'login'
  AppState.password = ''
  render()
}

async function selectMode(mode) {
  AppState.mode = mode
  AppState.sessionId = generateSessionId()
  
  if (mode === 'practice') {
    // 練習模式：手動選擇卡片
    await fetchBodyParts()
    await fetchCustomerRoles()
    AppState.currentPage = 'card-selection'
  } else {
    // 面試模式：隨機抽取
    await fetchBodyParts()
    await fetchCustomerRoles()
    
    const randomBodyPart = AppState.bodyParts[Math.floor(Math.random() * AppState.bodyParts.length)]
    const randomRole = AppState.customerRoles[Math.floor(Math.random() * AppState.customerRoles.length)]
    
    AppState.bodyPart = randomBodyPart.id
    AppState.bodyPartName = randomBodyPart.name
    AppState.customerRole = randomRole.id
    AppState.customerRoleName = randomRole.name
    AppState.timeRemaining = 900 // 15 minutes
    
    startConversation()
  }
  
  render()
}

function goToModeSelection() {
  // 清理狀態
  AppState.conversation = []
  AppState.scoreData = null
  AppState.bodyPart = ''
  AppState.customerRole = ''
  if (AppState.timerInterval) {
    clearInterval(AppState.timerInterval)
    AppState.timerInterval = null
  }
  
  AppState.currentPage = 'mode-selection'
  render()
}

function selectBodyPart(id, name) {
  AppState.bodyPart = id
  AppState.bodyPartName = name
  
  // 更新按鈕狀態
  const startBtn = document.getElementById('start-btn')
  if (AppState.bodyPart && AppState.customerRole) {
    startBtn.disabled = false
  }
  
  render()
}

function selectCustomerRole(id, name) {
  AppState.customerRole = id
  AppState.customerRoleName = name
  
  // 更新按鈕狀態
  const startBtn = document.getElementById('start-btn')
  if (AppState.bodyPart && AppState.customerRole) {
    startBtn.disabled = false
  }
  
  render()
}

async function startConversation() {
  AppState.conversation = []
  AppState.currentPage = 'conversation'
  render()
  
  // 自動發送第一條顧客消息
  setTimeout(async () => {
    const firstMessage = await sendChatMessage('你好')
    AppState.conversation.push({ role: 'assistant', content: firstMessage })
    render()
    scrollToBottom()
  }, 500)
}

async function sendMessage() {
  const input = document.getElementById('message-input')
  const message = input.value.trim()
  
  if (!message) return
  
  // 添加用戶消息
  AppState.conversation.push({ role: 'user', content: message })
  input.value = ''
  render()
  scrollToBottom()
  
  // 顯示 loading
  document.getElementById('loading-indicator').classList.remove('hidden')
  
  // 獲取 AI 回應
  const aiResponse = await sendChatMessage(message)
  AppState.conversation.push({ role: 'assistant', content: aiResponse })
  
  document.getElementById('loading-indicator').classList.add('hidden')
  render()
  scrollToBottom()
}

async function endConversation() {
  if (AppState.timerInterval) {
    clearInterval(AppState.timerInterval)
    AppState.timerInterval = null
  }
  
  // 顯示評分中提示
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="max-w-md mx-auto text-center py-12">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <i class="fas fa-spinner fa-spin text-6xl text-indigo-600 mb-6"></i>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">AI 評分中...</h3>
        <p class="text-gray-600 mb-4">正在分析您的表現，請稍候</p>
        <div class="text-sm text-gray-500">
          預計需要 20-40 秒
        </div>
      </div>
    </div>
  `
  
  try {
    // 獲取評分
    const scoreData = await getScore()
    
    // 🔥 關鍵：直接保存完整的 scoreData
    AppState.scoreData = scoreData
    
    // 保存記錄（僅面試模式）
    if (AppState.mode === 'interview') {
      await saveAssessment(scoreData)
    }
    
    console.log('✅ 評分完成，準備渲染報告頁面:', AppState.scoreData)
    
    // 顯示報告
    AppState.currentPage = 'report'
    render()
  } catch (error) {
    console.error('❌ 評分流程錯誤:', error)
    alert('評分失敗，請重試')
    goToModeSelection()
  }
}

async function goToHistory() {
  await fetchAssessments()
  AppState.currentPage = 'history'
  render()
}

function startTimer() {
  if (AppState.timerInterval) {
    clearInterval(AppState.timerInterval)
  }
  
  AppState.timerInterval = setInterval(() => {
    AppState.timeRemaining--
    
    const timerElement = document.getElementById('timer')
    if (timerElement) {
      timerElement.textContent = formatTime(AppState.timeRemaining)
      
      if (AppState.timeRemaining <= 60) {
        timerElement.classList.add('text-red-600')
      }
    }
    
    if (AppState.timeRemaining <= 0) {
      clearInterval(AppState.timerInterval)
      AppState.timerInterval = null
      alert('時間到！面試結束')
      endConversation()
    }
  }, 1000)
}

function scrollToBottom() {
  const chatContainer = document.getElementById('chat-container')
  if (chatContainer) {
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }, 100)
  }
}

// ========================================
// 初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 痛症治療師評測系統 v2.0 已啟動')
  render()
})
