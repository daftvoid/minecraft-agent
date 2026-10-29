import type { Tool } from '../Tool.ts';

export const select_item: Tool = {
	schema: {
		type: 'function',
		function: {
			name: 'select_item',
			description: `Selects an Item and puts it into the main hand. Useful for mining or when interacting.`,
			parameters: {
				type: 'object',
				properties: {
					item: {
						type: 'string',
						description: 'Item to select',
					},
				},
				required: ['item'],
			},
		},
	},

	async execute(args, ctx) {
		const bot = ctx.bot;

		const { item: itemname } = args as { item: string };

		if (itemname.length === 0) {
			return 'item cannot be empty!';
		}

		const item = bot.inventory.items().find((i) => i.name === itemname);

		if (!item) {
			return `No Item \"${itemname}\" found in inventory!`;
		}

		await bot.equip(item, 'hand');

		return `Item \"${itemname}\" selected successfully!`;
	},
};
