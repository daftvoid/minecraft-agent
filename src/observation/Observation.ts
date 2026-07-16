import type {AgentContext} from "../AgentContext.ts";
import type {Item} from "prismarine-item";

export abstract class Observation {
    abstract priority: number;
    abstract shouldWake: boolean;

    abstract toPrompt(): string;

    toMessages(): any[] {
        return [{
            role: 'system',
            content: this.toPrompt(),
        }]
    }

    /**
     * Return true if this observation absorbed `other` into itself.
     *
     * Default: no merging.
     * @param other Observation to be absorbed
     */
    merge(other: Observation): boolean {
        return false;
    }
}


export class ChatObservation extends Observation {
    priority = 15;
    shouldWake = true;

    constructor(
        public player: string,
        public message: string
    ) {
        super();
    }

    toPrompt() {
        return `${this.player} said: "${this.message}"`;
    }

    override toMessages(): any[] {
        return [{
            role: 'user',
            content: this.toPrompt(),
        }]
    }
}


export class PlayerJoinedObservation extends Observation {
    priority = 10;
    shouldWake = true;

    constructor(public player: string) {
        super();
    }

    toPrompt() {
        return `${this.player} joined the game.`;
    }
}


export class PlayerLeftObservation extends Observation {
    priority = 5;
    shouldWake = false;

    constructor(public player: string) {
        super();
    }

    toPrompt() {
        return `${this.player} left the game.`;
    }
}


export class NightObservation extends Observation {
    priority = 10;
    shouldWake = false;

    toPrompt() {
        return 'It has become night.';
    }
}


export class DayObservation extends Observation {
    priority = 10;
    shouldWake = false;

    toPrompt() {
        return 'It has become day.';
    }
}


export class DeathObservation extends Observation {
    priority = 20;
    shouldWake = true;


    constructor(private deathmsg: string) {
        super();
    }

    toPrompt() {
        return `$system$ Someone died! Death Message: \"${this.deathmsg}\".`;
    }

    override toMessages(): any[] {
        return [{
            role: 'user',
            content: this.toPrompt(),
        }]
    }

}


export class AgentJoinedObservation extends Observation {
    priority = 20;
    shouldWake = true;

    toPrompt() {
        return 'You just joined the game.';
    }
}


export class IdleObservation extends Observation {
    priority = 0;
    shouldWake = false;

    toPrompt() {
        return "(No new events. This is a routine check-in - only act or speak if there is something worth doing.)";
    }
}


export class ItemPickupObservation extends Observation {
    get priority(): number {
        return 1 + this.items.length ** 0.5
    }

    shouldWake: boolean = false;

    private items: Item[] = []

    constructor(item: Item) {
        super();

        this.items.push(item)
    }

    toPrompt(): string {
        const names_counts = new Map<string, number>()

        for (const item of this.items) {
            const name = item.name

            names_counts.set(name, (names_counts.getOrInsert(name, 0) + item.count))
        }

        const prompt = '%system% A few items have been picked up:\n' +
            names_counts
                .entries()
                .map(([i, c]) => `- ${c}x ${i}`)
                .toArray()
                .join('\n');

        console.log(prompt);

        return prompt;
    }

    override toMessages(): any[] {
        return [{
            role: 'user',
            content: this.toPrompt(),
        }]
    }

    override merge(other: Observation): boolean {
        if (!(other instanceof ItemPickupObservation)) {return false;}

        this.items.push(...other.items)

        return true;
    }
}