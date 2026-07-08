import type {Tool} from "../Tool.ts";

export const complete_step: Tool = {
    schema: {
        type: "function",
        function: {
            name: "complete_step",
            description: "Mark a step as successfully completed. Use this once you have actually finished the step, not before.",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "The id of the step to complete, as shown in your current goal's step list."
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

        const step = ctx.goalState.activeSteps.find(g => g.id === id);

        if (!step) {
            return `ERROR: No step with this id exists.`;
        }

        if (step.status !== 'in_progress') {return `ERROR: Step is ${step.status}`;}

        step.status = 'done';

        return `Step ${step.id} is now ${step.status}`;
    }
}