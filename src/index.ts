import mineflayer from "mineflayer";

const bot = mineflayer.createBot({
    host: 'localhost',
    username: 'Bot',
    auth: 'offline'
    // port: 25565,
})

bot.on('chat', (username, message) => {
    if (username === bot.username) return
    bot.chat(message)
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)