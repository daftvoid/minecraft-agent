import type {Tool} from "../Tool.ts";
import {Formatter} from "../../utils/Formatter.ts";
import type {Item} from "prismarine-item";

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
        const bot = ctx.bot;
        const inventory = bot.inventory;

        const items = inventory.slots
            .map((i, s) => ({s, i}))
            .filter(v => v.i !== null);



        // console.dir(items);

        if (items.length === 0) {
            return 'Your inventory is empty.';
        }

        const hotbarItems = items.filter(v => v.s >= inventory.hotbarStart && v.s < inventory.hotbarStart + 9)

        const inventoryItems = items.filter(v => v.s >= inventory.inventoryStart && v.s < inventory.hotbarStart)

        const offHandItem = inventory.slots[45];

        const mainHandItem = inventory.slots[inventory.hotbarStart + bot.quickBarSlot];

        const head  = ctx.bot.inventory.slots[5] // helmet
        const torso = ctx.bot.inventory.slots[6] // chestplate
        const legs  = ctx.bot.inventory.slots[7] // leggings
        const feet  = ctx.bot.inventory.slots[8] // boots


        const ret = `Selected Hotbar Slot: ${bot.quickBarSlot}
Mainhand: ${mainHandItem ? Formatter.formatItem(mainHandItem) : 'empty'}
Offhand: ${offHandItem ? Formatter.formatItem(offHandItem) : 'empty'}

Hotbar Items: 
${hotbarItems
            .filter(v => v.i !== null)
            .map(v => `- hotbarslot=${v.s - inventory.hotbarStart} slot=${v.s} ${Formatter.formatItem(v.i!)}`)
            .join('\n')}

Inventory:
${inventoryItems
            .filter(v => v.i !== null)
            .map(v => `- slot=${v.s} ${Formatter.formatItem(v.i!)}`)
            .join('\n')}

Head: ${head ? Formatter.formatItem(head) : 'empty'}
Torso: ${torso ? Formatter.formatItem(torso) : 'empty'}
Legs ${legs ? Formatter.formatItem(legs) : 'empty'}
Feet: ${feet ? Formatter.formatItem(feet) : 'empty'}
`

        console.log(ret);

        return ret;
    }
}