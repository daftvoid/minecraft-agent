import type {Tool} from "../Tool.ts";
import {get_player_position} from "./get_player_position.ts";
import {move_near} from "./move_near.ts";

export const move_near_player: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'move_near_player',
            description: `
            Moves near a player. Use this instead of calling \`get_player_position\` and \`move_near\` separately.
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

        const player = entities.find(e => e.type === 'player' && e.username === playername)

        if (!player) {
            return `Player does not exist or is out of reach.`
        }

        const pos = player.position.clone()

        return await move_near.execute({x: pos.x, y: pos.y, z: pos.z}, ctx)
    }
}