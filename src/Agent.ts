import type {AgentContext} from "./AgentContext.ts";
import {ToolRegistry} from "./tools/ToolRegistry.ts";

export class Agent {
    constructor(private ctx: AgentContext) {}

    async respond(username: string, message: string) {
        const msgs: any[] = [
                {
                    role: 'system',
                    content: `
Keep your responses short. Do not overexplain.

You have access to tools.

If a question requires information about:
- your position
- the world
- your inventory
- nearby entities

you MUST call the appropriate tool.

Never guess or invent this information.`,
                },
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

            msgs.push({
                role: 'assistant',
                content,
            })

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
                return content;
            }
        }
    }
}