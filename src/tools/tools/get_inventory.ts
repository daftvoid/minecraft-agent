import type {Tool} from "../Tool.ts";

export const get_inventory: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_inventory',
            description: `
            Returns the agent's inventory.
            `,
        }
    },

    async execute(args, ctx) {
        const items = ctx.bot.inventory.items();

        // console.dir(items);

        if (items.length === 0) {
            return 'Your inventory is empty.';
        }


        const ret = items.map(i => {
            const durabilityCtx = i.maxDurability ? ` (${Math.ceil((i.maxDurability - i.durabilityUsed) / i.maxDurability * 100)}% Durability)` : ''
            const enchantmentsComponent = ((i as any).componentMap as Map<string, object>).get('enchantments')

            let enchantmentCtx = '';

            if (enchantmentsComponent) {
                const enchantments = (enchantmentsComponent as any).data.enchantments as {id: number, level: number}[];

                console.log(enchantments);

                enchantmentCtx = ` [Enchanted]`
            }

            return `- ${i.count}x ${i.name}${durabilityCtx}${enchantmentCtx}`;
        }).join('\n');

        console.log(ret);

        return ret;
    }
}