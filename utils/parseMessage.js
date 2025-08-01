// utils/parseMessage.js
const chrono = require('chrono-node')
const puppeteer = require('puppeteer')

// Puppeteer 擷取 591 資料
async function fetch591Info(url) {
  const browser = await puppeteer.launch({
    headless: 'new', // 避免無頭模式被擋
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36'
  )

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

  // 擷取資料：標題、租金、地址、格局、樓層等
  const data = await page.evaluate(() => {
    const getText = selector =>
      document.querySelector(selector)?.innerText?.trim() || ''

    return {
      title: getText('.house-title'), // 標題
      price: getText('.price span'), // 價格
      address: getText('.house-address span'), // 地址
      layout: getText('.house-pattern span'), // 格局
      floor: getText('.house-floor span'), // 樓層
      area: getText('.house-area span'), // 坪數
      contact: getText('.contact-name') // 聯絡人
    }
  })

  await browser.close()
  return data
}

function parseMessage(text) {
  const result = {
    date: null,
    endDate: null,
    location: '',
    detail: '',
    url: ''
  }

  // 1. 擷取網址（如果有的話）
  const urlMatch = text.match(/https?:\/\/\S+/)
  if (urlMatch) {
    result.url = urlMatch[0]

    if (result.url.includes('591.com.tw')) {
      try {
        const fetch591InfoResult = fetch591Info(result.url)
        detail = detail.replace(fetch591InfoResult, '') // 把網址從文字中移除
      } catch (error) {
        console.error('處理 591 租屋資訊擷取錯誤:', error)
      }
    }

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
