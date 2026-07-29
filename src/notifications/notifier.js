const telegram = require('./telegramNotifier');

class Notifier {
  async send(message) {
    if (process.env.NOTIFICATION_ENABLED !== 'true') {
      return;
    }

    return telegram.send(message);
  }
}

module.exports = new Notifier();
