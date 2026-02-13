# 多模态 Agent WebSocket 通信协议规范

## 1. 协议概述

* **通信模式**：全双工 WebSocket。
* **帧类型**：
* **Text Frame (JSON)**：用于传输控制指令、Agent 状态更新、文本流以及媒体元数据（如图片 URL）。
* **Binary Frame (ArrayBuffer)**：**专用于** 音频流分片。

---

## 2. 客户端 -> 后端 (Client-to-Server)

### 2.1 发送消息 (`query`)

用户发送文本、图片或两者结合的消息。

**JSON Schema:**

```json
{
  "type": "query",
  "message_id": "string", // 客户端生成的唯一 ID，用于追踪
  "payload": {
    "text": "string",     // 用户输入的文本
    "images": [           // 可选，图片数组
      {
        "format": "string", // e.g., "jpg", "png"
        "data": "string"    // Base64 编码的图片数据
      }
    ]
  }
}

```

### 2.2 控制指令 (`control`)

用于执行“停止生成”、“重置会话”等非业务数据的逻辑控制。

**案例：停止生成 (Interrupt)**

```json
{
  "type": "control",
  "payload": {
    "action": "stop",
    "target_message_id": "msg_123456" // 指定要中断的消息 ID
  }
}

```

---

## 3. 后端 -> 客户端 (Server-to-Client)

### 3.1 状态更新 (`status`)

用于展示 Agent 的中间思考过程（Thinking, Searching 等）。

**案例：Agent 正在搜索**

```json
{
  "type": "status",
  "payload": {
    "state": "searching",        // 状态码：thinking | searching | analyzing | idle
    "detail": "正在查询 2026 年天气预报...", // UI 显示的提示文字
    "tool_calls": ["web_search"] // 当前调用的工具名
  }
}

```

### 3.2 文本流 (`text_chunk`)

流式返回 Agent 生成的回复文字。

**案例：流式文本推送**

```json
{
  "type": "text_chunk",
  "message_id": "msg_123456",
  "payload": {
    "content": "今天",
    "is_final": false,
  }
}

```

### 3.3 媒体工件 (`artifact`)

当 Agent 输出非文本结果（如生成的图片、图表、文件）时使用。

**案例：返回图片**

```json
{
  "type": "artifact",
  "payload": {
    "media_type": "image",
    "url": "https://assets.ai.com/gen_001.png", // 优先使用 URL
    "caption": "这是为您绘制的架构图"
  }
}

```

---

## 4. 二进制音频帧 (Binary Frame)

为了极致性能，音频不包装 JSON，直接发送二进制数据。

* **数据内容**：原始音频切片（使用 Opus 或 MP3 编码）。
* **前端识别**：在 `onmessage` 中，通过 `event.data instanceof ArrayBuffer` 来识别并直接送入播放队列。

---

## 5. 交互案例流程演示

### 场景：用户发送图片并询问“这是什么”，Agent 搜索后回答并语音播报。

1. **C -> S (Text Frame)**:
`{"type": "query", "payload": {"text": "这是什么？", "images": [...]}}`
2. **S -> C (Text Frame)**:
`{"type": "status", "payload": {"state": "analyzing", "detail": "正在识别图片..."}}`
3. **S -> C (Text Frame)**:
`{"type": "status", "payload": {"state": "searching", "detail": "正在搜索相关信息..."}}`
4. **S -> C (Text Frame)**:
`{"type": "text_chunk", "payload": {"content": "这是一只", "is_final": false}}`
5. **S -> C (Binary Frame)**:
`[Binary Data: "这是一只" 的音频分片]`
6. **S -> C (Text Frame)**:
`{"type": "text_chunk", "payload": {"content": "罕见的雪豹。", "is_final": true}}`
7. **S -> C (Binary Frame)**:
`[Binary Data: "罕见的雪豹。" 的音频分片]`
8. **S -> C (Text Frame)**:
`{"type": "status", "payload": {"state": "idle"}}`


