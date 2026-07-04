import {OpenAI} from "openai";

export class LLM {
    constructor(private client: OpenAI) {}

    async chat(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    ) {
        return this.client.chat.completions.create({
            model: 'granite4:3b',
            messages,
            tools
        });
    }
}