import { Telegraf } from 'telegraf';
import { checkPriceDifference, formatPriceAlert } from './priceMonitor.js';

class TelegramBot {
  constructor(botToken, chatId) {
    this.bot = new Telegraf(botToken);
    this.chatId = chatId;
    this.tokens = [];
    this.setupCallbackHandlers();
    this.setupCommands();
  }

  setupCallbackHandlers() {
    // Handle "done" button clicks
    this.bot.action('done', async (ctx) => {
      try {
        await ctx.deleteMessage();
        console.log('✓ Message deleted via done button');
      } catch (error) {
        console.error('✗ Failed to delete message:', error.message);
      }
    });

    // Handle "Get Alert" button clicks
    this.bot.action('get_alert', async (ctx) => {
      try {
        const chatId = ctx.chat?.id || this.chatId;
        await ctx.answerCbQuery('Fetching alerts…');
        await this.sendAlerts(chatId, ctx);
      } catch (error) {
        console.error('✗ Failed to fetch alerts:', error.message);
      }
    });
  }

  setupCommands() {
    this.bot.start(async (ctx) => {
      const chatId = ctx.chat?.id || this.chatId;
      const text = 'Welcome! Tap the button to get current alerts.';
      try {
        await ctx.telegram.sendMessage(chatId, text, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Get Alert', callback_data: 'get_alert' }]
            ]
          }
        });
      } catch (error) {
        console.error('✗ Failed to send start message:', error.message);
      }
    });

    // Command: /getalert
    this.bot.command('getalert', async (ctx) => {
      const chatId = ctx.chat?.id || this.chatId;
      await this.sendAlerts(chatId, ctx);
    });
  }

  async sendAlerts(chatId, ctx) {
    if (!this.tokens || this.tokens.length === 0) {
      await ctx.telegram.sendMessage(chatId, 'No tokens configured for alerts.');
      return;
    }

    let alertsSent = 0;
    for (const tokenId of this.tokens) {
      try {
        const priceData = await checkPriceDifference(tokenId);
        if (priceData && priceData.shouldNotify) {
          const message = formatPriceAlert(priceData);
          const buttonText = `Trade on ${priceData.lowest.exchange}`;
          const buttonUrl = priceData.lowest?.exchangeUrl || `https://www.coingecko.com/en/coins/${tokenId}`;
          await ctx.telegram.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [{ text: buttonText, url: buttonUrl }],
                [{ text: '✅ Done', callback_data: 'done' }]
              ]
            }
          });
          alertsSent++;
        }
      } catch (err) {
        console.error(`✗ Error checking ${tokenId}:`, err.message);
      }
    }

    if (alertsSent === 0) {
      await ctx.telegram.sendMessage(chatId, 'No significant alerts right now.');
    }
  }

  setTokens(tokens) {
    this.tokens = Array.isArray(tokens) ? tokens : [];
  }

  async start() {
    try {
      await this.bot.launch();
      const botInfo = await this.bot.telegram.getMe();
      console.log(`✓ Telegram bot connected: @${botInfo.username}`);

      // Register bot commands for discoverability in Telegram clients
      try {
        await this.bot.telegram.setMyCommands([
          { command: 'start', description: 'Show menu' },
          { command: 'getalert', description: 'Fetch current alerts' }
        ]);
      } catch (e) {
        console.warn('⚠️ Could not set bot commands:', e.message);
      }
    } catch (error) {
      console.error('✗ Failed to connect Telegram bot:', error.message);
      throw error;
    }
  }

  async sendMessage(text) {
    try {
      const message = await this.bot.telegram.sendMessage(this.chatId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      console.log('✓ Message sent successfully:', message.message_id);
      return message;
    } catch (error) {
      console.error('✗ Failed to send message:', error.message);
      throw error;
    }
  }

  async sendMessageWithButton(text, buttonText, url) {
    try {
      const message = await this.bot.telegram.sendMessage(this.chatId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: buttonText, url }],
            [{ text: '✅ Done', callback_data: 'done' }]
          ]
        }
      });
      console.log('✓ Message with button sent:', message.message_id);
      return message;
    } catch (error) {
      console.error('✗ Failed to send message with button:', error.message);
      throw error;
    }
  }

  async sendNotification(title, message) {
    const fullMessage = `<b>${title}</b>\n\n${message}`;
    return this.sendMessage(fullMessage);
  }

  async stop() {
    try {
      await this.bot.stop();
      console.log('✓ Telegram bot stopped');
    } catch (error) {
      console.error('✗ Error stopping bot:', error.message);
    }
  }
}

export default TelegramBot;
