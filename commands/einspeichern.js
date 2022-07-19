const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require("axios").default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('einspeichern')
    .setDescription('Speichern die letzte Nachricht (eine|s Nutzers|in) als ihren/seinen Nasenspruch ein!')
    .addUserOption(option => option.setName('target').setDescription('Wem gehört denn dieser Nasenspruch?')),
  async execute(interaction, client) {
    user = interaction.options.getUser("target");

    channelId = interaction.channelId;
    channel = await client.channels.fetch(channelId);

    // find last sent message
    msgs = await channel.messages.fetch({ limit: 6 });
    let lastMessage = msgs.first();
    if (user) {
      for (const msg of msgs) {
        if (msg[1].author.id === user.id) {
          lastMessage = msg[1];
          break;
        }
      }
    }

    // check if creterias are fulfilled
    // timeout < 30s
    if (Date.now() - lastMessage.createdTimestamp > 30000) {
      await interaction.reply(`Die letzte Nachricht war leider zu lange her.`);
      console.log(`[INFO] (einspeichern) Fail: MSG timed out.`);
      return;
    }


    if (!lastMessage.author.bot && lastMessage.content) {
      // get displayname
      const guild = await client.guilds.cache.get(lastMessage.guildId);
      const gmember = await guild.members.fetch(lastMessage.author.id);
      const displayname = gmember.displayName;


      // Database communication
      let res = await axios.post(`${process.env.API_BASE_URL}`, {
        userid: lastMessage.author.id,
        susername: displayname,
        scontent: lastMessage.content
      }, {
        headers: {
          Authorization: `Bearer ${process.env.DATABASE_TOKEN}`,
        }
      }
      )

      // response msg
      await interaction.reply(`"${lastMessage.content}" von "${displayname}" ist eingespeichert.`);
      console.log(`[INFO] (einspeichern) Success: Saved '${lastMessage.content}' by ${lastMessage.author.id} (${displayname})`);
    }
    else {
      // cannot find content
      await interaction.reply(`Leider konnte kein gültiger Nasenspruch gefunden werden.`);
      console.log(`[INFO] (einspeichern) Fail: No MSG fetched.`);
    }
  },
};
