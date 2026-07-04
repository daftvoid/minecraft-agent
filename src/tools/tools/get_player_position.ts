import type {Tool} from "../Tool.ts";

export const get_player_position: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_player_position',
            description: `
            Returns the players's current world coordinates.
            Use ONLY when you need the players's current location to answer a question or complete a task.
            `,
            parameters: {
                type: 'object',
                properties: {
                    playername: {
                        type: 'string',
                        description: "Name of the player."
                    }
                },
                required: ['playername'],
            }
        }
    },

    async execute(args, ctx) {
        const entities = Object.values(ctx.bot.entities)

        const playername = (args as any).playername

        console.log(playername);

        const player = entities.find(e => e.type === 'player' && e.username === playername)

        if (!player) {
            return `Player does not exist or is out of reach.`
        }

        const pos = player.position.clone()

        return `X: ${Math.floor(pos.x)}, Y: ${Math.floor(pos.y)}, Z: ${Math.floor(pos.z)}`;
    }
}