import type {Tool} from "../Tool.ts";
import Item from "prismarine-item";

export const get_item_from_creative: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_item_from_creative',
            description: `Gets an Item from the creative Inventory. Only works in creative mode.`,
            parameters: {
                type: 'object',
                properties: {
                    item: {
                        type: 'string',
                        description: "Id of the Item to get, e.g. `diamond`"
                    },
                    count: {
                        type: 'number',
                        description: "Count of items to get, defaults to 1."
                    }
                },
                required: ['item'],
            }
        }
    },

    async execute(args: {item: string, count?: number}, ctx) {
        const bot = ctx.bot;

        const slotIndex = bot.inventory.firstEmptyInventorySlot(true)

        if (slotIndex === null) {
            return 'Your inventory is full. Could not get item.'
        }

        const item = ctx.mcData.itemsByName[args.item];

        if (!item) {
            return 'This Item does not exist in the current version of minecraft.'
        }

        await bot.creative.setInventorySlot(slotIndex, new (Item(bot.version))(item.id, args.count ?? 1));

        return `Got ${args.count ?? 1}x ${item.name} at Slot ${slotIndex} from the creative Inventory.`;
    }
}