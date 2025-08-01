// utils/parseMessage.js
const chrono = require('chrono-node')
const axios = require('axios')
const cheerio = require('cheerio')
const res = require('child_process').execSync(`curl -s "${urlMatch[0]}"`, {
  encoding: 'utf8'
})

function parseMessage(text) {
  const result = {
    date: null,
    endDate: null,
    location: '',
    url: ''
  }

  // 1. 擷取網址（如果有的話）
  const urlMatch = text.match(/https?:\/\/\S+/)
  // 如果是 591 網址，取得租屋資訊內容
  if (urlMatch && /https?:\/\/(www\.)?591\.com\.tw/.test(urlMatch[0])) {
    // 取得標題
    try {
      const $ = cheerio.load(res)
      // 591 租屋標題通常在 <meta property="og:title" content="...">
      const title = $('meta[property="og:title"]').attr('content')
      if (title) {
        result.location = title
      }
    } catch (e) {
      // 若失敗則略過
    }
  }
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
