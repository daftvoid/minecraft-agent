import {Task} from "../Task.ts";
import {Vec3} from "vec3";
import type {AgentContext} from "../../AgentContext.ts";
import {goals, Movements} from "mineflayer-pathfinder";

export class DigAreaTask extends Task {
    private iterator;

    constructor(
        ctx: AgentContext,
        private x1: number,
        private y1: number,
        private z1: number,
        private x2: number,
        private y2: number,
        private z2: number,
    ) {
        super(ctx);

        this.iterator = blocks(x1, y1, z1, x2, y2, z2)
    }

    get description(): string {
        return `Digging Area from (${this.x1}, ${this.y1}, ${this.z1}) to (${this.x2}, ${this.y2}, ${this.z2})`;
    }

    async tick(): Promise<void> {
        if (this.status === 'done') return;

        const next = this.iterator.next();

        if (next.done) {
            this.status = 'done';
            return;
        }

        const pos = next.value;

        const block = this.ctx.bot.blockAt(pos);

        if (!block) {
            return;
        }

        const defaultMove = new Movements(this.ctx.bot)

        this.ctx.bot.pathfinder.setMovements(defaultMove)

        try {
            await this.ctx.bot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, 4))
        } catch (e) {
            console.log(e);
        }

        await this.ctx.bot.dig(block)
    }
}



function* blocks(
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number
) {
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            for (let z = z1; z <= z2; z++) {
                yield new Vec3(x, y, z);
            }
        }
    }
}