import type {Tool} from "../Tool.ts";

export const fail_step: Tool = {
    schema: {
        type: "function",
        function: {
            name: "fail_step",
            description: "Mark a step as failed because it could not be completed. Use this if you tried and could not succeed, e.g. blocked, missing resources, or repeatedly unsuccessful. This does not automatically retry or replan — decide separately whether to try again, skip it, or set a new goal.",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "The id of the step that failed."
                    },
                    reason: {
                        type: "string",
                        description: "A short explanation of why the step failed, e.g. 'no iron found nearby' or 'blocked by lava'."
                    }
                },
                required: ["id", "reason"]
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

        if (step.status === 'failed') {return `ERROR: Step is already failed.`;}

        step.status = 'failed';

        return `Step ${step.id} is now ${step.status}`;
    }
}