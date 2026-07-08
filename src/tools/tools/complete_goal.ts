import type {Tool} from "../Tool.ts";
import * as sqlite from "node:sqlite";

export const complete_goal: Tool = {
    schema: {
        type: "function",
        function: {
            name: "complete_goal",
            description: "Mark the entire current goal as finished, clearing it as your active goal. Use this once all its steps are done (or the goal is otherwise satisfied) so you can move on to something else, such as pulling a new goal from your backlog.",
            parameters: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: "A brief note on the outcome, e.g. 'Built a 5x5 wheat farm near base.' This may be saved for future reference."
                    }
                },
                required: ["summary"]
            }
        }
    },

    async execute(args, ctx) {
        const {summary} = args as {summary: string};

        ctx.goalState.activeGoal = null;
        ctx.goalState.activeSteps = [];

        return `Goal completed: ${summary}`;
    }
}