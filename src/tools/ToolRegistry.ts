import type {Tool} from "./Tool.ts";
import type {AgentContext} from "../AgentContext.ts";
import {get_agent_position} from "./tools/get_agent_position.ts";
import {get_player_position} from "./tools/get_player_position.ts";

interface ToolCall {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string;
    };
}

export class ToolRegistry {
    private constructor() {}

    private static readonly tools: Tool[] = [
        get_agent_position,
        get_player_position
    ];

    static get schemas() {
        return ToolRegistry.tools.map(t => t.schema);
    }

    static async execute(toolcall: ToolCall, ctx: AgentContext) {
        const tool = ToolRegistry.tools.find(t => t.schema.function.name === toolcall.function.name);

        if (!tool) {
            throw new Error('Tool does not exist!');
        }

        return await tool.execute(JSON.parse(toolcall.function.arguments), ctx)
    }
}