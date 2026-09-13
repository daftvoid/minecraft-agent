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
import {dig_area} from "./tools/dig_area.ts";
import {stop_task} from "./tools/stop_task.ts";
import {get_time} from "./tools/get_time.ts";
import {get_item_from_creative} from "./tools/get_item_from_creative.ts";
import {open_container} from "./tools/open_container.ts";
import {withdraw_item} from "./tools/withdraw_item.ts";
import {deposit_item} from "./tools/deposit_item.ts";
import {find_blocks} from "./tools/find_blocks.ts";
import {find_containers} from "./tools/find_containers.ts";
import {find_entities} from "./tools/find_entities.ts";
import {kill_entity} from "./tools/kill_entity.ts";
import {place_block} from "./tools/place_block.ts";

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
        get_agent_position,
        get_player_position,
        get_inventory,
        get_block,
        get_time,
        get_item_from_creative,

        // container
        open_container,
        withdraw_item,
        deposit_item,

        find_blocks,
        find_containers,
        find_entities,

        kill_entity,

        dig_block,
        dig_area,
        place_block,

        // stop task
        stop_task
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