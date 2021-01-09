import { Block } from "./Block"

export abstract class Phase {

    abstract get displayName(): string

}

/**
 * In this phase the user positions the lasers.
 */
export class SetupPhase extends Phase {

    get displayName() {
        return 'Position lasers'
    }

}

/**
 * When starting simulation, there is a short delay to allow simulation controls to be used (pause, speed etc).
 */
export class StartPhase extends Phase {

    get displayName() {
        return 'Starting lasers...'
    }

}

/**
 * Visual phase that shoots a laser. At the end of the phase, on transition to BlockFallPhase, the blocks hit
 * by laser will be destroyed/recolored etc and blocks will fall down when up in the air.
 */
export class LaserShotPhase extends Phase {

    constructor(public readonly order: number) {
        super()
    }

    get displayName() {
        return 'Shooting lasers with order ' + this.order
    }

}

/**
 * Phase where blocks fall down when they are up in the air. When there are more lasers to shoot, a 
 * LaserShotPhase will proceed after this phase, otherwise the ResultPhase.
 */
export class BlockFallPhase extends Phase {

    constructor(public readonly order: number) {
        super()
    }

    get displayName() {
        return 'Blocks falling...'
    }

}

export type MatchingBlock = {
    state: "wrongColor" | "matching" | "missing" | "overtowering"
    block: Block
}

/**
 * All lasers are shot, we display the matching blocks comparing the remaining blocks and the goal blocks.
 */
export class GoalMatchPhase extends Phase {

    constructor(
        public readonly matchingBlocks: MatchingBlock[], // visual aid on how blocks match with goal
        public readonly score: number // roughly the percentage of goal blocks matching
    ) {
        super()
    }

    get displayName() {
        return 'Matching blocks with goal blocks'
    }

}

/**
 * Simulation is finished, we present the result here. Show score and actions to continue or restart the
 * laser if incomplete.
 */
export class ResultPhase extends Phase {

    constructor(
        public readonly result: GoalMatchPhase
    ) {
        super()
    }

    get displayName() {
        return 'Simluation finished'
    }

}

/**
 * This phase is active as long as a level is being edited in the level editor.
 */
export class LevelEditorPhase extends Phase {

    get displayName() {
        return 'Editing level'
    }

}