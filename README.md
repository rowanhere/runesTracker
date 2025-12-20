# Telegram Notification Server

A Node.js Express backend server that sends recurring Telegram notifications every 10 minutes.

## Features

- ✅ Express HTTP server
- ✅ Recurring tasks using node-cron (every 10 minutes)
- ✅ Telegram bot integration
- ✅ Health check endpoint
- ✅ Custom notification API
- ✅ Error handling and logging
- ✅ Graceful shutdown

## Prerequisites


```bash
npm install

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PORT=3000
NODE_ENV=development
```

### How to Get Telegram Credentials

1. **Bot Token**: Message [@BotFather](https://t.me/botfather) on Telegram and create a new bot
2. **Chat ID**: Message your bot, then visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` to find your chat ID

## Running the Server

### Development (with auto-reload)

# runesTracker

Tracks Rune tokens across exchanges, detects price differences, and sends clean Telegram alerts with inline trade buttons.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
PORT=3000
```

## Run

```bash
npm run dev
```

Hit `GET /` to evaluate all configured Rune tokens and send alerts if criteria are met.

### Production

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T10:30:00.000Z",
  "tasks": ["health-check"]
}
```

### Send Custom Notification

```bash
curl -X POST http://localhost:3000/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Alert",
    "message": "This is a test notification"
  }'
```

## Customizing Tasks

Edit [src/index.js](src/index.js) in the `setupTasks()` function to add your own recurring tasks:

```javascript
// Example: Custom task every 10 minutes
scheduler.scheduleEvery10Minutes(async () => {
  const data = await fetchSomeData();
  await telegramBot.sendNotification('Data Update', `Latest data: ${data}`);
}, 'data-fetch-task');

// Example: Custom schedule (every hour)
scheduler.schedule('0 * * * *', async () => {
  await telegramBot.sendNotification('Hourly Task', 'This runs every hour');
}, 'hourly-task');
```

## Cron Expressions

Common cron expressions:
- `*/10 * * * *` - Every 10 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight
- `0 0 * * 0` - Weekly (Sunday)
- `0 0 1 * *` - Monthly

## Project Structure

```
src/
├── index.js          # Main server file
├── telegram.js       # Telegram bot wrapper
└── scheduler.js      # Task scheduler
```

## License

ISC
