require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const gameTrack = {};

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    const user = newPresence.user;
    const member = newPresence.member;

    console.log(`${user.username}'s activities:`, newPresence.activities.map(activity => `${activity.type}: ${activity.name}`));

    const game = newPresence.activities.find(activity => activity.name === 'League of Legends'); ///activity.type === 0 ||

    if (game) {
        console.log(`${user.username} is currently playing: ${game.name}`);
        if (!gameTrack[user.id]) {
            console.log(`Started tracking ${user.username} playing ${game.name}`);
            gameTrack[user.id] = { startTime: Date.now(), gameName: game.name, warned: false };
        } else if (gameTrack[user.id].gameName !== game.name) {
            console.log(`${user.username} switched to a different game: ${game.name}`);
            gameTrack[user.id] = { startTime: Date.now(), gameName: game.name, warned: false };
        }

        const elapsedTime = (Date.now() - gameTrack[user.id].startTime) / 1000; 

        if (elapsedTime > 60 && !gameTrack[user.id].warned) { 
            const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
            if (channel) {
                member.voice.disconnect(`You have been playing ${gameTrack[user.id].gameName} for more than 1 minute.`);
                channel.send(`Warning: <@${member.id}> has been playing ${gameTrack[user.id].gameName} for more than 1 minute. sir dwech chwya`);
            } else {
                console.log('General channel not found.');
            }
        }

        gameTrack[user.id].warned = true;
    } else {
        if (gameTrack[user.id]) {
            console.log(`${user.username} stopped playing.`);
            delete gameTrack[user.id];
        } else {
            console.log(`No playing activity detected for ${user.username}.`);
        }
    }
});

client.login(TOKEN);
