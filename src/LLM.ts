import {OpenAI} from "openai";

export class LLM {
    constructor(private client: OpenAI, private _model: string) {}

    get model(): string {
        return this._model;
    }

    async chat(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    ) {
        return this.client.chat.completions.create({
            model: this._model,
            messages,
            tools
        });
    }
}