import type {AgentContext} from "./AgentContext.ts";
import {ToolRegistry} from "./tools/ToolRegistry.ts";
import {IdleObservation, type Observation} from "./observation/Observation.ts";
import {PromptBuilder} from "./PromptBuilder.ts";
import * as console from "node:console";

export class Agent {
    private messageHistory: any[] = [];
    private observations: Observation[] = [];

    private static readonly pressureThreshold: number = 15;
    private idlePressure = 0;
    private thinking = false;

    get pressure(): number {
        return this.idlePressure + this.observations.map(o => o.priority).reduce((a, b) => a + b, 0);
    }

    constructor(private ctx: AgentContext) {}

    observe(observation: Observation) {
        this.observations.push(observation);
        if (observation.shouldWake) {
            this.requestThinking()
        }
    }

    async tick() {
        if (!this.ctx.tasks.busy) {
            this.ctx.tasks.tick()
        }

        this.requestThinking()
    }

    async requestThinking() {
        if (this.thinking) {return;}
        if (this.pressure < Agent.pressureThreshold) {
            this.idlePressure += 0.05 / 2;
            return;
        }

        if (this.idlePressure === this.pressure) {
            this.observe(new IdleObservation());
        }

        this.thinking = true;

        try {
            const msgs = [
                PromptBuilder.build(this.ctx),
                ...this.messageHistory,
                ...this.observations.flatMap(o => o.toMessages())
            ];

            const response = await this.runConversation(msgs);

            this.messageHistory.push(
                ...this.observations.flatMap(o => o.toMessages()),
                ...response
            );

            this.messageHistory = this.messageHistory.slice(-50)

            return response;
        } catch (e) {
            throw e;
        } finally {
            this.observations = [];
            this.thinking = false;
            this.idlePressure = 0
        }
    }

    private async runConversation(baseMsgs: any[]) {
        const msgs = [];

        while (true) {
            const res = await this.ctx.llm.chat(
                [...baseMsgs, ...msgs],
                ToolRegistry.schemas
            )

            const aimsg = res.choices[0]!.message

            console.log(aimsg)

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
                return msgs
            }
        }
    }
}