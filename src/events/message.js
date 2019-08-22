const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "message"
    });
  }

  async execute(ctx = null) {
    if (ctx.author.bot) return;

    if (!ctx.content.startsWith(this.client.config['discord']['prefix'])) return;

    const content = ctx.content.slice(this.client.config['discord']['prefix'].length);

    const command = await this.fetchCommand(content.split(' ')[0]);
    if (!command) return;

    console.log(`CMD EXE: ${command.name} | ${ctx.author.tag} (${ctx.author.id})`);

    return command.execute(ctx);
  }

  fetchCommand(text) {
    return new Promise((resolve, reject) => {
      if (this.client.commands.has(text)) return resolve(this.client.commands.get(text));
      this.client.commands.forEach(c => { if (c.aliases && c.aliases.includes(text)) return resolve(c); });
      return resolve();
    });
  }
};
