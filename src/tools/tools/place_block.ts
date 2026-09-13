import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";

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
                        description: "X position to place at"
                    },
                    y: {
                        type: 'integer',
                        description: "Y position to place at"
                    },
                    z: {
                        type: 'integer',
                        description: "Z position to place at"
                    },
                    item: {
                        type: 'string',
                        description: "Name of the block item to place, e.g. `cobblestone`"
                    }
                },
                required: ['x', 'y', 'z', 'item'],
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;

        const { x, y, z, item: itemName } = args as {
            x: number;
            y: number;
            z: number;
            item: string;
        }

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

        const held = bot.inventory.items().find(i => i.name === normalized);

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

        const defaultMove = new Movements(bot)

        bot.pathfinder.setMovements(defaultMove)

        try {
            await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 4));
        } catch {
            const dist = bot.entity.position.distanceTo(target as Vec3);

            if (dist > 4.5) {
                return `Target is too far away (${dist.toFixed(1)} blocks) and unreachable.`;
            }
        }

        try {
            await bot.placeBlock(referenceBlock, faceVector);
        } catch (err) {
            return `Failed to place ${normalized} at X: ${target.x}, Y: ${target.y}, Z: ${target.z}: ${(err as Error).message}`;
        }

        return `Placed ${normalized} at X: ${target.x}, Y: ${target.y}, Z: ${target.z}`;
    }
}
