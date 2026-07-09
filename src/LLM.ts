import {OpenAI} from "openai";
import * as console from "node:console";

export class LLM {
    private _totalRequests = 0;
    private _totalPromptTokens = 0;
    private _totalCompletionTokens = 0;


    get totalRequests(): number {
        return this._totalRequests;
    }

    get totalPromptTokens(): number {
        return this._totalPromptTokens;
    }

    get totalCompletionTokens(): number {
        return this._totalCompletionTokens;
    }

    constructor(private client: OpenAI, private _model: string) {}

    get model(): string {
        return this._model;
    }

    async chat(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    ) {
        const res = await this.client.chat.completions.create({
            model: this._model,
            messages,
            tools
        });

        this._totalRequests++;

        if (res.usage) {
            this._totalPromptTokens += res.usage.prompt_tokens;
            this._totalCompletionTokens += res.usage.completion_tokens;
        }

        return res;
    }
}