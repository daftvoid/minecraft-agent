import {OpenAI} from "openai";
import type {LLM} from "./LLM.ts";

export class Summarizer {
    private summary = '';

    constructor(private llm: LLM) {}

    private estimateTokens(msgs: any[]): number {
        return Math.ceil(JSON.stringify(msgs).length / 4);
    }

    private flatten(msgs: any[]): string {
        return msgs
            .map((m) => {
                if (m.role === 'tool') {
                    const text = String(m.content ?? '');
                    return `TOOL RESULT: ${text.length > 400 ? text.slice(0, 400) + '...' : text}`;
                }
                if (m.role === 'assistant') {
                    const calls = (m.tool_calls ?? [])
                        .map((c: any) => `${c.function.name}(${c.function.arguments})`)
                        .join(', ');
                    return `ASSISTANT: ${m.content ?? ''}${calls ? ' CALLED: ' + calls : ''}`;
                }
                return `${m.role.toUpperCase()}: ${m.content}`;
            })
            .join('\n');
    }

    public async compressHistory(messageHistory: any[], keepRecent = 12, threshold = 60_000) {
        console.log("Estimated Tokens: " + this.estimateTokens(messageHistory))

        if (this.estimateTokens(messageHistory) < threshold) return;

        // Pick a safe cut: never start the kept section on a tool message
        let cut = messageHistory.length - keepRecent;
        while (cut < messageHistory.length && messageHistory[cut].role === 'tool') {
            cut++;
        }
        if (cut <= 0 || cut >= messageHistory.length) return;

        const old = messageHistory.slice(0, cut);
        const recent = messageHistory.slice(cut);

        try {
            const res = await this.llm.chat([
                    {
                        role: 'system',
                        content:
                            'You compress the memory of a Minecraft bot. Output a dense, factual summary. ' +
                            'Keep: coordinates and bases/farms/chests, what has been built or is in progress, ' +
                            'inventory-relevant facts, the current goal and next steps, user preferences and ' +
                            'instructions, mistakes to avoid, and tool quirks learned. Drop chatter and ' +
                            'repeated failures. Max 400 words.',
                    },
                    {
                        role: 'user',
                        content:
                            `PREVIOUS SUMMARY:\n${this.summary || '(none)'}\n\n` +
                            `NEW EVENTS TO MERGE:\n${this.flatten(old)}`,
                    },
                ], []);

            const aimsg = res.choices[0]!.message;

            return [aimsg as any];
        } catch (err) {
            console.error('Compression failed, falling back to trim', err);
            return recent;
        }
    }
}