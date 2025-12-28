# Runes Tracker

Tracks Rune tokens across exchanges, detects price differences, and sends clean Telegram alerts with inline trade buttons.

## Features

- ✅ Telegram bot integration (Telegraf)
- ✅ Recurring tasks using node-cron (every 10 minutes)
- ✅ Error handling and logging

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
NODE_ENV=production
```

### How to Get Telegram Credentials

1. **Bot Token**: Message [@BotFather](https://t.me/botfather) on Telegram and create a new bot
2. **Chat ID**: Message your bot, then visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` to find your chat ID

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

Start the Telegram bot (long polling):

```bash
npm start
```

## API Endpoints

This bot-only build does not expose HTTP endpoints.

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
├── bot.js            # Bot entry (long polling)
├── telegram.js       # Telegram bot wrapper
├── priceMonitor.js   # Price checks + message formatting
└── scheduler.js      # Optional task scheduler
```

## Deployment

### Persistent Node (recommended for long polling)

Use an always-on runtime (Render/Railway/Fly.io/Heroku/EC2/Droplet) and run:

```bash
npm run start-bot
```

Required env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

### Serverless

Serverless platforms are not suitable for long polling. Deploy this bot on a persistent host (Render/Railway/Fly.io/Heroku/VM) or adapt to a webhook-based design separately.

## Docker

### Build

```bash
docker build -t runes-tracker .
```

### Run (Bot mode – long polling)

```bash
docker run -d \
  --name runes-bot \
  --restart unless-stopped \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e TELEGRAM_CHAT_ID=your_chat_id \
  runes-tracker
```

Notes:
- This image runs the bot only (no HTTP server).

## License

ISC
