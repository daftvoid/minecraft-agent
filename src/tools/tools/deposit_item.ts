import type {Tool} from "../Tool.ts";
import {countInContainer} from "../windowhelpers.ts";

export const deposit_item: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'deposit_item',
            description: `Moves an item from the bot's inventory into the currently open container.`,
            parameters: {
                type: 'object',
                properties: {
                    item: { type: 'string' },
                    count: { type: 'integer' }
                },
                required: ['item', 'count']
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot
        const { item, count } = args as { item: string; count: number }

        const window = bot.currentWindow
        if (!window) return `No container is open.`

        const itemDef = bot.registry.itemsByName[item]
        if (!itemDef) return `Unknown item: "${item}"`

        const before = countInContainer(window, itemDef.id)

        try {
            await (window as any).deposit(itemDef.id, null, count)
        } catch (err) {
            return `Failed to deposit ${item}: ${(err as Error).message}`
        }

        const moved = countInContainer(window, itemDef.id) - before
        return `Deposited ${moved} ${item}.`
    }
}
