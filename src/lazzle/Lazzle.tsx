import { useEffect, useState } from "react";
import styles from "./Lazzle.module.scss";
import LaserComponent, { Laser } from "./Laser";
import BlockComponent, { Block } from "./Block";
import { Colors, Level, AllLevels, LevelBlock } from "./Levels";
import { BlockFallPhase, LaserShotPhase, Phase, ResultPhase, SetupPhase, StartPhase } from "./Phase";
import { Point, rayIntersectsBlock } from "./Geometry";
import { BLOCK_SIZE, LOCAL_STORAGE_KEY_GAME_PROGRESS, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { ReactComponent as PlayIcon } from "bootstrap-icons/icons/play.svg"
import { ReactComponent as PauseIcon } from "bootstrap-icons/icons/pause.svg"
import { ReactComponent as SkipStartIcon } from "bootstrap-icons/icons/skip-start.svg"
import { ReactComponent as SkipEndIcon } from "bootstrap-icons/icons/skip-end.svg"

export default function LazzleGame() {

    const [level, setLevel] = useState<Level>(AllLevels[0])
    const [lasers, setLasers] = useState<Laser[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const [showGoal, setShowGoal] = useState<boolean>(false)
    const [goalBlocks, setGoalBlocks] = useState<Block[]>([])

    const [phase, setPhase] = useState<Phase>(new SetupPhase())
    const [speed, setSpeed] = useState<number>(1)

    useEffect(() => {
        // check local storage for previous game progress
        const gameProgress = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_PROGRESS)
        let levelToLoad = 0
        if (gameProgress) {
            levelToLoad = Math.min(AllLevels.length, Math.max(0, Math.round(Number(gameProgress))))
        }

        loadLevel(AllLevels[1])
    }, [])

    function loadLevel(level: Level, keepLasers: boolean = false) {
        if (!keepLasers) {
            setLasers(level.lasers.map(l => new Laser(l)))
        }

        setBlocks(level.blocks.map(b => new Block(b, level)))
        setGoalBlocks(level.goal.map(b => new Block(b, level)))

        setPhase(new SetupPhase())

        setLevel(level)
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
        
        let timer: NodeJS.Timeout | undefined
        const timeModifier = 1 / speed

        if (phase instanceof StartPhase) {
            timer = setTimeout(() => {
                setPhase(new LaserShotPhase(nextLaserOrder()!))
            }, 1000 * timeModifier)
        }
        if (phase instanceof LaserShotPhase) {
            timer = setTimeout(() => {
                afterLaserShot(phase.order)
            }, 800 * timeModifier)
        }
        if (phase instanceof BlockFallPhase) {
            timer = setTimeout(() => {
                const next = nextLaserOrder(phase.order)

                if (!next) {
                    afterAllLasersShot()
                }
                else {
                    setPhase(new LaserShotPhase(next))
                }
            }, 1200 * timeModifier)
        }

        return timer !== undefined ? () => clearTimeout(timer!) : undefined
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
        setPhase(new BlockFallPhase(laserOrder))
    }

    function afterAllLasersShot() {
        // calculate score
        let score = 0

        // -> count blocks matching goal
        for (let gb of level.goal) {
            if (blocks.find(b => blockMatchingGoalBlock(b, gb))) {
                score++
            }
        }

        // -> decrease by blocks not matching goal
        for (let b of blocks) {
            if (b.state !== "destroyed" && !level.goal.find(gb => blockMatchingGoalBlock(b, gb))) {
                score--
            }
        }

        score = Math.max(0, score)
        setPhase(new ResultPhase(score / level.goal.length))
    }

    function blockMatchingGoalBlock(b: Block, gb: LevelBlock) {
        const blockInstance = new Block(gb, level)
        return b.x === blockInstance.x && b.y === blockInstance.y && b.color === Colors[gb.color] && b.state !== "destroyed"
    }

    function startNextLevel() {
        const nextLevel = (AllLevels.indexOf(level) + 1) % AllLevels.length
        localStorage.setItem(LOCAL_STORAGE_KEY_GAME_PROGRESS, nextLevel.toString())
        loadLevel(AllLevels[nextLevel])
    }

    function restartLevel() {
        loadLevel(level, true)
    }

    function toggleGoal() {
        setShowGoal(prev => !prev)
    }

    function playOrPause() {
        setSpeed(0)
    }
    function skipStart() {
        restartLevel()
        setPhase(new StartPhase())
    }
    function skipEnd() {
        setSpeed(1000) // increase speed such that it appears to be almost instant
    }

    return <div className={"container-md " + styles.lazzle}>
        <h1>Lazzle</h1>

        <h2>Level {AllLevels.indexOf(level) + 1} - {level.name}</h2>
        <p>
            {phase instanceof SetupPhase && <>
                <button type="button" className="btn btn-primary" onClick={startLasers}><PlayIcon /> Start Lasers</button>&nbsp;
                <button type="button" className="btn btn-secondary" onClick={toggleGoal}>Toggle Goal</button>
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
        </p>

        <div id='world' className={styles.world + ' mb-3'} style={{ width: WORLD_WIDTH + 'px', height: WORLD_HEIGHT + 'px', ['--speed' as any]: speed }}>
            {blocks.map(block => <BlockComponent key={block.id} block={block} />)}
            {lasers.map(laser => <LaserComponent key={laser.id} laser={laser} phase={phase} blocks={blocks} />)}

            {phase instanceof ResultPhase &&
                <div className={styles.resultContainer}>
                    <div className={styles.result}>
                        <span>Your score is {Math.floor(phase.score * 100)}%. Level <strong>{phase.score === 1 ? 'complete' : 'incomplete'}</strong>.</span>

                        <div className='mt-3'>
                            {phase.score === 1 && <>
                                <button type="button" className="btn btn-primary" onClick={startNextLevel}>Next Level</button>&nbsp;
                                <button type="button" className="btn btn-secondary" onClick={restartLevel}>Restart Level</button>
                            </>}
                            {phase.score < 1 &&
                                <button type="button" className="btn btn-primary" onClick={restartLevel}>Try again</button>}
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

        <h2>How to</h2>
        <p>
            The game consists of colored blocks and lasers.
            <ul>
                <li>Use <em>Toggle Goal</em> to see the target blocks arrangement that you need to accomplish by shooting with the lasers.</li>
                <li>Each laser can be dragged around on its semi-circle and rotated in any direction. Hover a laser to see its movement and rotation handles.
                    Drag a handle to move or rotate the laser.</li>
                <li>Once you are ready click <em>Start Lasers</em>. Lasers will be shot in sequence as indicated by their numbers. The lasers will
                    destroy or re-color the blocks they are aiming at. Blocks up in the air will then fall down. After all lasers shot, the resulting block arrangement
                    will be compared with the goal.</li>
            </ul>
            You will win the level if all resulting blocks match with the target blocks.
        </p>

        <h2>Hints and Help</h2>
        <p>
            The difficulty will increase with each level. At the moment there are {AllLevels.length} levels available.
        </p>
    </div>

}