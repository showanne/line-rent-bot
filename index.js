// index.js
require('dotenv').config()
const express = require('express')
const { middleware, Client } = require('@line/bot-sdk')

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

  return lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `你輸入的是：${userText}`
  })
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`伺服器啟動，監聽在 http://localhost:${port}`)
})
