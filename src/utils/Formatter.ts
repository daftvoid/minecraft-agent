import type {Item} from "prismarine-item";

export class Formatter {
    private constructor() {
    }

    static formatItem(i: Item) {
        const durabilityCtx = i.maxDurability ? ` (${Math.ceil((i.maxDurability - i.durabilityUsed) / i.maxDurability * 100)}% Durability)` : ''
        const enchantmentsComponent = ((i as any).componentMap as Map<string, object>).get('enchantments')

        let enchantmentCtx = '';

        if (enchantmentsComponent) {
            const enchantments = (enchantmentsComponent as any).data.enchantments as { id: number, level: number }[];

            console.log(enchantments);

            enchantmentCtx = ` [Enchanted]`
        }

        return `${i.count}x ${i.name}${durabilityCtx}${enchantmentCtx}`;
    }
}