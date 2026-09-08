/** Objective categories from playtest scope. */
export type ObjectiveCategory = "reconnaissance" | "rescue" | "hostiles" | "vendor";

export interface OperationalObjective {
    id: string;
    kind: ObjectiveCategory;
    /** Short label for UI. */
    label: string;
    /** Target value to complete. */
    target: number;
    /** Current progress. */
    progress: number;
    /** When target is met, objective is complete. */
    complete: boolean;
}

export interface PerformanceMetrics {
    sectorsExplored?: number;
    sectorsScanned?: number;
    actorsDefeated?: number;
    hubTrades?: number;
    objectivesCompleted?: number;
    resourcesEarned: number;
    startTime: number;
    endTime: number | null;

    // Legacy Migration Fields
    areasExplored: number;
    areasScanned: number;
    npcsDefeated: number;
    vendorTrades: number;
    questsCompleted: number;
}

export type ActiveQuest = OperationalObjective;

export type SessionScore = PerformanceMetrics;
