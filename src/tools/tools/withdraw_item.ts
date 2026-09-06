import type {Tool} from "../Tool.ts";
import {countInContainer} from "../windowhelpers.ts";

export const withdraw_item: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'withdraw_item',
            description: `Moves an item from the currently open container into the bot's inventory.`,
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
        if (before === 0) return `No ${item} in the container.`

        try {
            await (window as any).withdraw(itemDef.id, null, count)
        } catch (err) {
            return `Failed to withdraw ${item}: ${(err as Error).message}`
        }

        const moved = before - countInContainer(window, itemDef.id)
        return `Withdrew ${moved} ${item}.`
    }
}
