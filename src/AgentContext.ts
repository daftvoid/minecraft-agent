import type {Bot} from "mineflayer";
import type {LLM} from "./LLM.ts";
import type {GoalState} from "./goals/Goal.ts";
import type {TaskManager} from "./tasks/TaskManager.ts";

export interface AgentContext {
    bot: Bot;
    llm: LLM;
    goalState: GoalState;
    tasks: TaskManager;
}