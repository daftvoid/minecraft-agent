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