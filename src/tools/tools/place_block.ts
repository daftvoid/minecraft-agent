import type { Tool } from '../Tool.ts';
import { Movements, goals } from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';

export const place_block: Tool = {
	schema: {
		type: 'function',
		function: {
			name: 'place_block',
			description: `Places a block from the inventory at a certain position. Automatically equips the item and pathfinds into reach. The target position must be empty (air/water or otherwise replaceable) and have a solid neighboring block to place against.`,
			parameters: {
				type: 'object',
				properties: {
					x: {
						type: 'integer',
						description: 'X position to place at',
					},
					y: {
						type: 'integer',
						description: 'Y position to place at',
					},
					z: {
						type: 'integer',
						description: 'Z position to place at',
					},
					item: {
						type: 'string',
						description: 'Name of the block item to place, e.g. `cobblestone`',
					},
				},
				required: ['x', 'y', 'z', 'item'],
			},
		},
	},

	async execute(args, ctx) {
		const bot = ctx.bot;

		const {
			x,
			y,
			z,
			item: itemName,
		} = args as {
			x: number;
			y: number;
			z: number;
			item: string;
		};

		if (typeof itemName !== 'string' || itemName.length === 0) {
			return 'item must be a non-empty block name, e.g. "cobblestone".';
		}

		const normalized = itemName.toLowerCase();

		const itemDef = bot.registry.itemsByName[normalized];

		if (!itemDef) {
			return `Unknown item: "${itemName}".`;
		}

		const target = new Vec3(Math.floor(x), Math.floor(y), Math.floor(z));

		const destBlock = bot.blockAt(target);

		if (!destBlock) {
			return `Chunk at X: ${target.x}, Y: ${target.y}, Z: ${target.z} is not loaded. Move closer first.`;
		}

		if (destBlock.boundingBox === 'block') {
			return `Target at X: ${target.x}, Y: ${target.y}, Z: ${target.z} is occupied by ${destBlock.name}.`;
		}

		const held = bot.inventory.items().find((i) => i.name === normalized);

		if (!held) {
			return `No ${normalized} in inventory. Use get_inventory to check.`;
		}

		try {
			await bot.equip(held, 'hand');
		} catch (err) {
			return `Failed to equip ${normalized}: ${(err as Error).message}`;
		}

		const offsets = [
			new Vec3(0, -1, 0),
			new Vec3(0, 1, 0),
			new Vec3(0, 0, -1),
			new Vec3(0, 0, 1),
			new Vec3(-1, 0, 0),
			new Vec3(1, 0, 0),
		];

		let referenceBlock = null;
		let faceVector: Vec3 | null = null;

		for (const offset of offsets) {
			const neighbor = bot.blockAt(target.plus(offset));

			if (neighbor && neighbor.boundingBox === 'block') {
				referenceBlock = neighbor;
				faceVector = target.minus(neighbor.position) as Vec3;
				break;
			}
		}

		if (!referenceBlock || !faceVector) {
			return `Cannot place at X: ${target.x}, Y: ${target.y}, Z: ${target.z}: no adjacent solid block to place against (floating placement is impossible).`;
		}

		const defaultMove = new Movements(bot);

		bot.pathfinder.setMovements(defaultMove);

		try {
			await bot.pathfinder.goto(
				new goals.GoalNear(target.x, target.y, target.z, 4),
			);
		}  catch (err) {
			return `Could not reach a valid position to place at X: ${target.x}, Y: ${target.y}, Z: ${target.z}: ${(err as Error).message}`;
		}


		const feet = bot.entity.position.floored();
		if (feet.equals(target) || feet.offset(0, 1, 0).equals(target)) {
			await bot.pathfinder.goto(
				new goals.GoalInvert(new goals.GoalBlock(target.x, target.y, target.z)),
			);
		}

		// special fluid handling
		if (normalized === 'water_bucket' || normalized === 'lava_bucket') {
			try {
				// Center of the face we want the raycast to hit
				const faceCenter = referenceBlock.position
					.offset(0.5, 0.5, 0.5)
					.plus(faceVector.scaled(0.5));

				if (!bot.canSeeBlock(referenceBlock)) {
					throw new Error("Bot cannot see the block. It might be behind a wall.")
				}

				await bot.lookAt(faceCenter, true);
				await bot.waitForTicks(2);
				bot.activateItem();
			} catch (err) {
				return `Failed to place ${normalized} at X: ${target.x}, Y: ${target.y}, Z: ${target.z}: ${(err as Error).message}`;
			}

			return `Placed ${normalized} at X: ${target.x}, Y: ${target.y}, Z: ${target.z}`;
		}

		try {
			await bot.placeBlock(referenceBlock, faceVector);
		} catch (err) {
			return `Failed to place ${normalized} at X: ${target.x}, Y: ${target.y}, Z: ${target.z}: ${(err as Error).message}`;
		}

		return `Placed ${normalized} at X: ${target.x}, Y: ${target.y}, Z: ${target.z}`;
	},
};
