import type {AgentContext} from './AgentContext.ts';
import {ToolRegistry} from './tools/ToolRegistry.ts';
import {
    IdleObservation,
    type Observation,
    TaskDoneObservation,
    TaskFailedObservation,
    TaskStoppedObservation,
} from './observation/Observation.ts';
import {PromptBuilder} from './PromptBuilder.ts';
import * as console from 'node:console';
import {Summarizer} from "./Summarizer.ts";
import {LLM} from "./LLM.ts";
import {OpenAI} from "openai";

export class Agent {
    private messageHistory: any[] = [];
    private observations: Observation[] = [];

    private static readonly pressureThreshold: number = 15;
    private idlePressure = 0;
    private thinking = false;

    private summarizer: Summarizer;

    get pressure(): number {
        return (
            this.idlePressure +
            this.observations.map((o) => o.priority).reduce((a, b) => a + b, 0) +
            (!!this.ctx.goalState.activeGoal ? 12 : 0)
        );
    }

    constructor(private ctx: AgentContext) {
        ctx.tasks.on('taskDone', (task) => {
            this.observe(new TaskDoneObservation(task));
        });

        ctx.tasks.on('taskFailed', (task) => {
            this.observe(new TaskFailedObservation(task));
        });

        ctx.tasks.on('taskStopped', (task) => {
            this.observe(new TaskStoppedObservation(task));
        });

        this.summarizer = new Summarizer(
            new LLM(
                new OpenAI({
                    baseURL: 'http://localhost:11434/v1',
                    apiKey: 'ignored',
                }),
				'gemma4:31b-cloud'
			)
		);
    }

    observe(observation: Observation) {
        console.log('[obs]', observation.constructor.name, observation.toPrompt());

        const mergedInto = this.observations.find((o) => o.merge(observation));

        if (!mergedInto) {
            this.observations.push(observation);
        }

        if (observation.shouldWake) {
            this.requestThinking();
        }
    }

    async tick() {
        if (!this.ctx.tasks.busy) {
            this.ctx.tasks.tick();
        }

        this.requestThinking();
    }

    async requestThinking() {
        if (this.thinking) {
            return;
        }
        if (this.pressure < Agent.pressureThreshold) {
            this.idlePressure += 1 / 100; // 1 every 100 ticks (1 every 5 seconds)
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
                ...this.observations.flatMap((o) => o.toMessages()),
            ];

            const response = await this.runConversation(msgs);


            this.messageHistory.push(
                ...this.observations.flatMap((o) => o.toMessages()),
                ...response,
            );

			const summarized = await this.summarizer.compressHistory(this.messageHistory, 6, 2000);

			if (summarized) {
				console.log("SUMMARIZING!")
				this.messageHistory = summarized;
				console.log(summarized);
			}

            return response;
        } catch (e) {
            throw e;
        } finally {
            this.observations = [];
            this.thinking = false;
            this.idlePressure = 0;

            // cleanup code for container windows
            if (this.ctx.bot.currentWindow) {
                this.ctx.bot.closeWindow(this.ctx.bot.currentWindow);
            }
        }
    }

    private async runConversation(baseMsgs: any[]) {
        const msgs = [];

        while (true) {
            const res = await this.ctx.llm.chat(
                [...baseMsgs, ...msgs],
                ToolRegistry.schemas,
            );

            console.log('(ai call)');

            const aimsg = res.choices[0]!.message;

            if ((aimsg as any).reasoning)
                console.log('Reasoning: ' + (aimsg as any).reasoning);
            if ((aimsg.content?.length ?? 0) > 0)
                console.log('Message: ' + aimsg.content);

            const tool_calls = aimsg.tool_calls ?? [];

            if (tool_calls.length === 0) {
                console.log('(no tool calls)');
            }

            msgs.push(aimsg);

            for (const toolcall of tool_calls.filter((t) => t.type === 'function')) {
                try {
                    const res = await ToolRegistry.execute(toolcall, this.ctx);

                    console.info(
                        `> Tool called: "${toolcall.function.name}", Params: ${toolcall.function.arguments}, Result: ${JSON.stringify(res)}`,
                    );

                    msgs.push({
                        role: 'tool',
                        content: res,
                        tool_call_id: toolcall.id,
                    });
                } catch (e) {
                    console.info(
                        `> INVALID Tool called: "${toolcall.function.name}", Params: ${toolcall.function.arguments}, Result: ${JSON.stringify(res)}`,
                    );

                    msgs.push({
                        role: 'tool',
                        content: (e as Error).message,
                        tool_call_id: toolcall.id,
                    });
                }
            }

            if (tool_calls.length === 0) {
                return msgs;
            }
        }
    }
}
