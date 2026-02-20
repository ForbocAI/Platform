import { UNEXPECTEDLY_TABLE } from "./mechanics/tables";
import type { InquiryResponse } from "./types";

export function simulateInquiryResponse(question: string, currentSystemStress: number): InquiryResponse {
    const d100 = Math.floor(Math.random() * 100) + 1;
    let modifiedRoll = d100;

    if (d100 > 50) {
        modifiedRoll += currentSystemStress;
    } else {
        modifiedRoll -= currentSystemStress;
    }

    if (modifiedRoll < 1) modifiedRoll = 1;
    if (modifiedRoll > 100) modifiedRoll = 100;

    let resultString = "";
    let answer: "Yes" | "No";
    let qualifier: "and" | "but" | "unexpectedly" | undefined;
    let surgeAdjustment = 0;

    if (modifiedRoll >= 96) {
        answer = "Yes";
        qualifier = "unexpectedly";
        resultString = "The system confirms, and unexpectedly...";
    } else if (modifiedRoll >= 86) {
        answer = "Yes";
        qualifier = "but";
        resultString = "The system tentatively confirms, but...";
    } else if (modifiedRoll >= 81) {
        answer = "Yes";
        qualifier = "and";
        resultString = "The system confirms, and...";
    } else if (modifiedRoll >= 51) {
        answer = "Yes";
        resultString = "The system confirms.";
    } else if (modifiedRoll >= 21) {
        answer = "No";
        resultString = "The system remains unresponsive.";
    } else if (modifiedRoll >= 16) {
        answer = "No";
        qualifier = "and";
        resultString = "The system denies the request, and...";
    } else if (modifiedRoll >= 6) {
        answer = "No";
        qualifier = "but";
        resultString = "The system is silent, but...";
    } else {
        answer = "No";
        qualifier = "unexpectedly";
        resultString = "The system errors, and unexpectedly...";
    }

    let description = resultString;

    if (!qualifier) {
        surgeAdjustment = 2;
    } else {
        surgeAdjustment = -1;
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
        surgeUpdate: surgeAdjustment,
        unexpectedRoll,
        unexpectedEvent: unexpectedEventName
    };
}
