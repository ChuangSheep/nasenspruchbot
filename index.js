// Require the necessary discord.js classes
const { Client, IntentsBitField, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [IntentsBitField.Flags.Guilds,IntentsBitField.Flags.GuildMessages] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});


client.on('interactionCreate', async interaction => {
	if (!(interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand())) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction,client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.APP_TOKEN);