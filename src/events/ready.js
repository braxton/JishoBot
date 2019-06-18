const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "ready"
    });
  }

  execute(ctx = null) {
    console.log('Ready');

    this.client.gameInterval = setInterval(() => {
      this.client.user.setActivity(`${this.client.config['discord']['prefix']}lookup ありがとう`)
    }, 5 * 60 * 1000);
  }
};