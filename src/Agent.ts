import type {AgentContext} from "./AgentContext.ts";
import {ToolRegistry} from "./tools/ToolRegistry.ts";
import  {type Observation} from "./observation/Observation.ts";
import {PromptBuilder} from "./PromptBuilder.ts";
import * as console from "node:console";

export class Agent {
    private messageHistory: any[] = [];
    private observations: Observation[] = [];

    private static readonly pressureThreshold: number = 15;
    private _pressure = 0;
    private thinking = false;

    get pressure(): number {
        return this._pressure;
    }

    constructor(private ctx: AgentContext) {}

    observe(observation: Observation) {
        this.observations.push(observation);
        this._pressure += observation.priority;
    }

    async requestThinking() {
        if (this.thinking) {return;}
        if (this._pressure < Agent.pressureThreshold) {
            this._pressure++;
            return;
        }

        this.thinking = true;

        const msgs = [
            PromptBuilder.build(this.ctx),
            ...this.messageHistory,
            ...this.observations.flatMap(o => o.toMessages())
        ];

        const response = await this.runConversation(msgs);

        this.messageHistory.push(
            ...this.observations.flatMap(o => o.toMessages()),
            {
                role: "assistant",
                content: response
            }
        );

        this.messageHistory = this.messageHistory.slice(-50)

        this.observations = [];
        this.thinking = false;
        this._pressure = 0

        return response;
    }

    private async runConversation(msgs: any[]) {
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
                return content;
            }
        }
    }
}