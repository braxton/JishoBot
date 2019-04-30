const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "ready"
    });
  }

  execute(ctx = null) {
    console.log('Ready');
  }
};