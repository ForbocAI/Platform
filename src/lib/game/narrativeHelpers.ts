import type { OracleResult, UnexpectedlyEffect, StageOfScene } from "@/features/game/types";
import { LORE_VIGNETTE_THEMES } from "@/features/game/content";

export const VIGNETTE_THEMES = [
  "Shadows of the Past",
  "Lost Technology",
  "Betrayal",
  "Hope in Darkness",
  "The Void Calls",
  "Ancient Rituals",
  "Technomancer's Dream",
  "Cyber-Organic Fusion",
  "Echoes of Silence",
  "Forbidden Knowledge",
  "The Machine God",
  "Flesh and Steel",
  ...LORE_VIGNETTE_THEMES,
];

/** Generate obvious follow-up facts from a Loom answer (Familiar: "record the answer, then create a few obvious follow-up facts"). */
export function generateFollowUpFacts(
  question: string,
  result: OracleResult
): string[] {
  const q = question.toLowerCase();
  const { answer, qualifier } = result;
  const facts: string[] = [];

  if (answer === "Yes") {
    facts.push(`The answer was yes. ${qualifier === "and" ? "And there is more to it." : qualifier === "but" ? "But with a complication." : ""}`);
  } else {
    facts.push(`The answer was no. ${qualifier === "and" ? "And that has further implications." : qualifier === "but" ? "But something else may be true." : ""}`);
  }

  if (q.includes("lock") || q.includes("door")) {
    if (answer === "Yes") facts.push("Something or someone has reason to restrict access.");
    else facts.push("Access here is not deliberately blocked.");
  }
  if (q.includes("watch") || q.includes("see") || q.includes("notice")) {
    if (answer === "Yes") facts.push("Someone or something is observing.");
    else facts.push("No obvious observer is present.");
  }
  if (q.includes("danger") || q.includes("enemy") || q.includes("hostile")) {
    if (answer === "Yes") facts.push("Threat is present; the scene is in the red.");
    else facts.push("The immediate area seems clear of that threat.");
  }
  if (q.includes("inhabit") || q.includes("someone") || q.includes("people")) {
    if (answer === "Yes") facts.push("There are signs of presence or culture.");
    else facts.push("The place appears abandoned or empty of that.");
  }

  return facts.slice(0, 3);
}

const UNEXPECTEDLY_EFFECT_MAP: Record<number, UnexpectedlyEffect["type"]> = {
  1: "foreshadowing",
  2: "tying_off",
  3: "to_conflict",
  4: "costume_change",
  5: "key_grip",
  6: "to_knowledge",
  7: "framing",
  8: "set_change",
  9: "upstaged",
  10: "pattern_change",
  11: "limelit",
  12: "entering_the_red",
  13: "to_endings",
  14: "montage",
  15: "enter_stage_left",
  16: "cross_stitch",
  17: "six_degrees",
  18: "reroll_reserved",
  19: "reroll_reserved",
  20: "reroll_reserved",
};

/** Resolve Table 2 d20 (1–20) to mechanical effect for application in game/narrative. */
export function resolveUnexpectedlyEffect(
  d20Index: number,
  label: string
): UnexpectedlyEffect {
  const type = UNEXPECTEDLY_EFFECT_MAP[d20Index] ?? "reroll_reserved";
  const effect: UnexpectedlyEffect = { type, label };

  switch (type) {
    case "set_change":
      effect.applySetChange = true;
      break;
    case "entering_the_red":
      effect.applyEnteringRed = true;
      break;
    case "enter_stage_left":
      effect.applyEnterStageLeft = true;
      break;
    case "to_conflict":
      effect.suggestNextStage = "To Conflict";
      break;
    case "to_knowledge":
      effect.suggestNextStage = "To Knowledge";
      break;
    case "to_endings":
      effect.suggestNextStage = "To Endings";
      break;
    default:
      break;
  }
  return effect;
}

/** Chipping vs cutting: direct questions (cutting) vs incremental (chipping). Heuristic from Familiar. */
export function classifyQuestion(question: string): "chipping" | "cutting" {
  const q = question.trim();
  const words = q.split(/\s+/).length;
  const lower = q.toLowerCase();

  const cuttingPhrases = [
    "is ... the",
    "did ... do",
    "does ... know",
    "are they the",
    "is he the",
    "is she the",
    "was that the",
    "will they",
    "did he kill",
    "did she betray",
  ];
  const hasCutting = cuttingPhrases.some((p) => {
    const pattern = p.replace(/\.\.\./g, "\\s+\\w+");
    return new RegExp(pattern, "i").test(lower);
  });
  if (hasCutting) return "cutting";

  const chippingStarts = ["is there", "are there", "do you see", "can we", "does the", "is the"];
  if (chippingStarts.some((s) => lower.startsWith(s)) && words <= 8) return "chipping";

  return words <= 6 ? "chipping" : "cutting";
}
