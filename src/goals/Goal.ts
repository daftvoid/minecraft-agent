export interface Step {
    id: string;
    desc: string;
    status: 'pending' | 'in_progress' | 'done' | 'failed';
}

export interface GoalState {
    activeGoal: string | null;
    activeSteps: Step[];
    backlog: string[];
}