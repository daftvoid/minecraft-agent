import type {Item} from "prismarine-item";

type NbtByte = { type: "byte"; value: 0 | 1 };
type NbtString = { type: "string"; value: string };

type NbtCompound = {
    type: "compound";
    value: {
        color?: NbtString;
        text?: NbtString;
        bold?: NbtByte;
        italic?: NbtByte;
    };
};

type NbtComponent = NbtCompound | NbtString;


export class Formatter {
    private constructor() {
    }

    static formatItem(i: Item) {
        // durability
        const durabilityCtx = i.maxDurability ? ` (${Math.ceil((i.maxDurability - i.durabilityUsed) / i.maxDurability * 100)}% Durability)` : ''

        // enchants
        const enchantmentsComponent = ((i as any).componentMap as Map<string, object>).get('enchantments')

        let enchantmentCtx = '';

        if (enchantmentsComponent) {
            const enchantments = (enchantmentsComponent as any).data.enchantments as { id: number, level: number }[];

            console.log(enchantments);

            enchantmentCtx = ` [Enchanted]`
        }

        let customName = i.customName ? ' customName=' + Formatter.nbtStringToHTML(i.customName as any) : ''
        let customLore = i.customLore ? ' customLore=' + Formatter.nbtStringToHTML(i.customLore as any) : ''


        // final
        return `${i.count}x ${i.name}${durabilityCtx}${enchantmentCtx}${customName}${customLore}`;
    }



    static nbtStringToHTML(nbt: NbtComponent | NbtComponent[]): string {
        function componentToHtml(component: NbtComponent): string {
            // Plain string type (e.g. empty lore line)
            if (component.type === "string") {
                if (component.value === "") {
                    return `<br>`
                }

                return `<text>${component.value}</text>`;
            }

            // Compound type with color/text/bold/italic
            const v = component.value;
            const attrs: string[] = [];

            if (v.color) attrs.push(`color="${v.color.value}"`);
            if (v.bold) attrs.push(`bold="${v.bold.value === 1 ? "true" : "false"}"`);
            if (v.italic) attrs.push(`italic="${v.italic.value === 1 ? "true" : "false"}"`);

            const text = v.text ? v.text.value : "";
            return `<text${attrs.length ? " " + attrs.join(" ") : ""}>${text}</text>`;
        }

        if (Array.isArray(nbt)) {
            return nbt.map(componentToHtml).join("\n");
        }

        return componentToHtml(nbt);
    }
}