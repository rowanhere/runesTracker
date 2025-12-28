import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';
import TelegramBot from './telegram.js';
import { checkPriceDifference, formatPriceAlert } from './priceMonitor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// List of rune tokens to monitor
const RUNES = [
  "rune-pups",
  "memento-mori",
  "decentralized-runes",
  "gizmo-imaginary-kitten-runes",
  "billion-dollar-cat-runes",
  "magic-internet-money-runes",
  "runecoin",
  "dog-go-to-the-moon-rune",
  "lobo-the-wolf-pup-runes",
  "liquidium-token"
];

// Initialize Telegram Bot
const telegramBot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID
);
// Provide tokens list to the Telegram bot for on-demand alerts
telegramBot.setTokens(RUNES);

// Start Telegram bot
telegramBot.start().catch(error => {
  console.error('Failed to start bot:', error);
});

app.get('/', async (req, res) => {
  try {
    let alertsSent = 0;
    let tokensChecked = 0;
    
    // Check each rune token
    for (const tokenId of RUNES) {
      try {
        const priceData = await checkPriceDifference(tokenId);
        tokensChecked++;
        
        if (priceData && priceData.shouldNotify) {
          const message = formatPriceAlert(priceData);
          const buttonText = `Trade on ${priceData.lowest.exchange}`;
          const buttonUrl = priceData.lowest?.exchangeUrl || `https://www.coingecko.com/en/coins/${tokenId}`;
          
          alertsSent++;
          
          // Fire and forget - don't await the Telegram send
          telegramBot
            .sendMessageWithButton(message, buttonText, buttonUrl)
            .then(() => {
              console.log(`✅ Alert sent for ${priceData.tokenName}!`);
            })
            .catch(err => {
              console.error(`❌ Failed to send alert for ${priceData.tokenName}:`, err.message);
            });
        } else if (priceData) {
          console.log(`ℹ️ ${priceData.tokenName}: No significant price difference (${priceData.priceDiff.toFixed(2)}%)`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${tokenId}:`, error.message);
      }
    }
    
    res.json({ 
      success: true,
      tokensChecked,
      alertsSent
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;
