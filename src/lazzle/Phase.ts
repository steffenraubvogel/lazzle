export class Phase {
}

export class SetupPhase extends Phase {
}

export class LaserShotPhase extends Phase {

    constructor(public readonly order: number) {
        super()
    }

}

export class BlockFallPhase extends Phase {
}

export class ResultPhase extends Phase {

    constructor(
        public readonly score: number // percentage of goal blocks matching
    ) {
        super()
    }

}

export class LevelEditorPhase extends Phase {
}