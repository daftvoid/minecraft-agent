import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";

export const move_near: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'move_near',
            description: `
            Moves the agent near a position. Automatically pathfinds there.
            `,
            parameters: {
                type: 'object',
                properties: {
                    x: {
                        type: 'integer',
                        description: "X position"
                    },
                    y: {
                        type: 'integer',
                        description: "Y position"
                    },
                    z: {
                        type: 'integer',
                        description: "Z position"
                    },
                    range: {
                        type: 'integer',
                        description: "How near to move in blocks, default: 1"
                    }
                },
                required: ['x', 'y', 'z'],
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;

        const defaultMove = new Movements(bot)

        const { x, y, z, range } = args as any

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, range ?? 1))

        const pos = bot.entity.position.clone()

        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2) + Math.pow(z - pos.z, 2))

        return `Status: Moving

Target X: ${x}
Target Y: ${y}
Target Z: ${z}

Moving Distance: ${distance.toFixed(2)}`;
    }
}