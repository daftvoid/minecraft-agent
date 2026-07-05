import type {AgentContext} from "./AgentContext.ts";
import {ToolRegistry} from "./tools/ToolRegistry.ts";

export class Agent {
    private messageHistory: any[] = [];

    constructor(private ctx: AgentContext) {}

    async respond(username: string, message: string, whisper?: boolean) {
        this.messageHistory = this.messageHistory.slice(-50)

        const msgs: any[] = [
                {
                    role: 'system',
                    content: `
You are the Minecraft Agent named "${this.ctx.bot.username}"
You are NOT the player.

You are talking to the player "${username}".

When someone asks:
- "Who are you?" -> describe yourself
- "Who am I?" -> describe them using their player name
- "Where are you?" -> use get_bot_position().
- "Where am I?" -> user get_player_position().

Never guess or invent information.
Keep your responses short. Do not overexplain.

${whisper ? 'The players message is whispered.' : 'The players message is public and not whispered'}
Whispering means that the message can only be read by you and the player.
If you want to whisper or think the message should be private, use \`/msg <username>\` before your response.
`,
                },
                ...this.messageHistory,
                {
                    role: 'user',
                    content: message,
                    name: username,
                }
            ]

        while (true) {
            const res = await this.ctx.llm.chat(
                msgs,
                ToolRegistry.schemas
            )

            const aimsg = res.choices[0]!.message

            const content = aimsg.content;
            const tool_calls = aimsg.tool_calls ?? [];

            msgs.push(aimsg)

            for (const toolcall of tool_calls.filter(t => t.type === 'function')) {
                const res = await ToolRegistry.execute(toolcall, this.ctx)

                console.info(`> Tool called: "${toolcall.function.name}", Result: ${JSON.stringify(res)}`)

                msgs.push({
                    role: 'tool',
                    content: res,
                    tool_call_id: toolcall.id
                })
            }

            if (tool_calls.length === 0) {
                this.messageHistory.push({
                    role: 'user',
                    content: message,
                    name: username,
                })

                this.messageHistory.push({
                    role: 'assistant',
                    content
                })

                return content;
            }
        }
    }
}