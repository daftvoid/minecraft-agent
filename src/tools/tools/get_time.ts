import type {Tool} from "../Tool.ts";

export const get_time: Tool = {
    schema: {
        type: 'function',
        function: {
            name: 'get_time',
            description:
`Gets the current time in ticks, the day, the dayLightCycle gamerule and the moon phase.
Only mention the Time as string unless the user asks for more precise information`,
        }
    },

    async execute(args, ctx) {
        const time = ctx.bot.time

        const tickTime = time.timeOfDay;

        let stringTime = 'unavailable';

        if (tickTime >= 0 && tickTime < 1000) {
            stringTime = 'sunrise';
        } else if (tickTime >= 1000 && tickTime < 6000) {
            stringTime = 'day';
        } else if (tickTime >= 6000 && tickTime < 12000) {
            stringTime = 'noon';
        } else if (tickTime >= 12000 && tickTime < 13000) {
            stringTime = 'sunset';
        } else if (tickTime >= 13000 && tickTime < 18000) {
            stringTime = 'night (pre-midnight)';
        } else if (tickTime >= 18000) {
            stringTime = 'night (post-midnight)';
        }

        return `Time: ${time.timeOfDay}
Time (string): ${stringTime}
IsDay: ${time.isDay}
Day: ${time.day}
Time can advance: ${time.doDaylightCycle}
Moon Phase: ${time.moonPhase}`
    }
}