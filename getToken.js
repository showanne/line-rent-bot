// getToken.js
const { google } = require('googleapis')
const readline = require('readline')
require('dotenv').config()

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // 適用於 CLI 授權
)

const SCOPES = ['https://www.googleapis.com/auth/calendar']

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES
})

console.log('請前往此網址授權：', authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
rl.question('輸入授權後的代碼：', code => {
  rl.close()
  oAuth2Client
    .getToken(code)
    .then(({ tokens }) => {
      console.log('\n✅ 取得的 Token：')
      console.log(tokens)
    })
    .catch(console.error)
})
