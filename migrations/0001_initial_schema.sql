-- 痛症治療師評測系統 - 數據庫結構

-- 評估記錄表
CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('practice', 'interview')),
  body_part TEXT NOT NULL,
  customer_role TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  communication_score INTEGER NOT NULL,
  questioning_score INTEGER NOT NULL,
  explanation_score INTEGER NOT NULL,
  objection_score INTEGER NOT NULL,
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  detailed_feedback TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 對話記錄表
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES assessments(session_id)
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_mode ON assessments(mode);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
