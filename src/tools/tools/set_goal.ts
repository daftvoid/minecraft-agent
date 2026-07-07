import type {Tool} from "../Tool.ts";

export const set_goal: Tool = {
    schema: {
        type: "function",
        function: {
            name: "set_goal",
            description: "Set or replace the agent's current goal and its steps. Use this to start a new goal or replan the current one.",
            parameters: {
                type: "object",
                properties: {
                    goal: {
                        type: "string",
                        description: "A short description of the goal, e.g. 'Build a wheat farm'"
                    },
                    steps: {
                        type: "array",
                        items: {type: "string"},
                        description: "Ordered list of steps needed to accomplish the goal, e.g. ['Clear a 10x10 area', 'Till the soil', 'Plant seeds']"
                    }
                },
                required: ["goal", "steps"]
            }
        }
    },

    async execute(args, ctx) {
        const {goal, steps} = args as {
            goal: string, steps: string[]
        };

        ctx.goalstate.activeGoal = goal;

        steps.forEach(step => {
            ctx.goalstate.activeSteps.push({
                desc: step,
                id: crypto.randomUUID(),
                status: 'pending'
            })
        })

        return 'Added Goal.'
    }
}