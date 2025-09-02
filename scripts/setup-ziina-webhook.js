// scripts/setup-ziina-webhook.js
require('dotenv').config({ path: '.env' })

const ZIINA_API_URL = process.env.ZIINA_API_URL
const ZIINA_API_KEY = process.env.ZIINA_API_KEY
const ZIINA_WEBHOOK_URL = process.env.ZIINA_WEBHOOK_URL // Your ngrok or production URL
const ZIINA_WEBHOOK_SECRET = process.env.ZIINA_WEBHOOK_SECRET

async function setupZiinaWebhook() {
  if (!ZIINA_API_KEY) {
    console.error('❌ ZIINA_API_KEY is required')
    process.exit(1)
  }

  if (!ZIINA_WEBHOOK_URL) {
    console.error('❌ ZIINA_WEBHOOK_URL is required')
    console.log('Set ZIINA_WEBHOOK_URL=https://your-domain.com/api/webhooks/ziina')
    process.exit(1)
  }

  if (!ZIINA_WEBHOOK_SECRET) {
    console.error('❌ ZIINA_WEBHOOK_SECRET is required')
    process.exit(1)
  }

  console.log('🔧 Setting up Ziina webhook...')
  console.log('📍 Webhook URL:', ZIINA_WEBHOOK_URL)

  try {
    const response = await fetch(`${ZIINA_API_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZIINA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: ZIINA_WEBHOOK_URL,
        secret: ZIINA_WEBHOOK_SECRET
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Failed to set up webhook:', errorData)
      process.exit(1)
    }

    const result = await response.json()
    console.log('✅ Webhook configured successfully!')
    console.log('📝 Response:', result)

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message)
    process.exit(1)
  }
}

setupZiinaWebhook()