import { TFunction } from "react-i18next"
import { Block } from "./Block"

export abstract class Phase {

    getDisplayName(t: TFunction): string {
        return '<unknown phase>'
    }

}

/**
 * In this phase the user positions the lasers.
 */
export class SetupPhase extends Phase {
}

/**
 * When starting simulation, there is a short delay to allow simulation controls to be used (pause, speed etc).
 */
export class StartPhase extends Phase {

    getDisplayName(t: TFunction) {
        return t('game.play.sim.phase.starting')
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

    getDisplayName(t: TFunction) {
        return t('game.play.sim.phase.laser_shooting', { order: this.order })
    }

}

/**
 * Phase where blocks fall down when they are up in the air. When there are more lasers to shoot, a 
 * LaserShotPhase will proceed after this phase, otherwise the ResultPhase.
 */
export class BlockFallPhase extends Phase {

    constructor(public readonly order: number, public readonly changed: boolean) {
        super()
    }

    getDisplayName(t: TFunction) {
        return t('game.play.sim.phase.blocks_falling')
    }

}

export type MatchingBlock = {
    state: "wrongColor" | "wrongStrength" | "matching" | "missing" | "overtowering"
    goal?: Block // in case it exists
    block?: Block // in case it exists
    ref: Block // either goal or user block
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

    getDisplayName(t: TFunction) {
        return t('game.play.sim.phase.matching')
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

    getDisplayName(t: TFunction) {
        return t('game.play.sim.phase.result')
    }

}

/**
 * This phase is active as long as a level is being edited in the level editor.
 */
export class LevelEditorPhase extends Phase {

    constructor(
        public readonly onLeftLinkClick: (target: Block) => void,
        public readonly onTopLinkClick: (target: Block) => void,
        public readonly showLinkToNeighbor: (offsetX: number, offsetY: number, source: Block) => boolean
    ) {
        super()
    }

}

/**
 * Used to render a preview of the level where levels can be chosen from.
 */
export class LevelPreviewPhase extends Phase {
}