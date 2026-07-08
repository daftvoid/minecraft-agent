import type {Tool} from "../Tool.ts";

export const stop_task: Tool = {
    schema: {
        type: "function",
        function: {
            name: "stop_task",
            description: "Stops the current task and deletes it.",
        }
    },

    async execute(args, ctx) {
        ctx.tasks.removeCurrent()

        return 'Stopped current task.';
    }
}