import type {Bot} from "mineflayer";
import type {LLM} from "./LLM.ts";
import type {GoalState} from "./goals/Goal.ts";
import type {TaskManager} from "./tasks/TaskManager.ts";
import type {IndexedData} from "minecraft-data";

export interface AgentContext {
    bot: Bot;
    llm: LLM;
    goalState: GoalState;
    tasks: TaskManager;
    mcData: IndexedData;
}