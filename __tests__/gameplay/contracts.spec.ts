import { describe, expectTypeOf, it } from 'vitest';
import type { Asset, InventoryComponent } from '@/features/game/types';
import type { PerformanceMetrics } from '@/features/game/store/objectives';
import type {
  MutationModifier,
  NarrativeNode,
  NarrativeStream,
  QueryResult,
  SegmentRecord,
  StageOfScene,
} from '@/features/narrative/types';
import scenarios from '../../data/tests/game-contracts.json';

describe(scenarios.suite, () => {
  it(scenarios.inventory, () => {
    expectTypeOf<InventoryComponent['weapons']>().toEqualTypeOf<string[]>();
    expectTypeOf<InventoryComponent['items']>().toEqualTypeOf<Asset[]>();
    expectTypeOf<InventoryComponent['items'][number]>().not.toBeAny();
  });

  it(scenarios.closedRecords, () => {
    expectTypeOf<string>().not.toExtend<keyof PerformanceMetrics>();
    expectTypeOf<string>().not.toExtend<keyof QueryResult>();
    expectTypeOf<string>().not.toExtend<keyof MutationModifier>();
    expectTypeOf<string>().not.toExtend<keyof NarrativeStream>();
    expectTypeOf<string>().not.toExtend<keyof SegmentRecord>();
    expectTypeOf<string>().not.toExtend<keyof NarrativeNode>();
  });

  it(scenarios.narrative, () => {
    expectTypeOf<QueryResult['surgeUpdate']>().toEqualTypeOf<number>();
    expectTypeOf<MutationModifier['suggestNextStage']>()
      .toEqualTypeOf<StageOfScene | undefined>();
    expectTypeOf<NarrativeStream['visitedSceneIds']>().toEqualTypeOf<string[]>();
    expectTypeOf<SegmentRecord['stageOfScene']>().toEqualTypeOf<StageOfScene>();
    expectTypeOf<NarrativeNode['threadIds']>().toEqualTypeOf<string[]>();
  });
});
