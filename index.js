// index.js
require('dotenv').config()
const express = require('express')
const { middleware, Client } = require('@line/bot-sdk')
const { parseMessage } = require('./utils/parseMessage')

const app = express()

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

const lineClient = new Client(config)

app.post('/webhook', middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err)
      res.status(500).end()
    })
})

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }

  const userText = event.message.text

  const { date, endDate, location, url } = parseMessage(userText)

  // 判斷結果是否正確
  if (!date || !location) {
    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '⚠️ 抱歉，我無法從你的訊息中找到時間與地點。請輸入格式像這樣：「7/30 下午3點 台北市中正區重慶南路一段122號 http://example.com」'
    })
  }

  // 測試結果用文字輸出
  const response = `
📅 看房時間：${formatDateTime(date.toLocaleString())}
📍 地點：${location}
📍 詳細資訊：${location}
       標題：${title}
       租金：${price}
       地址：${address}
       格局：${layout}
       樓層：${floor}
       坪數：${area}
       聯絡：${contact}
🔗 網址：${url || '無'}
  `.trim()

  return lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: response
  })
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr)

  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 月份從 0 開始
  const day = date.getDate()

  // 取得星期（去掉「週」）
  const weekday = new Intl.DateTimeFormat('zh-TW', { weekday: 'short' })
    .format(date)
    .replace('週', '')

  // 取得 24 小時制時間
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${year}/${month}/${day}(${weekday}) ${hours}:${minutes}`
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`伺服器啟動，監聽在 http://localhost:${port}`)
})
