import mineflayer from "mineflayer";
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder'

import {OpenAI} from "openai";
import {Agent} from "./Agent.ts";
import {LLM} from "./LLM.ts";
import {
    AgentJoinedObservation,
    ChatObservation, NightObservation,
    PlayerJoinedObservation,
    PlayerLeftObservation
} from "./observation/Observation.ts";

const bot = mineflayer.createBot({
    host: 'localhost',
    username: 'Bot2',
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

            agent.observe(new ChatObservation(username!, msg!))

            break;
        }

        case '%s whispers to you: %s': // whisper
        {
            const [username, msg] = texts
            console.log(message.toAnsi());

            if (username === bot.username) return;

            agent.observe(new ChatObservation(username!, msg!));

            break;
        }

        case 'You whisper to %s: %s': // whisper (self)
            console.log(message.toAnsi())

            break;

        case 'multiplayer.player.joined': // player joined
        {
            const [username] = texts

            console.log(message.toAnsi())

            agent.observe(new PlayerJoinedObservation(username!))

            break;
        }

        case 'multiplayer.player.left': // player left
        {
            const [username] = texts

            console.log(message.toAnsi())

            agent.observe(new PlayerLeftObservation(username!))

            break;
        }

        default:
            // system message
            console.log(message.toAnsi());

            break;
    }
})

bot.once('spawn', () => {
    agent.observe(new AgentJoinedObservation())


    setInterval(() => {
        console.log(agent.pressure);
        agent.requestThinking().then(m => {
            if (m) {
                console.log(m);
            }
        })
    }, 5000)
})

let day = true

bot.on('time', () => {
    if (day !== bot.time.isDay) {
        day = bot.time.isDay;

        if (day) {
            // day observation ???
        } else {
            agent.observe(new NightObservation())
        }
    }
})

bot.loadPlugin(pathfinder)