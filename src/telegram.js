import { Telegraf } from 'telegraf';

class TelegramBot {
  constructor(botToken, chatId) {
    this.bot = new Telegraf(botToken);
    this.chatId = chatId;
  }

  async start() {
    try {
      await this.bot.launch();
      const botInfo = await this.bot.telegram.getMe();
      console.log(`✓ Telegram bot connected: @${botInfo.username}`);
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
            [{ text: buttonText, url }]
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
