import type {Tool} from "../Tool.ts";
import {KillEntityTask} from "../../tasks/tasks/KillEntityTask.ts";

export const kill_entity: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'kill_entity',
            description: `Starts a KillEntityTask. the "id" parameter is the entity's id. Use when you want to eliminate a certain entity or a user wants you to fight. Starts a task, therefore only returns wheter the task was started successfully.`,
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                },
                required: ['id']
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;
        const { id } = args as { id: number }

        const entity = Object.values(bot.entities).find(e => e.id === id)

        if (!entity) {
            return "No entity found with that id.";
        }

        ctx.tasks.add(new KillEntityTask(ctx, id))

        return "Started the KillEntityTask. Agent will start hunting the entity now."
    }
}
