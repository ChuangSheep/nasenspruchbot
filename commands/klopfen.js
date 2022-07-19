const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require("axios").default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('klopfen')
    .setDescription('Der Nasenspruch von der Person vortragen!')
    .addUserOption(option => option
      .setName('target')
      .setDescription('Wem gehört denn dieser Nasenspruch?')
      .setRequired(true)),
  async execute(interaction, client) {
    user = interaction.options.getUser("target");
    userid = user.id;

    // Database communication
    try {
      let res = await axios.get(`${process.env.API_BASE_URL}?userid=${userid}`,{
        headers: {
          Authorization: `Bearer ${process.env.DATABASE_TOKEN}`,
        }
      }
      );

      if (res) {
        await interaction.reply(`"${res.data.scontent}" -- ${res.data.susername}`);
        console.log(`[INFO] (klopfen) Success: Replied '${JSON.stringify(res.data)}'`);
      }
      else {
        await interaction.reply(`Unbekannter Fehler.`);
        console.log(`[INFO] (klopfen) Fail: Unknown failure.`);
      }
    } catch (e) {
      if (e.response.status === 404) {
        await interaction.reply(`Für die gegebenen Person wurde noch kein Nasenspruch gespeichert.`);
        console.log(`[INFO] (klopfen) Fail: No MSG fetched from API.`);
      }
      else {
        throw e;
      }
    }
  },
};
