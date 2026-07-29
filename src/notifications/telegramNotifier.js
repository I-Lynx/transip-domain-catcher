const axios = require('axios');

class TelegramNotifier {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
  }

  async send(message) {
    if (!this.token || !this.chatId) {
      console.log('📵 Telegram is niet geconfigureerd.');
      return;
    }

    try {
      console.log('📱 Sending Telegram notification...');

      const response = await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML'
        }
      );

      console.log(`✅ Telegram notification sent (${response.status})`);
    } catch (error) {
      console.error('❌ Telegram notification failed');

      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }
    }
  }
}

module.exports = new TelegramNotifier();
