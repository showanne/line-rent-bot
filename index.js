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
📅 看房時間：${date.toLocaleString()}
📍 地點：${location}
🔗 網址：${url || '無'}
  `.trim()

  return lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: response
  })
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`伺服器啟動，監聽在 http://localhost:${port}`)
})
