import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";

export const dig_area: Tool = {
    schema: {
        type: "function",
        function: {
            name: "dig_area",
            description: "Dig out all blocks within a rectangular area, defined by two opposite corners (inclusive). Use this for clearing, flattening, or excavating a region in one operation, rather than digging block by block. Returns a summary once the whole area is done, not per-block updates.",
            parameters: {
                type: "object",
                properties: {
                    x1: { type: "number", description: "X coordinate of the first corner" },
                    y1: { type: "number", description: "Y coordinate of the first corner" },
                    z1: { type: "number", description: "Z coordinate of the first corner" },
                    x2: { type: "number", description: "X coordinate of the opposite corner" },
                    y2: { type: "number", description: "Y coordinate of the opposite corner" },
                    z2: { type: "number", description: "Z coordinate of the opposite corner" },
                    skip_unbreakable: {
                        type: "boolean",
                        description: "If true (default), silently skip blocks that cannot be broken (e.g. bedrock) instead of failing the whole operation."
                    }
                },
                required: ["x1", "y1", "z1", "x2", "y2", "z2"]
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;

        const { x1, y1, z1, x2, y2, z2, skip_unbreakable } = args as {
            x1: number;
            y1: number;
            z1: number;
            x2: number;
            y2: number;
            z2: number;
            skip_unbreakable?: boolean;
        }

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                for (let z = z1; z <= z2; z++) {
                    const block = bot.blockAt(new Vec3(x, y, z));

                    if (!block) {
                        if (skip_unbreakable) {
                            continue;
                        }

                        return `No block at X: ${x}, Y: ${y}, Z: ${z}`;
                    }

                    const defaultMove = new Movements(bot)

                    bot.pathfinder.setMovements(defaultMove)

                    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 3))

                    await bot.dig(block)
                }
            }
        }

        return `Mined area from X: ${x1}, Y: ${y1}, Z: ${z1} to X: ${x2}, Y: ${y2}, Z: ${z2}`;
    }
}
