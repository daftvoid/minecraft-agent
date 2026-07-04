import mineflayer from "mineflayer";
import {OpenAI} from "openai";

const bot = mineflayer.createBot({
    host: 'localhost',
    username: 'Bot',
    auth: 'offline'
    // port: 25565,
})

const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ignored'
})

bot.on('chat', async (username, message) => {
    console.log(`<${username}> ${message}`);

    if (username === bot.username) return

    const res = await client.chat.completions.create({
        model: "granite4:3b",
        messages: [
            { role: 'system', content:
                    `You are a agent in the video game Minecraft.
                     You are directly interacting with the player (in chat) and the minecraft world.
                    
                     Keep your answers really short, do not cross the message length limit of 255 characters.`
            },
            { role: 'system', content: `The name of the player you are talking to is "${username}"`},
            { role: "user", content: message },
        ],

    })

    const aimsg = res.choices[0]!.message.content
    bot.chat(aimsg ?? '')
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)