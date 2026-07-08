import type {AgentContext} from "../AgentContext.ts";

export type TaskStatus = 'pending' | 'running' | 'paused' |  'done' | 'failed'

export abstract class Task {
    status: TaskStatus = 'pending';

    protected constructor(protected ctx: AgentContext) {}

    abstract tick(): Promise<void>

    abstract get description(): string
}