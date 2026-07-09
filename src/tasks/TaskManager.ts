import type {Task} from "./Task.ts";

export class TaskManager {
    current: Task | null = null;
    private _busy: boolean = false;

    taskQueue: Task[] = []

    get busy(): boolean {
        return this._busy;
    }

    async tick() {
        this._busy = true;

        if (this.current === null) {
            if (this.taskQueue.length === 0) {
                this._busy = false;
                return;
            }

            this.current = this.taskQueue.shift()!;
        }

        await this.current.tick()

        if (this.current.status === 'done' || this.current.status === 'failed') {
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