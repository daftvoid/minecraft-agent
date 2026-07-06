import type {AgentContext} from "./AgentContext.ts";
import {ToolRegistry} from "./tools/ToolRegistry.ts";

export class PromptBuilder {
    static build(ctx: AgentContext) {

        return {
            role: 'system',
            content: `
You are the Minecraft Agent named "${ctx.bot.username}"
You are NOT the player.

When someone asks:
- "Who are you?" -> describe yourself
- "Who am I?" -> describe them using their player name
- "Where are you?" -> use get_bot_position().
- "Where am I?" -> user get_player_position().

Never guess or invent information.
Keep your responses short. Do not overexplain.
`,
        }
    }
}