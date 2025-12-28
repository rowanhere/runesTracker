import dotenv from 'dotenv';
import TelegramBot from './src/telegram.js';

dotenv.config();

// List of rune tokens to monitor
const RUNES = [
  'rune-pups',
  'memento-mori',
  'decentralized-runes',
  'gizmo-imaginary-kitten-runes',
  'billion-dollar-cat-runes',
  'magic-internet-money-runes',
  'runecoin',
  'dog-go-to-the-moon-rune',
  'lobo-the-wolf-pup-runes',
  'liquidium-token'
];

async function main() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('✗ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    process.exit(1);
  }

  const telegramBot = new TelegramBot(botToken, chatId);
  telegramBot.setTokens(RUNES);

  try {
    await telegramBot.start();
    console.log('✓ Bot long-polling started');
  } catch (err) {
    console.error('✗ Failed to start bot:', err.message);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}, stopping bot...`);
    try {
      await telegramBot.stop();
    } catch (_) {}
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
