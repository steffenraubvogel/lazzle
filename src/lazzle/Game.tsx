import { useEffect, useState } from "react";
import styles from "./Lazzle.module.scss";
import LaserComponent, { Laser } from "./Laser";
import BlockComponent, { Block } from "./Block";
import { Colors, Level, LevelBlock } from "./Levels";
import { BlockFallPhase, GoalMatchPhase, LaserShotPhase, MatchingBlock, Phase, ResultPhase, SetupPhase, StartPhase } from "./Phase";
import { Point, rayIntersectsBlock } from "./Geometry";
import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { ReactComponent as BullsEyeIcon } from "bootstrap-icons/icons/bullseye.svg"
import { ReactComponent as PlayIcon } from "bootstrap-icons/icons/play.svg"
import { ReactComponent as PauseIcon } from "bootstrap-icons/icons/pause.svg"
import { ReactComponent as SkipStartIcon } from "bootstrap-icons/icons/skip-start.svg"
import { ReactComponent as SkipEndIcon } from "bootstrap-icons/icons/skip-end.svg"
import { ReactComponent as RemoveIcon } from "bootstrap-icons/icons/x.svg"
import { ReactComponent as CheckIcon } from "bootstrap-icons/icons/check.svg"
import { ReactComponent as QuestionMarkIcon } from "bootstrap-icons/icons/question.svg"
import { ReactComponent as WrongColorIcon } from "./images/wrongColor.svg"

export default function Game(props: {
    level: Level,
    levelFinishedButtonText: string,
    onLevelFinished?: () => void, // full score reached
    onLevelFinishedClick: () => void // finish button clicked
}) {

    const [lasers, setLasers] = useState<Laser[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const [showGoal, setShowGoal] = useState<boolean>(false)
    const [goalBlocks, setGoalBlocks] = useState<Block[]>([])

    const [phase, setPhase] = useState<Phase>(new SetupPhase())
    const [speed, setSpeed] = useState<number>(1)

    useEffect(() => {
        loadLevel(props.level)
    }, [props.level])

    function loadLevel(level: Level, keepLasers: boolean = false) {
        if (!keepLasers) {
            setLasers(level.lasers.map(l => new Laser(l)))
        }

        setBlocks(level.blocks.map(b => new Block(b, level)))
        setGoalBlocks(level.goal.map(b => new Block(b, level)))

        setPhase(new SetupPhase())
    }

    function startLasers() {
        setShowGoal(false)
        setSpeed(1)
        setPhase(new StartPhase())
    }

    useEffect(() => {
        // phase has changed, trigger timer if necessary for next phase
        if (phase instanceof SetupPhase || phase instanceof ResultPhase || speed === 0) {
            // nothing to do here
            return
        }

        let timers: NodeJS.Timeout[] | undefined
        const timeModifier = 1 / speed

        if (phase instanceof StartPhase) {
            timers = [setTimeout(() => {
                setPhase(new LaserShotPhase(nextLaserOrder()!))
            }, 1000 * timeModifier)]
        }
        if (phase instanceof LaserShotPhase) {
            timers = [
                setTimeout(() => {
                    const audio = new Audio('/sound/laser.mp3')
                    audio.play()
                }, 800 * timeModifier / 4 * 3),

                setTimeout(() => {
                    afterLaserShot(phase.order)
                }, 800 * timeModifier)
            ]
        }
        if (phase instanceof BlockFallPhase) {
            timers = [setTimeout(() => {
                const next = nextLaserOrder(phase.order)

                if (!next) {
                    afterAllLasersShot()
                }
                else {
                    setPhase(new LaserShotPhase(next))
                }
            }, 1200 * timeModifier)]
        }
        if (phase instanceof GoalMatchPhase) {
            timers = [setTimeout(() => {
                setPhase(new ResultPhase(phase))
            }, 3000 * timeModifier)]
        }

        return timers !== undefined ? () => timers?.forEach(timer => clearTimeout(timer)) : undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, speed])

    function nextLaserOrder(prevOrder: number = -1): number | undefined {
        const ordersSortedAsc = lasers.map(ls => ls.order).sort((a, b) => a - b)
        return ordersSortedAsc.find(o => o > prevOrder)
    }

    function afterLaserShot(laserOrder: number) {
        // calc destroyed blocks
        for (const laser of lasers) {
            if (laser.order === laserOrder) {
                const laserDir: Point = { x: Math.cos(laser.rotation), y: Math.sin(laser.rotation) }

                for (let block of blocks) {
                    if (block.state !== "destroyed" && rayIntersectsBlock(laser, laserDir, block)) {
                        block.state = "destroyed"
                    }
                }
            }
        }

        // calc new block positions
        let blockFallen: boolean

        do {
            blockFallen = false

            for (let block of blocks) {
                if (block.state !== "destroyed") {
                    // not grounded, check if any other block is directly below the block
                    let highestOtherBlockBelowY = WORLD_HEIGHT

                    for (let otherBlock of blocks) {
                        if (otherBlock !== block && otherBlock.x === block.x && otherBlock.y > block.y && otherBlock.state !== "destroyed") {
                            // same horizontal position and below
                            highestOtherBlockBelowY = Math.min(otherBlock.y, highestOtherBlockBelowY)
                        }
                    }

                    const newBlockY = highestOtherBlockBelowY - BLOCK_SIZE
                    if (newBlockY !== block.y) {
                        block.y = newBlockY
                        blockFallen = true
                    }
                }
            }
        }
        while (blockFallen)

        // start fall phase
        setBlocks([...blocks])
        setPhase(new BlockFallPhase(laserOrder))
    }

    function afterAllLasersShot() {
        // calculate score and detailed matching blocks
        let score = 0
        const matching: MatchingBlock[] = []

        // -> count blocks matching goal
        for (let gb of props.level.goal) {
            const foundMatchingBlock = blocks.find(b => blockMatchingGoalBlock(b, gb))
            if (foundMatchingBlock) {
                if (foundMatchingBlock.color === Colors[gb.color]) {
                    score++
                    matching.push({ state: "matching", block: foundMatchingBlock })
                }
                else {
                    matching.push({ state: "wrongColor", block: new Block(gb, props.level) })
                }
            }
            else {
                matching.push({ state: "missing", block: new Block(gb, props.level) })
            }
        }

        // -> decrease by blocks not matching goal
        for (let b of blocks) {
            if (b.state !== "destroyed" && !props.level.goal.find(gb => blockMatchingGoalBlock(b, gb))) {
                score--
                matching.push({ state: "overtowering", block: b })
            }
        }

        score = props.level.goal.length === 0 ? 0 : Math.max(0, score) / props.level.goal.length

        if (score === 1) {
            // completed level succefully
            props.onLevelFinished && props.onLevelFinished()
        }

        setPhase(new GoalMatchPhase(matching, score))
    }

    function blockMatchingGoalBlock(b: Block, gb: LevelBlock) {
        const blockInstance = new Block(gb, props.level)
        return b.x === blockInstance.x && b.y === blockInstance.y && b.state !== "destroyed"
    }

    function restartLevel() {
        loadLevel(props.level, true)
    }
    function inspectResult() {
        if (phase instanceof ResultPhase) {
            setPhase(phase.result)
            setSpeed(0)
        }
    }

    function toggleGoal() {
        setShowGoal(prev => !prev)
    }

    function playOrPause() {
        setSpeed(prev => prev === 0 ? 1 : 0)
    }
    function skipStart() {
        restartLevel()
        setPhase(new StartPhase())
    }
    function skipEnd() {
        setSpeed(1000) // increase speed such that it appears to be almost instant
    }

    useEffect(() => {
        // handle shortcuts
        const eventListener: (event: KeyboardEvent) => void = (event) => {
            if (event.key === 'g') {
                toggleGoal()
                event.preventDefault() // prevents browser features like quick search
            }
        }
        document.addEventListener("keydown", eventListener);
        return () => document.removeEventListener("keydown", eventListener);
    }, [])

    return <>
        <div className='mt-3 mb-2'>
            {phase instanceof SetupPhase && <>
                <button type="button" className="btn btn-primary" onClick={startLasers}><PlayIcon /> Start Lasers</button>&nbsp;
                <button type="button" className="btn btn-secondary" onClick={toggleGoal}><BullsEyeIcon /> Toggle <u>G</u>oal</button>
            </>}
            {!(phase instanceof SetupPhase) && <>
                <div className="btn-group me-3">
                    <button type="button" className="btn btn-light" onClick={skipStart} disabled={phase instanceof ResultPhase}><SkipStartIcon /></button>
                    <button type="button" className="btn btn-light" onClick={() => setSpeed(0.25)} disabled={phase instanceof ResultPhase}>slow</button>
                    <button type="button" className="btn btn-light" onClick={playOrPause} disabled={phase instanceof ResultPhase}>
                        {speed === 0 && <PlayIcon />}
                        {speed > 0 && <PauseIcon />}
                    </button>
                    <button type="button" className="btn btn-light" onClick={() => setSpeed(4.00)} disabled={phase instanceof ResultPhase}>fast</button>
                    <button type="button" className="btn btn-light" onClick={skipEnd} disabled={phase instanceof ResultPhase}><SkipEndIcon /></button>
                </div>
                Phase: {phase.displayName}
            </>}
        </div>

        <div id='world' className={styles.world + ' mb-3'} style={{
            width: WORLD_WIDTH + 'px',
            height: WORLD_HEIGHT + 'px',
            ['--speed' as any]: (speed === 0 ? 1000 : speed) // a value of exactly 0 would mean division by 0 in CSS
        }}>
            {blocks.map(block => <BlockComponent key={block.id} block={block} />)}
            {lasers.map(laser => <LaserComponent key={laser.id} laser={laser} phase={phase} blocks={blocks} />)}

            {phase instanceof GoalMatchPhase &&
                phase.matchingBlocks.map(mb =>
                    <div key={mb.block.id} className={styles.matchingBlock + ' ' + styles[mb.state]} style={{
                        width: BLOCK_SIZE + 'px',
                        height: BLOCK_SIZE + 'px',
                        left: mb.block.x,
                        top: mb.block.y
                    }}>
                        {(() => {
                            switch (mb.state) {
                                case "overtowering":
                                    return <RemoveIcon />
                                case "matching":
                                    return <CheckIcon />
                                case "missing":
                                    return <QuestionMarkIcon />
                                case "wrongColor":
                                    return <WrongColorIcon style={{ ['--goalBlockColor' as any]: mb.block.color }} />
                            }
                        })()}
                    </div>)}

            {phase instanceof ResultPhase &&
                <div className={styles.resultContainer}>
                    <div className={styles.result}>
                        <span>Your score is {Math.floor(phase.result.score * 100)}%. Level <strong>{phase.result.score === 1 ? 'complete' : 'incomplete'}</strong>.</span>

                        <div className='mt-3'>
                            {phase.result.score === 1 && <>
                                <button type="button" className="btn btn-primary" onClick={props.onLevelFinishedClick}>{props.levelFinishedButtonText}</button>&nbsp;
                                <button type="button" className="btn btn-secondary" onClick={restartLevel}>Restart Level</button>
                            </>}
                            {phase.result.score < 1 && <>
                                <button type="button" className="btn btn-primary" onClick={restartLevel}>Try again</button>&nbsp;
                                <button type="button" className="btn btn-secondary" onClick={inspectResult}>Inspect Result</button>
                            </>}
                        </div>
                    </div>
                </div>
            }

            {showGoal && <>
                <div className={styles.goalContainer}>
                    {goalBlocks.map(block => <BlockComponent key={block.id} block={block} />)}
                </div>
            </>}
        </div>
    </>
}