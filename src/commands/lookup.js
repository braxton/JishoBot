const Command = require('../structures/command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('snekfetch');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "lookup",
      aliases: ["look", "lu", "lp"]
    });
  }

  async execute(message) {
    const match = /(?:(?:lookup|look|lu|lp)(?:\s+--?p\s+(\d+))?\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply('**ERROR:** No search term supplied.');

    let res = await fetch.get(encodeURI(`https://jisho.org/api/v1/search/words?keyword=${match[2]}`));
    if (!res || res.body.meta.status !== 200) return message.reply("**ERROR:** Unable to interact with Jisho's API. Try again later.");

    res = res.body;

    if (!res.data) return message.reply(`No entries found | **${match[2]}**`);

    const data = res.data[
      (match[1] && res.data.length >= match[1]) ? Number(match[1]) - 1 : 0
    ];

    const embed = new MessageEmbed()
      .setTitle(`${match[2]} - Jisho Entry `)
      .setColor(0x3D9A1B)
      .setFooter(`Page ${match[1] || 1} of ${res.data.length} | Made with ❤ by Packer#9020`);
    
    embed.addField("Reading", data.japanese[0].word ? `${data.japanese[0].word} ( ${data.japanese[0].reading} )` : data.japanese[0].reading, false);
    embed.addField(
      "JLPT/Wanikani Levels",
      `JLPT: ${data.jlpt.length ? data.jlpt.map(x => /\d/.exec(x)[0]).join(', ') : "N/A"}\nWanikani: ${data.tags.length ? /\d+/.exec(data.tags[0])[0] : "N/A"}`,
      false
    );
    if (data.senses[0].english_definitions.length) embed.addField("Definitions", data.senses[0].english_definitions.join('; '), false);
    if (data.senses[0].parts_of_speech.length) embed.addField("Parts of Speech", data.senses[0].parts_of_speech.join('; '), false);

    if (data.senses[0].restrictions.length) embed.addField("Restrictions", data.senses[0].restrictions.join('; '), true);
    if (data.senses[0].tags.length) embed.addField("Additional Tags", data.senses[0].tags.join('; '), true);
    

    message.channel.send(res.data.length > 1 ? "Multiple pages detected. Use `--p #` to get alternative data entries" : "", { embed });
  }
};