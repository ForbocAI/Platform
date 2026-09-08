export interface QueryResult {
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    surgeUpdate: number;
    unexpectedRoll?: number;
    unexpectedEvent?: string;
    oracleAvailable?: boolean;
}

export type ProgressionPhase = "PhaseA" | "PhaseB" | "PhaseC";

export type EpisodePhase = "Exposition" | "Rising Action" | "Climax" | "Epilogue";

export type MutationType =
    | "foreshadowing"
    | "tying_off"
    | "to_conflict"
    | "costume_change"
    | "key_grip"
    | "to_knowledge"
    | "framing"
    | "set_change"
    | "upstaged"
    | "pattern_change"
    | "limelit"
    | "entering_the_red"
    | "to_endings"
    | "montage"
    | "enter_stage_left"
    | "cross_stitch"
    | "six_degrees"
    | "reroll_reserved";

export interface MutationModifier {
    type: MutationType;
    label: string;
    applySetChange?: boolean;
    applyEnteringRed?: boolean;
    applyEnterStageLeft?: boolean;
    suggestNextStage?: StageOfScene;
}

export interface DataPoint {
    id: string;
    sourceQuestion?: string;
    sourceAnswer?: string;
    text: string;
    isFollowUp: boolean;
    questionKind?: string;
    timestamp: number;
}

export interface NarrativeStream {
    id: string;
    name?: string;
    stage?: StageOfScene;
    visitedSceneIds: string[];
    relatedNpcIds: string[];
    facts: string[];
    createdAt?: number;
}

export interface SegmentRecord {
    id: string;
    locationAreaId: string;
    mainThreadId: string;
    stageOfScene: StageOfScene;
    participantIds?: string[];
    status?: "active" | "faded";
    openedAt?: number;
    closedAt?: number;
}

export interface NarrativeNode {
    id: string;
    theme: string;
    stage: EpisodePhase;
    threadIds: string[];
    createdAt: number;
}

export type Fact = DataPoint;

export type InquiryResponse = QueryResult;

export type SceneRecord = SegmentRecord;

export type StageOfScene = "To Knowledge" | "To Conflict" | "To Endings";

export type Thread = NarrativeStream;

export type UnexpectedlyEffect = MutationModifier;

export type Vignette = NarrativeNode;

export type VignetteStage = EpisodePhase;
