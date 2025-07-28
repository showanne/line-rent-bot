// utils/parseMessage.js
const chrono = require('chrono-node')

function parseMessage(text) {
  const result = {
    date: null,
    endDate: null,
    location: '',
    url: ''
  }

  // 1. 擷取網址（如果有的話）
  const urlMatch = text.match(/https?:\/\/\S+/)
  if (urlMatch) {
    result.url = urlMatch[0]
    text = text.replace(result.url, '') // 把網址從文字中移除
  }

  // 2. 擷取時間（使用 chrono-node）
  const parsed = chrono.parse(text)
  if (parsed.length > 0) {
    const { start } = parsed[0]
    result.date = start.date()
    result.endDate = new Date(result.date.getTime() + 60 * 60 * 1000) // 預設 1 小時看房
    text = text.replace(parsed[0].text, '') // 把時間從文字中移除
  }

  // 3. 剩下的視為地點
  result.location = text.trim()

  return result
}

module.exports = { parseMessage }
