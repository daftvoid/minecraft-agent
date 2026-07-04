import type {Tool} from "../Tool.ts";

export const get_agent_position: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_agent_position',
            description: `
            Returns the agent's current world coordinates.
            Use ONLY when you need the agent's current location to answer a question or complete a task.
            Do NOT call this tool if the user is asking what the tool does
            `,
        }
    },

    async execute(args, ctx) {
        const pos = ctx.bot.entity.position.clone()

        return `X: ${Math.floor(pos.x)}, Y: ${Math.floor(pos.y)}, Z: ${Math.floor(pos.z)}`;
    }
}