import type {AgentContext} from "../AgentContext.ts";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";

type TaskEvents = {
    statusChange: (old: TaskStatus, current: TaskStatus) => void
}

export type TaskStatus = 'pending' | 'running' | 'paused' |  'done' | 'failed'

export abstract class Task extends (EventEmitter as new () => TypedEventEmitter<TaskEvents>) {
    private _status: TaskStatus = 'pending';


    get status(): TaskStatus {
        return this._status;
    }

    set status(value: TaskStatus) {
        if (this._status === value) {
            return;
        }

        this.emit('statusChange', this.status, value)

        this._status = value;
    }

    protected constructor(protected ctx: AgentContext) {
        super();
    }

    abstract tick(): Promise<void>

    abstract get description(): string
}