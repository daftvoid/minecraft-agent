import type {Bot} from "mineflayer";
import type {LLM} from "./LLM.ts";

export interface AgentContext {
    bot: Bot;
    llm: LLM;
}