import type {Tool} from "../Tool.ts";
import {Formatter} from "../../utils/Formatter.ts";

export const get_inventory: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_inventory',
            description: `
            Returns the agent's inventory as a list. Includes item durability and enchantments, if available.
            `,
        }
    },

    async execute(args, ctx) {
        const items = ctx.bot.inventory.items();

        // console.dir(items);

        if (items.length === 0) {
            return 'Your inventory is empty.';
        }


        const ret = items.map(Formatter.formatItem).map(s => `- ${s}`).join('\n');

        console.log(ret);

        return ret;
    }
}