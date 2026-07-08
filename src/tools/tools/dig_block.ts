import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";

export const dig_block: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'dig_block',
            description: `Digs a block at a certain position.`,
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
                    }
                },
                required: ['x', 'y', 'z'],
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;

        const { x, y, z } = args as {
            x: number;
            y: number;
            z: number;
        }

        const block = bot.blockAt(new Vec3(x, y, z));

        if (!block) {
            return `No block at X: ${x}, Y: ${y}, Z: ${z}`;
        }

        const defaultMove = new Movements(bot)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 3))

        await bot.dig(block)

        return `Mined block (${block.name}) at X: ${x}, Y: ${y}, Z: ${z}`
    }
}