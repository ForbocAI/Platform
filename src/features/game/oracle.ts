import type { OracleResult } from "./types";
import { UNEXPECTEDLY_TABLE } from "./mechanics/tables";

export function consultOracle(question: string, currentSurgeCount: number): OracleResult {
    const d100 = Math.floor(Math.random() * 100) + 1;
    let modifiedRoll = d100;

    if (d100 > 50) {
        modifiedRoll += currentSurgeCount;
    } else {
        modifiedRoll -= currentSurgeCount;
    }

    if (modifiedRoll < 1) modifiedRoll = 1;
    if (modifiedRoll > 100) modifiedRoll = 100;

    let resultString = "";
    let answer: "Yes" | "No";
    let qualifier: "and" | "but" | "unexpectedly" | undefined;
    let newSurge = 0;

    if (modifiedRoll >= 96) {
        answer = "Yes";
        qualifier = "unexpectedly";
        resultString = "The void screams affirmation, and unexpectedly...";
    } else if (modifiedRoll >= 86) {
        answer = "Yes";
        qualifier = "but";
        resultString = "The void whispers yes, but...";
    } else if (modifiedRoll >= 81) {
        answer = "Yes";
        qualifier = "and";
        resultString = "The void answers yes, and...";
    } else if (modifiedRoll >= 51) {
        answer = "Yes";
        resultString = "The void whispers affirmation.";
    } else if (modifiedRoll >= 21) {
        answer = "No";
        resultString = "The void remains silent.";
    } else if (modifiedRoll >= 16) {
        answer = "No";
        qualifier = "and";
        resultString = "The void rejects your query, and...";
    } else if (modifiedRoll >= 6) {
        answer = "No";
        qualifier = "but";
        resultString = "The void is silent, but...";
    } else {
        answer = "No";
        qualifier = "unexpectedly";
        resultString = "The void recoils, and unexpectedly...";
    }

    let description = resultString;

    if (!qualifier) {
        newSurge = 2;
    } else {
        newSurge = -1;
    }

    let unexpectedRoll: number | undefined;
    let unexpectedEventName: string | undefined;

    if (qualifier === "unexpectedly") {
        const d20 = Math.floor(Math.random() * 20) + 1;
        unexpectedRoll = d20;
        unexpectedEventName = UNEXPECTEDLY_TABLE[d20 - 1] || "Re-roll";
        description += ` [EVENT: ${unexpectedEventName}]`;
    }

    return {
        answer,
        qualifier,
        description,
        roll: modifiedRoll,
        surgeUpdate: newSurge,
        unexpectedRoll,
        unexpectedEvent: unexpectedEventName
    };
}
