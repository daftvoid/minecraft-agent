import {Task} from "../Task.ts";
import type {AgentContext} from "../../AgentContext.ts";
import {goals, Movements} from "mineflayer-pathfinder";
import type { Entity } from "prismarine-entity";
import minecraftData from "minecraft-data";

const itemAttackSpeeds: Record<string, number> = {
    'wooden_sword': 1.6,
    'stone_sword': 1.6,
    'copper_sword': 1.6,
    'iron_sword': 1.6,
    'gold_sword': 1.6,
    'diamond_sword': 1.6,
    'netherite_sword': 1.6,

    'trident': 1.1,
    'mace': 0.6,
}

export class KillEntityTask extends Task {
    private lastAttack = 0;

    constructor(
        ctx: AgentContext,
        private id: number,
    ) {
        super(ctx);
    }

    private get entity(): Entity | undefined {
        const e = Object.values(this.ctx.bot.entities).find(e => e.id === this.id)

        if (!e) {
            this.status = 'done';
            return undefined;
        }

        return e
    }

    get description(): string {
        const entity = this.entity;

        if (!entity) {
            return `Hunting Entity: Entity is dead.`;
        }

        return `Hunting Entity name=${entity.name} with id=${entity.id}`;
    }

    async tick(): Promise<void> {
        if (this.status === 'done') return;

        const entity = this.entity;

        if (!entity) {
            return;
        }

        const mainhand = this.ctx.bot.heldItem

        const attackSpeed = mainhand && itemAttackSpeeds[mainhand.name] ? itemAttackSpeeds[mainhand.name] : 1;

        console.log(attackSpeed)

        const defaultMove = new Movements(this.ctx.bot)

        this.ctx.bot.pathfinder.setMovements(defaultMove)

        try {
            await this.ctx.bot.pathfinder.goto(new goals.GoalFollow(this.entity, 4.5))
        } catch (e) {
            console.log(e);
        }


        if (this.ctx.bot.time.time > this.lastAttack + 20 / (attackSpeed || 10)) {
            this.ctx.bot.attack(entity);
            this.lastAttack = this.ctx.bot.time.time
        }
    }
}