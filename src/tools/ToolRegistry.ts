import type {Tool} from "./Tool.ts";
import type {AgentContext} from "../AgentContext.ts";
import {get_agent_position} from "./tools/get_agent_position.ts";
import {get_player_position} from "./tools/get_player_position.ts";
import {move_near} from "./tools/move_near.ts";
import {move_near_player} from "./tools/move_near_player.ts";
import {chat} from "./tools/chat.ts";
import {leave_game} from "./tools/leave_game.ts";
import {set_goal} from "./tools/set_goal.ts";
import {start_step} from "./tools/start_step.ts";
import {fail_step} from "./tools/fail_step.ts";
import {complete_step} from "./tools/complete_step.ts";
import {complete_goal} from "./tools/complete_goal.ts";
import {get_inventory} from "./tools/get_inventory.ts";
import {dig_block} from "./tools/dig_block.ts";
import {get_block} from "./tools/get_block.ts";
import {edit_sign_text} from "./tools/edit_sign_text.ts";

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
        get_player_position,
        move_near,
        move_near_player,
        chat,
        leave_game,

        // goals
        set_goal,
        complete_goal,

        // steps
        start_step,
        fail_step,
        complete_step,

        // getter
        get_inventory,
        get_block,

        dig_block,

        edit_sign_text
    ];

    static get schemas() {
        return ToolRegistry.tools.map(t => t.schema);
    }

    static async execute(toolcall: ToolCall, ctx: AgentContext) {
        const tool = ToolRegistry.tools.find(t => t.schema.function.name === toolcall.function.name);

        if (!tool) {
            throw new Error(`Tool does not exist: ${toolcall.function.name}`);
        }

        return (await tool.execute(JSON.parse(toolcall.function.arguments), ctx)).trim()
    }
}