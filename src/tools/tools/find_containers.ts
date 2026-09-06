import type { Tool } from "../Tool.ts";
import {Vec3} from "vec3";

const CONTAINER_BLOCKS = new Set([
    'chest', 'trapped_chest', 'barrel',
    'furnace', 'blast_furnace', 'smoker',
    'dispenser', 'dropper', 'hopper'
])

// ender_chest isn't a container, as it doesn't actually have items stored,
// it's just a reference to the players ender_chest inv

function isContainerBlock(name: string): boolean {
    return CONTAINER_BLOCKS.has(name) || name.endsWith('shulker_box')
}

// from the "left" chest where the "right" chest is located
const directions = {
    "north": new Vec3(1, 0, 0),
    "south": new Vec3(-1, 0, 0),

    "east": new Vec3(0, 0, 1),
    "west": new Vec3(0, 0, -1),
}

// inverting the cords from above if it's the "right" chest
const typeToOffsetMultiplier = (t: string) => t === "right" ? -1 : 1

export const find_containers: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'find_containers',
            description: `Finds containers (chests, barrels, furnaces, dispensers, etc) near the bot. Double chests are reported as one 54-slot container, not two. Default radius: 50, default count: 25`,
            parameters: {
                type: 'object',
                properties: {
                    radius: { type: 'number' },
                    count: { type: 'number' }
                },
                required: []
            }
        }
    },

    async execute(args, ctx) {
        const bot = ctx.bot
        const { radius, count } = args as { radius?: number, count?: number }

        const positions = bot.findBlocks({
            maxDistance: radius ?? 50,
            count: count ?? 25,
            matching: (b) => isContainerBlock(b.name)
        })

        if (positions.length === 0) {
            return `No containers found nearby.`
        }

        const seen = new Set<string>()
        const lines: string[] = []

        for (const pos of positions) {
            const key = `${pos.x},${pos.y},${pos.z}`
            if (seen.has(key)) continue
            seen.add(key)

            const block = bot.blockAt(pos)
            if (!block) continue

            const isChest = block.name === 'chest' || block.name === 'trapped_chest'
            const chestType = isChest ? (block.getProperties()?.type as string | undefined) : undefined

            if (chestType && chestType !== 'single') {
                const facing = block.getProperties()?.facing as string

                const offset = (directions as Record<string, Vec3>)[facing]
                if (!offset) continue

                const oM = typeToOffsetMultiplier(chestType)

                offset.multiply(new Vec3(oM, oM, oM))

                const partnerCords = offset.clone().add(pos as Vec3)

                const partner = bot.blockAt(partnerCords)

                if (partner) {
                    seen.add(`${partner.position.x},${partner.position.y},${partner.position.z}`)
                    lines.push(
                        `Double ${block.name} (54 slots) - open either half: ` +
                        `{X: ${pos.x}, Y: ${pos.y}, Z: ${pos.z}} or ` +
                        `{X: ${partner.position.x}, Y: ${partner.position.y}, Z: ${partner.position.z}}`
                    )
                    continue
                }
            }

            lines.push(`${block.name} at {X: ${pos.x}, Y: ${pos.y}, Z: ${pos.z}}`)
        }

        return `Found ${lines.length} container(s):\n${lines.join('\n')}`
    }
}