import type {Tool} from "../Tool.ts";
import {Movements, goals} from "mineflayer-pathfinder";
import {Vec3} from "vec3";
import {DigAreaTask} from "../../tasks/tasks/DigAreaTask.ts";

export const dig_area: Tool = {
    schema: {
        type: "function",
        function: {
            name: "dig_area",
            description: "Dig out all blocks within a rectangular area, defined by two opposite corners (inclusive). Use this for clearing, flattening, or excavating a region in one operation, rather than digging block by block. Starts a task, therefore only returns wheter the task was started successfully.",
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
        const { x1, y1, z1, x2, y2, z2, skip_unbreakable } = args as {
            x1: number;
            y1: number;
            z1: number;
            x2: number;
            y2: number;
            z2: number;
            skip_unbreakable?: boolean;
        }

        const task = new DigAreaTask(ctx, x1, y1, z1, x2, y2, z2)

        ctx.tasks.add(task)

        return `Started DigAreaTask from X: ${x1}, Y: ${y1}, Z: ${z1} to X: ${x2}, Y: ${y2}, Z: ${z2}`;
    }
}
