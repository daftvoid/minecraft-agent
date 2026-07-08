import type {Bot} from "mineflayer";
import type {LLM} from "./LLM.ts";
import type {GoalState} from "./goals/Goal.ts";

export interface AgentContext {
    bot: Bot;
    llm: LLM;
    goalstate: GoalState;
}