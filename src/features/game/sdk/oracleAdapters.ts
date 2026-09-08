import type { InquiryResponse, StageOfScene } from "@/features/narrative/types";
import { choose } from '@/features/core/fp/choice';
import oracleData from './data/oracle.json';

const render = (
  template: string,
  values: Readonly<Record<string, string>>,
): string => Object.entries(values).reduce(
  (text, [token, value]) => text.replaceAll(token, value),
  template,
);

const sanitization = oracleData.prompt.sanitization;
const verdictDelimiterPattern = new RegExp(
  sanitization.pattern,
  sanitization.flags,
);

const optionalSegment = (
  value: string | undefined,
  config: { readonly template: string; readonly token: string },
): string => choose(
  Boolean(value),
  () => render(config.template, { [config.token]: value! }),
  () => oracleData.prompt.emptySegment,
);

export const oracleMessages = Object.freeze({ ...oracleData.messages });
export const oracleDirections = Object.freeze([...oracleData.directions]);

export const isOracleDirection = (value: unknown): boolean =>
  typeof value === 'string' && oracleDirections.includes(value);

export const buildOracleNarrationPrompt = (
  question: string,
  verdict: InquiryResponse,
  stage?: StageOfScene,
): string => {
  const tokens = oracleData.prompt.tokens;
  return render(oracleData.prompt.template, {
    [tokens.question]: question.replace(
      verdictDelimiterPattern,
      sanitization.replacement,
    ),
    [tokens.answer]: verdict.answer,
    [tokens.qualifier]: optionalSegment(verdict.qualifier, {
      template: oracleData.prompt.qualifierTemplate,
      token: tokens.qualifier,
    }),
    [tokens.twist]: optionalSegment(verdict.unexpectedEvent, {
      template: oracleData.prompt.twistTemplate,
      token: tokens.event,
    }),
    [tokens.scene]: optionalSegment(stage, {
      template: oracleData.prompt.sceneTemplate,
      token: tokens.stage,
    }),
  });
};
