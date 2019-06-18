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

    const {data, res} = await this.fetchJisho(match[2], match[1] || null);
    if (!data) return message.reply(`No entries found | **${match[2]}**`);
    
    const embed = this.buildEmbed(match[2], match[1] || 1, res.data.length, data);

    const m = await message.channel.send(res.data.length > 1 ? "Multiple pages detected. Use `--p #` to get alternative data entries" : "", { embed });
    await m.react("⬅");
    await m.react("➡");
  }

  async fetchJisho(term, page = null) {
    let res = await fetch.get(encodeURI(`https://jisho.org/api/v1/search/words?keyword=${term}`));
    if (!res || res.body.meta.status !== 200) return false;
    if (!res.body.data.length) return false;

    res = res.body;

    if (page && page > res.data.length) page = res.data.length;

    return {
      "data" : res.data[(page && res.data.length >= page) ? Number(page) - 1 : 0],
      "raw": res
    }
  }

  buildEmbed(term, page, pageLimit, data) {
    const embed = new MessageEmbed()
      .setTitle(`${term} - Jisho Entry `)
      .setColor(0x3D9A1B)
      .setFooter(`Page ${page} of ${pageLimit} | Made with ❤ by Packer#9020`);
  
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

    return embed;
  }
};