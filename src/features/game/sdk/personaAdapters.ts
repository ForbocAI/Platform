import type { BrowserNpcRegistration } from '@forbocai/browser';
import { choose } from '@/features/core/fp/choice';
import personaData from './data/personas.json';

export type StructuredPersona = BrowserNpcRegistration['structuredPersona'];

export interface AgentCortexIdentity {
  readonly agentId: string;
  readonly displayName: string;
  readonly agentType: 'npc' | 'companion';
  readonly lore?: {
    readonly role: string;
    readonly description: string;
  };
}

export interface VendorCortexIdentity {
  readonly vendorId: string;
  readonly name: string;
  readonly description: string;
  readonly specialty?: string;
}

const render = (
  template: string,
  values: Readonly<Record<string, string>>,
): string => Object.entries(values).reduce(
  (text, [key, value]) => text.replaceAll(`{${key}}`, value),
  template,
);

const copyPersona = (persona: StructuredPersona): StructuredPersona => ({
  traits: [...persona.traits],
  goals: [...persona.goals],
  relationships: [...persona.relationships],
  world: [...persona.world],
  speakingStyle: [...persona.speakingStyle],
  constraints: [...persona.constraints],
});

export const oraclePersona = (): StructuredPersona => copyPersona(personaData.oracle);
export const playerPersona = (): StructuredPersona => copyPersona(personaData.player);

const companionPersona = (
  identity: AgentCortexIdentity,
  lore: NonNullable<AgentCortexIdentity['lore']>,
): StructuredPersona => {
  const values = { name: identity.displayName, role: lore.role };
  return {
    traits: [render(personaData.companion.trait, values), lore.description],
    goals: [render(personaData.companion.goal, values)],
    relationships: [personaData.companion.relationship],
    world: [...personaData.companion.world],
    speakingStyle: [...personaData.companion.speakingStyle],
    constraints: [...personaData.companion.constraints],
  };
};

const genericAgentPersona = (identity: AgentCortexIdentity): StructuredPersona => {
  const traitTemplate = choose(
    identity.agentType === 'companion',
    () => personaData.agent.companionTrait,
    () => personaData.agent.npcTrait,
  );
  const relationship = choose(
    identity.agentType === 'companion',
    () => personaData.agent.companionRelationship,
    () => personaData.agent.npcRelationship,
  );
  return {
    traits: [render(traitTemplate, { name: identity.displayName })],
    goals: [personaData.agent.goal],
    relationships: [relationship],
    world: [...personaData.agent.world],
    speakingStyle: [...personaData.agent.speakingStyle],
    constraints: [...personaData.agent.constraints],
  };
};

export const agentPersona = (identity: AgentCortexIdentity): StructuredPersona =>
  choose(
    Boolean(identity.lore),
    () => companionPersona(identity, identity.lore!),
    () => genericAgentPersona(identity),
  );

export const vendorPersona = (identity: VendorCortexIdentity): StructuredPersona => {
  const values = { name: identity.name, specialty: identity.specialty ?? '' };
  const trait = choose(
    Boolean(identity.specialty),
    () => render(personaData.vendor.specialistTrait, values),
    () => render(personaData.vendor.generalistTrait, values),
  );
  return {
    traits: [trait, identity.description],
    goals: [personaData.vendor.goal],
    relationships: [personaData.vendor.relationship],
    world: [...personaData.vendor.world],
    speakingStyle: [...personaData.vendor.speakingStyle],
    constraints: [...personaData.vendor.constraints],
  };
};
