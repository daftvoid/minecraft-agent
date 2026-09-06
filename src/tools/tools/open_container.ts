import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";
import {Formatter} from "../../utils/Formatter.ts";

export const open_container: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'open_container',
            description: `Opens a container.`,
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

        const block = bot.blockAt(new Vec3(x, y, z))

        if (!block || block.name === "air") {
            return `No block at that position found.`
        }

        if (block.position.distanceTo(bot.entity.position.clone() as Vec3) > 5) {
            return 'Block is too far away.'
        }

        console.log(block)


        const window = await bot.openBlock(block)


        const items = window.containerItems()

        const res = `Opened container at X: ${x}, Y: ${y}, Z: ${z}
Contents:
${items.map(Formatter.formatItem).map(s => `- ${s}`).join('\n')}`

        return res;
    }
}