const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageReactionAdd"
    });
  }

  execute(reaction, user) {
    if (user.id === this.client.user.id) return;
    const message = reaction.message;

    if (message.author.id !== this.client.user.id) return;
    if (!message.embeds.length) return;
    reaction.users.remove(user);

    const embed = message.embeds[0];
    
    const searchTerm = /(.+) - Jisho Entry/.exec(embed.title);
    const pages = /Page (\d+) of (\d+)/.exec(embed.footer.text);
    if (!searchTerm || !pages) return;

    switch (reaction.emoji.name) {
      case "⬅":
        pages[1]--;
        if (pages[1] < 1) pages[1] = pages[2];
        break;
      case "➡":
        pages[1]++;
        if (pages[1] > pages[2]) pages[1] = 1;
        break;
      default:
        pages[1] = null;
    }

    if (pages[1] === null) return;

    const lookupCMD = this.client.commands.get('lookup');
    const data = await lookupCMD.fetchJisho(searchTerm[1], pages[1]);
    if (!data) return message.channel.send(`An error occurred while changing page on message ${message.id}.`);

    const embed = lookupCMD.buildEmbed(searchTerm[1], pages[1], data);

    message.edit({ embed });
  }
};