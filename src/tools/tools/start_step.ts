import type {Tool} from "../Tool.ts";

export const start_step: Tool = {
    schema: {
        type: "function",
        function: {
            name: "start_step",
            description: "Mark a step as currently in progress. Use this when you begin actively working on a step.",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "The id of the step to start, as shown in your current goal's step list."
                    }
                },
                required: ["id"]
            }
        }
    },

    async execute(args, ctx) {
        const {id} = args as {
            id: string;
        };

        const step = ctx.goalstate.activeSteps.find(g => g.id === id);

        if (!step) {
            return `ERROR: No step with this id exists.`;
        }

        if (step.status !== 'pending') {return `ERROR: Step is already ${step.status}`;}

        step.status = 'in_progress';

        return `Step ${step.id} is now ${step.status}`;
    }
}