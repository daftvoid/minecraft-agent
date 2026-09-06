import type {Tool} from "../Tool.ts";

export const find_entities: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'find_entities',
            description: `Finds all entities of a type near the bot. Default count: 25. Use regex patterns to collapse multiple searches. The first entities in the list are closest to you.`,
            parameters: {
                type: 'object',
                properties: {
                    entity_type_regex: { type: 'string' },
                    radius: { type: 'number' },
                },
                required: ['entity_type_regex']
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot;
        const { entity_type_regex, radius } = args as { entity_type_regex: string, radius?: number }

        const regex = new RegExp(entity_type_regex, "i");

        const entities = Object.values(bot.entities)
            .filter(e => regex.test(e.name ?? ""))
            .filter(e => bot.entity.position.distanceTo(e.position) < (radius ?? 25))
            .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position))

        return `Found ${entities.length} entities: ${entities.map(e => `- ${e.displayName ?? e.username} (${e.name}) {${e.position}}`).join('\n')}`
    }
}
