import type {Tool} from "../Tool.ts";

export const leave_game: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'leave_game',
            description: `
            Using this will leave the game/server you're in.
            `,
        }
    },

    async execute(args, ctx) {
        ctx.bot.end()

        return `Left the Server.`;
    }
}