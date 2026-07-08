import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";

export const get_block: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_block',
            description: `Gets information of a block at a certain position.`,
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
            return `Block at X: ${x}, Y: ${y}, Z: ${z} is air.`;
        }

        const res =  `Name: ${block.name}
Displayname: ${block.displayName}
Hardness: ${block.hardness}
Transparent: ${block.transparent}

${block.getSignText ? `Sign Text: \"${block.getSignText().join('\n')}\"` : ''}
        `

        console.log(res)

        return res;
    }
}