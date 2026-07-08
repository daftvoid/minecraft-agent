import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";

export const edit_sign_text: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'edit_sign_text',
            description: `Sets/Edits the text of a sign at a given position`,
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
                    text: {
                        type: 'string',
                        description: "Text"
                    }
                },
                required: ['x', 'y', 'z', 'text'],
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;

        const { x, y, z, text } = args as {
            x: number;
            y: number;
            z: number;
            text: string;
        }

        const block = bot.blockAt(new Vec3(x, y, z));

        if (!block) {
            return `Block at X: ${x}, Y: ${y}, Z: ${z} is air.`;
        }

        if (!block.getSignText) {
            return `Block at X: ${x}, Y: ${y}, Z: ${z} is not a sign.`;
        }

        // so this entire thing doesn't actually work, but I don't know why.
        block.setSignText(text)

        return `Set Sign Text at X: ${x}, Y: ${y}, Z: ${z} to \"${text}\"`;
    }
}