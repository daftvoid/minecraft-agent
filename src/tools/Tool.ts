import {OpenAI} from "openai";
import type {AgentContext} from "../AgentContext.ts";

export interface Tool {
    schema: OpenAI.Chat.Completions.ChatCompletionFunctionTool
    execute: (args: any, ctx: AgentContext) => Promise<string>;
}