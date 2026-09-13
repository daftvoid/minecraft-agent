import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";

export const chat: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'chat',
            description: `Sends a message to the chat`,
            parameters: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        description: "Chat Message to send"
                    },
                },
                required: ['message'],
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;

        const { message } = (args as { message: string })

        if (message.length === 0) {
            return 'message cannot be empty!';
        }

        if (message.startsWith('/')) {
            return 'message cannot start with a "/"!'
        }

        bot.chat(message);

        return 'message sent successfully.'
    }
}