import mineflayer from "mineflayer";
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder'

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

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

bot.on('message', async message => {
    const translate = message.translate;

    if (!translate) return;

    const texts: string[] = message.json.with.map((w: any) => w.text as string);

    switch (translate) {
        case '<%s> %s': // chat
        {
            const [username, msg] = texts
            console.log(`<${username}> ${msg}`);

            if (username === bot.username) return;

            const res = await agent.respond(username!, msg!);
            bot.chat(String(res).toString())

            break;
        }

        case '%s whispers to you: %s': // whisper
        {
            const [username, msg] = texts
            console.log(message.toAnsi());

            if (username === bot.username) return;

            const res = await agent.respond(username!, msg!, true);
            bot.chat(String(res).toString())

            break;
        }

        case 'You whisper to %s: %s':
            console.log(message.toAnsi())

            break;

        case 'multiplayer.player.joined':
        {
            const [username] = texts

            console.log(message.toAnsi())

            break;
        }

        case 'multiplayer.player.left':
        {
            const [username] = texts

            console.log(message.toAnsi())

            break;
        }

        default:
            // system message
            console.log(message);

            break;
    }
})

bot.loadPlugin(pathfinder)