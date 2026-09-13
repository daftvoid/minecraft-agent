import type {Task} from "./Task.ts";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";

type TaskManagerEvents = {
    taskDone: (task: Task) => void;
    taskFailed: (task: Task) => void;
}

export class TaskManager extends (EventEmitter as new () => TypedEventEmitter<TaskManagerEvents>) {
    current: Task | null = null;
    private _busy: boolean = false;

    taskQueue: Task[] = []

    get busy(): boolean {
        return this._busy;
    }

    async tick() {
        this._busy = true;

        // add new task from queue
        if (this.current === null) {
            if (this.taskQueue.length === 0) {
                this._busy = false;
                return;
            }

            this.current = this.taskQueue.shift()!;
        }

        // tick
        try {
            await this.current.tick()
        } catch (error) {
            console.error(error);
            this.current.status = 'failed'
        }

        // task done or failed w/ eventemitter
        if (this.current.status === 'done') {
            this.emit('taskDone', this.current);
            this.current = null;
        } else if (this.current.status === 'failed') {
            this.emit('taskFailed', this.current);
            this.current = null;
        }

        this._busy = false;
    }

    set(task: Task) {
        if (this.current) {
            this.current.status = 'paused';
            this.taskQueue.unshift(this.current);
        }

        task.status = 'running';
        this.current = task;

        this.clean()
    }

    add(task: Task) {
        task.status = 'pending';
        this.taskQueue.push(task);

        this.clean()
    }

    removeCurrent() {
        if (this.current) {
            this.current.status = 'failed';
        }
    }

    protected clean() {
        this.taskQueue = this.taskQueue
            .filter((task) => task !== this.current)   // removes current task from taskQueue
            .filter((task) => task.status !== 'done') // removes done tasks
            .filter((task) => task.status !== 'running');
    }
}