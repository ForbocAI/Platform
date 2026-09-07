import { choose } from '@/features/core/fp/choice';
import { UNEXPECTEDLY_TABLE } from '../tables';
import inquiryData from '../data/inquiry.json';
import type { InquiryResponse } from '../../types';

type InquiryQualifier = NonNullable<InquiryResponse['qualifier']>;

interface InquiryOutcome {
  readonly minimumRoll: number;
  readonly answer: InquiryResponse['answer'];
  readonly qualifier?: InquiryQualifier;
  readonly description: string;
}

const outcomes = inquiryData.outcomes as readonly InquiryOutcome[];

const rollDie = (sides: number): number =>
  Math.floor(Math.random() * sides) + inquiryData.dice.minimumRoll;

const renderUnexpectedDescription = (
  description: string,
  event: string,
): string => inquiryData.unexpectedDescriptionTemplate
  .replace(inquiryData.tokens.description, description)
  .replace(inquiryData.tokens.event, event);

const selectOutcome = (roll: number): InquiryOutcome =>
  outcomes.find((outcome) => roll >= outcome.minimumRoll) ?? outcomes.at(-1)!;

const unexpectedProjection = (outcome: InquiryOutcome) => choose(
  outcome.qualifier === inquiryData.unexpectedQualifier,
  () => {
    const unexpectedRoll = rollDie(inquiryData.dice.unexpectedSides);
    const unexpectedEvent = UNEXPECTEDLY_TABLE[
      unexpectedRoll - inquiryData.dice.minimumRoll
    ] ?? inquiryData.fallbackUnexpectedEvent;
    return {
      description: renderUnexpectedDescription(outcome.description, unexpectedEvent),
      unexpectedRoll,
      unexpectedEvent,
    };
  },
  () => ({ description: outcome.description }),
);

export const simulateInquiryResponse = (
  question: string,
  currentSystemStress: number,
): InquiryResponse => {
  void question;
  const rawRoll = rollDie(inquiryData.dice.primarySides);
  const stressedRoll = choose(
    rawRoll > inquiryData.dice.stressPivot,
    () => rawRoll + currentSystemStress,
    () => rawRoll - currentSystemStress,
  );
  const roll = Math.min(
    inquiryData.dice.primarySides,
    Math.max(inquiryData.dice.minimumRoll, stressedRoll),
  );
  const outcome = selectOutcome(roll);
  return {
    answer: outcome.answer,
    qualifier: outcome.qualifier,
    roll,
    surgeUpdate: choose(
      Boolean(outcome.qualifier),
      () => inquiryData.surge.qualified,
      () => inquiryData.surge.unqualified,
    ),
    ...unexpectedProjection(outcome),
  };
};
