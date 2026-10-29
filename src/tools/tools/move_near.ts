import type { Tool } from '../Tool.ts';
import { Movements, goals } from 'mineflayer-pathfinder';
import { MoveNearTask } from '../../tasks/tasks/MoveNearTask.ts';
import { Vec3 } from 'vec3';

export const move_near: Tool = {
	schema: {
		type: 'function',
		function: {
			name: 'move_near',
			description: `
            Moves the agent near a position. Automatically pathfinds there. 
            A response by this tool means the moving has been initiated, it does not mean that you've reached your goal. 
            Starts a MoveNearTask.`,
			parameters: {
				type: 'object',
				properties: {
					x: {
						type: 'integer',
						description: 'X position',
					},
					y: {
						type: 'integer',
						description: 'Y position',
					},
					z: {
						type: 'integer',
						description: 'Z position',
					},
					range: {
						type: 'integer',
						description: 'How near to move in blocks, default: 1',
					},
				},
				required: ['x', 'y', 'z'],
			},
		},
	},

	async execute(args, ctx) {
		const { x, y, z, range } = args as {
			x: number;
			y: number;
			z: number;
			range?: number;
		};

		ctx.tasks.add(new MoveNearTask(ctx, x, y, z, range ?? 1));

		const dist = ctx.bot.entity.position.distanceTo(new Vec3(x, y, z));
		return `Started MoveNearTask towards X: ${x}, Y: ${y}, Z: ${z} (distance ${dist.toFixed(1)}). A system observation will tell you when you have arrived.`;
	},
};
