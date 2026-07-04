import {OpenAI} from "openai";

export class LLM {
    constructor(private client: OpenAI, private model: string) {}

    async chat(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    ) {
        return this.client.chat.completions.create({
            model: this.model,
            messages,
            tools
        });
    }
}