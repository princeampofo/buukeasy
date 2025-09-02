# BuukEasy

A modern booking and payment management application built with Next.js, featuring seamless integration with Ziina payments and real-time webhook processing.

## Features

- 🚀 **Next.js 14** with App Router
- 🗄️ **Prisma ORM** for database management
- 💳 **Ziina Payment Integration** with webhooks
- 🔄 **Real-time webhook processing**
- 🛡️ **Secure webhook signature validation**

## Tech Stack

- **Framework:** Next.js 14
- **Database:** PostgreSQL/MySQL (via Prisma)
- **ORM:** Prisma
- **Payment Gateway:** Ziina
- **Runtime:** Node.js

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- A database (PostgreSQL or MySQL)
- A Ziina merchant account and API credentials
- ngrok (for local webhook testing) or a deployed webhook endpoint

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd buukeasy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/buukeasy"
   # or for MySQL: DATABASE_URL="mysql://username:password@localhost:3306/buukeasy"

   #JWT
   JWT_SECRET="your_jwt_secret_here"

   # Ziina Payment Gateway
   ZIINA_API_URL="https://api-v2.ziina.com/api"
   ZIINA_API_KEY="your_ziina_api_key_here"
   ZIINA_WEBHOOK_URL="https://your-domain.com/api/webhooks/ziina"
   # or for local development: ZIINA_WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/webhooks/ziina"
   ZIINA_WEBHOOK_SECRET="your_webhook_secret_here"

   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"

   # Optional: Additional environment variables
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push
   # or for production: npx prisma migrate deploy

   ```

5. **Configure Ziina webhook**
   ```bash
   # Run the webhook setup script
   node scripts/setup-ziina-webhook.js
   ```

## Development

1. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local Webhook Testing

For local development with webhooks:

1. **Install and start ngrok**
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```

2. **Update your `.env.local`**
   ```env
   ZIINA_WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/webhooks/ziina"
   ```

3. **Re-run the webhook setup**
   ```bash
   node scripts/setup-ziina-webhook.js
   ```

## Database Management

### Prisma Commands

```bash
# Reset the database
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name your_migration_name
```

## API Routes

### Webhook Endpoints

- `POST /api/webhooks/ziina` - Handles Ziina payment webhooks

### Example webhook payload handling:

The app automatically processes Ziina webhooks for:
- Payment confirmations
- Payment failures
- Payment cancellation

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | ✅ | `postgresql://user:pass@localhost:5432/buukeasy` | 
| `JWT_SECRET`   | JWT secret | ✅ | Random string  |
| `ZIINA_API_URL` | Ziina API base URL | ✅ | `https://api-v2.ziina.com/api` |
| `ZIINA_API_KEY` | Your Ziina API key | ✅ | `zk_live_...` or `zk_test_...` |
| `ZIINA_WEBHOOK_URL` | Your webhook endpoint URL | ✅ | `https://yourdomain.com/api/webhooks/ziina` |
| `ZIINA_WEBHOOK_SECRET` | Webhook signature secret | ✅ | `whsec_...` |
| `NEXTAUTH_URL` | Your app's URL | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | ✅ | Random string |
| `NODE_ENV` | Environment mode | ❌ | `development` or `production` |