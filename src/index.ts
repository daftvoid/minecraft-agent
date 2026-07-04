import mineflayer from "mineflayer";
import {OpenAI} from "openai";
import {Agent} from "./Agent.ts";
import {LLM} from "./LLM.ts";

const bot = mineflayer.createBot({
    host: 'localhost',
    username: 'Bot',
    auth: 'offline'
    // port: 25565,
})

const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ignored'
});

const llm = new LLM(client, 'gpt-oss:120b-cloud');

const agent = new Agent({
    bot,
    llm
})

bot.on('chat', async (username, message) => {
    console.log(`<${username}> ${message}`);

    if (username === bot.username) return;
    if (username === 's') return;

    const res = await agent.respond(username, message);

    bot.chat(res ?? '')
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)