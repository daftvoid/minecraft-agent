export type ObservationPriority = 'low' | 'medium' | 'high';

export abstract class Observation {
    abstract priority: ObservationPriority;
    abstract shouldWake: boolean;

    abstract toPrompt(): string;

    toMessages(): any[] {
        return [{
            role: 'system',
            content: this.toPrompt(),
        }]
    }
}


export class ChatObservation extends Observation {
    priority = 'high' as ObservationPriority;
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
    priority = 'medium' as ObservationPriority;
    shouldWake = true;

    constructor(public player: string) {
        super();
    }

    toPrompt() {
        return `${this.player} joined the game.`;
    }
}


export class NightObservation extends Observation {
    priority = 'low' as ObservationPriority;
    shouldWake = false;

    toPrompt() {
        return 'It has become night.';
    }
}


export class AgentJoinedObservation extends Observation {
    priority = 'high' as ObservationPriority;
    shouldWake = true;

    toPrompt() {
        return 'You just joined the game.';
    }
}