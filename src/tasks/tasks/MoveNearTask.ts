import { Task } from '../Task.ts';
import type { AgentContext } from '../../AgentContext.ts';
import { goals, Movements } from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';
import type {Tool} from "../../tools/Tool.ts";
import type {Bot} from "mineflayer";

export class MoveNearTask extends Task {
	private static movements: Movements;

	static getMovements(bot: Bot): Movements {
		if (MoveNearTask.movements) {
			return MoveNearTask.movements;
		}

		const movements = new Movements(bot);
		movements.canOpenDoors = true;

		movements.blocksToAvoid.add(bot.registry.blocksByName['water']?.id!)

		for (const block of Object.values(bot.registry.blocksByName)) {
			if (
				(block.name.includes('door') || block.name.includes('fence_gate'))
				&& !block.name.includes('iron')
			) {
				movements.blocksCantBreak.add(block.id);
			}
		}

		const originalGetBlock = movements.getBlock.bind(movements);

		movements.getBlock = (pos, dx, dy, dz) => {
			const info = originalGetBlock(pos, dx, dy, dz);

			if (
				(info.name.includes('door') || info.name.includes('fence_gate')) &&
				!info.name.includes('iron')
			) {
				info.safe = true;

				if (!info.getProperties().open) {
					info.openable = true;
				}

				console.log(info);
			}

			return info;
		};

		MoveNearTask.movements = movements;
		return MoveNearTask.movements;
	}

	private started = false;
	private target = new Vec3(0, 0, 0); // set in constructor from x,y,z
	private stuckPos: Vec3 | null = null;
	private stuckTicks = 0;

	private failedReason: 'generic' | 'stuck' | 'no_path' = 'generic';

	constructor(
		ctx: AgentContext,
		private x: number,
		private y: number,
		private z: number,
		private range?: number,
	) {
		super(ctx);
		this.target = new Vec3(x, y, z);

		this.on('statusChange', (_, status) => {
			if (status === 'stopped') {
				this.ctx.bot.pathfinder.setGoal(null);
			}
		});

		ctx.bot.once('goal_reached', () => {
			console.log('goal_reached');
			console.log(this.status);

			if (this.status !== 'running') return;
			this.status = 'done';
		});

		const pathUpdate = (results: any) => {
			if (this.status !== 'running') {
				ctx.bot.off('path_update', pathUpdate);
				return;
			}

			if (results.status === 'noPath') {
				this.failedReason = 'no_path';
				this.status = 'failed';
			}
		};

		ctx.bot.on('path_update', pathUpdate);
	}

	get description(): string {
		return `Moving towards X: ${this.x.toFixed(1)}, Y: ${this.y.toFixed(1)}, Z: ${this.z.toFixed(1)}`;
	}

	get doneMessage(): string {
		return `Reached destination - X: ${this.x.toFixed(1)}, Y: ${this.y.toFixed(1)}, Z: ${this.z.toFixed(1)}`;
	}

	get failedMessage(): string {
		const pos = this.ctx.bot.entity.position;

		if (this.failedReason === 'stuck') {
			return `You got stuck at {X :${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}}.`;
		} else if (this.failedReason === 'no_path') {
			return `No path found to {X: ${this.x.toFixed(1)}, Y: ${this.y.toFixed(1)}, Z: ${this.z.toFixed(1)}}`;
		}
		{
			return 'MoveNearTask failed because of a generic reason.';
		}
	}

	async tick(): Promise<void> {
		if (this.status !== 'running') return;

		if (!this.started) {
			this.started = true;

			// already there check
			if (
				this.ctx.bot.entity.position.distanceTo(this.target) <=
				(this.range ?? 0)
			) {
				this.status = 'done';
				return;
			}

			this.ctx.bot.pathfinder.setMovements(MoveNearTask.getMovements(this.ctx.bot));
			this.ctx.bot.pathfinder.setGoal(
				new goals.GoalNear(this.x, this.y, this.z, this.range ?? 1),
			);
			return;
		}

		// stuck / unreachable detection
		const pos = this.ctx.bot.entity.position;
		if (this.stuckPos && pos.distanceTo(this.stuckPos) < 0.1) {
			this.stuckTicks++;
			if (this.stuckTicks > 100) {
				console.log('task failed, stuck!');
				this.status = 'failed';
			}
		} else {
			this.stuckTicks = 0;
			this.stuckPos = pos.clone();
		}
	}
}
