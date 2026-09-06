import type {Tool} from "../Tool.ts";

export const find_blocks: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'find_blocks',
            description: `Finds all blocks of a type near the bot. Default radius: 50, default count: 25`,
            parameters: {
                type: 'object',
                properties: {
                    block: { type: 'string' },
                    radius: { type: 'number' },
                    count: { type: 'number' }
                },
                required: ['block']
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;
        const { block, radius, count } = args as { block: string, radius?: number, count?: number }

        const blocks = bot.findBlocks({
            count: count ?? 25,
            matching: (b) => {return b.name === block},
            maxDistance: radius ?? 50,
            point: undefined,
            useExtraInfo: undefined
        })

        if (blocks.length === 0) {
            return `No matching blocks of type "${block}" found.`
        }

        return `Found ${blocks.length} blocks of type "${block}" at: \n${blocks.map(v => `{X: ${v.x}, Y: ${v.y}, Z: ${v.z}}`).join(', ')}`
    }
}
