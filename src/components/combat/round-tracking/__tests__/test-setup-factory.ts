import { IEncounter } from '@/lib/models/encounter/interfaces';
import {
  createMockEncounterWithRound,
  createRoundTrackerMocks,
  createUseRoundTrackingMocks,
  TEST_EFFECTS,
  TEST_TRIGGERS,
  TEST_HISTORY,
} from './round-tracking-test-helpers';

export interface TestSetupOptions {
  round?: number;
  withEffects?: boolean;
  withTriggers?: boolean;
  withHistory?: boolean;
  estimatedRoundDuration?: number;
  maxRounds?: number;
}

export interface RoundTrackingTestSetup {
  encounter: IEncounter;
  mocks: ReturnType<typeof createRoundTrackerMocks>;
  effects: any[];
  triggers: any[];
  history: any[];
  defaultProps: any;
}

export interface HookTestSetup {
  encounter: IEncounter;
  mocks: ReturnType<typeof createUseRoundTrackingMocks>;
  effects: any[];
  triggers: any[];
  options: any;
}

/**
 * Creates a standardized test setup for round tracking components
 */
export function createRoundTrackingTestSetup(options: TestSetupOptions = {}): RoundTrackingTestSetup {
  const {
    round = 2,
    withEffects = false,
    withTriggers = false,
    withHistory = false,
    estimatedRoundDuration,
    maxRounds,
  } = options;

  const encounter = createMockEncounterWithRound(round);
  const mocks = createRoundTrackerMocks();

  const effects = withEffects ? TEST_EFFECTS : [];
  const triggers = withTriggers ? TEST_TRIGGERS : [];
  const history = withHistory ? TEST_HISTORY : [];

  const defaultProps = {
    encounter,
    effects,
    triggers,
    history,
    estimatedRoundDuration,
    maxRounds,
    ...mocks,
  };

  return {
    encounter,
    mocks,
    effects,
    triggers,
    history,
    defaultProps,
  };
}

/**
 * Creates a standardized test setup for hook testing
 */
export function createHookTestSetup(options: TestSetupOptions = {}): HookTestSetup {
  const {
    round = 2,
    withEffects = false,
    withTriggers = false,
    maxRounds,
  } = options;

  const encounter = createMockEncounterWithRound(round);
  const mocks = createUseRoundTrackingMocks();

  const effects = withEffects ? TEST_EFFECTS : [];
  const triggers = withTriggers ? TEST_TRIGGERS : [];

  const hookOptions = {
    initialEffects: effects,
    initialTriggers: triggers,
    maxRounds,
  };

  return {
    encounter,
    mocks,
    effects,
    triggers,
    options: hookOptions,
  };
}

/**
 * Standard beforeEach setup for round tracking tests
 */
export function setupRoundTrackingTest(options: TestSetupOptions = {}) {
  let testSetup: RoundTrackingTestSetup;

  beforeEach(() => {
    jest.clearAllMocks();
    testSetup = createRoundTrackingTestSetup(options);
  });

  return () => testSetup;
}

/**
 * Standard beforeEach setup for hook tests
 */
export function setupHookTest(options: TestSetupOptions = {}) {
  let testSetup: HookTestSetup;

  beforeEach(() => {
    jest.clearAllMocks();
    testSetup = createHookTestSetup(options);
  });

  return () => testSetup;
}