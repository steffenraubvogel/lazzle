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
import { ReactComponent as ShieldPlusIcon } from "bootstrap-icons/icons/shield-plus.svg"
import { ReactComponent as ShieldMinusIcon } from "bootstrap-icons/icons/shield-minus.svg"
import AutoScaler from "../components/AutoScaler";
import { Trans, useTranslation } from "react-i18next";
import { useShortcuts } from "./Util";

export default function Game(props: {
    level: Level,
    levelFinishedButtonText: string,
    onLevelFinished?: () => void, // full score reached
    onLevelFinishedClick: () => void // finish button clicked
}) {

    const { t } = useTranslation()

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
            }, 1200 * timeModifier * (phase.changed ? 1 : 0.25))]
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
        let changed = false

        // calc destroyed blocks
        for (const laser of lasers) {
            if (laser.order === laserOrder) {
                const laserDir: Point = { x: Math.cos(laser.rotation), y: Math.sin(laser.rotation) }

                for (let block of blocks) {
                    if (block.state !== "destroyed" && rayIntersectsBlock(laser, laserDir, block)) {
                        if (laser.color === undefined) {
                            // laser is destroying blocks
                            block.strength -= 1
                            if (block.strength === 0) {
                                block.state = "destroyed"
                                // remove links
                                block.links = { left: false, top: false }

                                const rightBlock = blocks.find(b => b.x === block.x + BLOCK_SIZE && b.y === block.y)
                                if (rightBlock) {
                                    rightBlock.links.left = false
                                }

                                const bottomBlock = blocks.find(b => b.x === block.x && b.y === block.y + BLOCK_SIZE)
                                if (bottomBlock) {
                                    bottomBlock.links.top = false
                                }
                            }
                        }
                        else {
                            // laser is re-coloring blocks
                            block.color = Colors[laser.color]
                        }

                        changed = true
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
                    const linkedBlocks = findTransitiveLinkedBlocks(block)
                    const fallDistance = determineFallDistance(linkedBlocks)

                    if (fallDistance > 0) {
                        linkedBlocks.forEach(b => b.y = b.y + fallDistance)
                        blockFallen = true
                        changed = true
                    }
                }
            }
        }
        while (blockFallen)

        // start fall phase
        setBlocks([...blocks])
        setPhase(new BlockFallPhase(laserOrder, changed))
    }

    function findTransitiveLinkedBlocks(block: Block) {
        const result: Block[] = [block]
        const visit: Block[] = [block]

        while (visit.length > 0) {
            const nextVisit = visit.pop()!
            // discover direct links in all directions
            for (let b of blocks) {
                if (b.state !== "destroyed" &&
                    ((b.x === nextVisit.x && b.y === nextVisit.y - BLOCK_SIZE && nextVisit.links.top) // top linked
                    || (b.x === nextVisit.x - BLOCK_SIZE && b.y === nextVisit.y && nextVisit.links.left) // left linked
                    || (b.x === nextVisit.x && b.y === nextVisit.y + BLOCK_SIZE && b.links.top) // bottom linked
                    || (b.x === nextVisit.x + BLOCK_SIZE && b.y === nextVisit.y && b.links.left)) // right linked
                ) {
                    if (!result.includes(b)) {
                        result.push(b)
                        visit.push(b)
                    }
                }
            }
        }

        return result
    }

    function determineFallDistance(linkedBlocks: Block[]) {
        let fallDistance = WORLD_HEIGHT

        for (let linkedBlock of linkedBlocks) {
            let highestOtherBlockBelowY = WORLD_HEIGHT

            for (let otherBlock of blocks) {
                if (!linkedBlocks.includes(otherBlock) && otherBlock.x === linkedBlock.x && otherBlock.y > linkedBlock.y && otherBlock.state !== "destroyed") {
                    // same horizontal position and below
                    highestOtherBlockBelowY = Math.min(otherBlock.y, highestOtherBlockBelowY)
                }
            }

            const thisBlockfallDistance = highestOtherBlockBelowY - (linkedBlock.y + BLOCK_SIZE)
            fallDistance = Math.min(thisBlockfallDistance, fallDistance)
        }

        return fallDistance // the maximum distance the linked blocks as one unit can fall without being blocked by other (not-linked) blocks
    }

    function afterAllLasersShot() {
        // calculate score and detailed matching blocks
        let score = 0
        const matching: MatchingBlock[] = []

        // -> count blocks matching goal
        for (let gb of props.level.goal) {
            const foundMatchingBlock = blocks.find(b => blockMatchingGoalBlock(b, gb))
            const blocksInfo = {
                goal: new Block(gb, props.level),
                block: foundMatchingBlock,
                ref: foundMatchingBlock || new Block(gb, props.level)
            }

            if (foundMatchingBlock) {
                if (foundMatchingBlock.color === Colors[gb.color]) {
                    if (foundMatchingBlock.strength === (gb.strength === undefined ? 1 : gb.strength)) {
                        score++
                        matching.push({ state: "matching", ...blocksInfo })
                    }
                    else {
                        matching.push({ state: "wrongStrength", ...blocksInfo })
                    }
                }
                else {
                    matching.push({ state: "wrongColor", ...blocksInfo })
                }
            }
            else {
                matching.push({ state: "missing", ...blocksInfo })
            }
        }

        // -> decrease by blocks not matching goal
        for (let b of blocks) {
            if (b.state !== "destroyed" && !props.level.goal.find(gb => blockMatchingGoalBlock(b, gb))) {
                score--
                matching.push({ state: "overtowering", block: b, ref: b })
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

    useShortcuts({
        'g': () => toggleGoal(),
        's': () => startLasers()
    })

    return <>
        <div className='mt-3 mb-2'>
            {phase instanceof SetupPhase && <>
                <button type="button" className="btn btn-primary" onClick={startLasers} title={t('game.play.start_lasers_tooltip')}>
                    <PlayIcon /> <Trans i18nKey='game.play.start_lasers'><u></u></Trans>
                </button>&nbsp;
                <button type="button" className="btn btn-secondary" onClick={toggleGoal} title={t('game.play.toggle_goal_tooltip')}>
                    <BullsEyeIcon /> <Trans i18nKey='game.play.toggle_goal'><u></u></Trans>
                </button>
            </>}
            {!(phase instanceof SetupPhase) && <>
                <div className="btn-group me-3">
                    <button type="button" className="btn btn-light" onClick={skipStart} disabled={phase instanceof ResultPhase}><SkipStartIcon /></button>
                    <button type="button" className="btn btn-light" onClick={() => setSpeed(0.25)} disabled={phase instanceof ResultPhase}>{t('game.play.sim.slow')}</button>
                    <button type="button" className="btn btn-light" onClick={playOrPause} disabled={phase instanceof ResultPhase}>
                        {speed === 0 && <PlayIcon />}
                        {speed > 0 && <PauseIcon />}
                    </button>
                    <button type="button" className="btn btn-light" onClick={() => setSpeed(4.00)} disabled={phase instanceof ResultPhase}>{t('game.play.sim.fast')}</button>
                    <button type="button" className="btn btn-light" onClick={skipEnd} disabled={phase instanceof ResultPhase}><SkipEndIcon /></button>
                </div>
                {t('game.play.sim.phase_current')}{phase.getDisplayName(t)}{speed === 0 && t('game.play.sim.phase_stopped')}
            </>}
        </div>

        <div className={styles.worldContainer + ' mb-3'}>
            <AutoScaler id='world' defaultWidth={WORLD_WIDTH} defaultHeight={WORLD_HEIGHT} maxScaledHeight='100vh' className={styles.world} style={{
                ['--speed' as any]: (speed === 0 ? 1000 : speed) // a value of exactly 0 would mean division by 0 in CSS
            }}>
                {blocks.map(block => <BlockComponent key={block.id} block={block} phase={phase} />)}
                {lasers.map(laser => <LaserComponent key={laser.id} laser={laser} phase={phase} blocks={blocks} />)}

                {phase instanceof GoalMatchPhase &&
                    phase.matchingBlocks.map(mb =>
                        <div key={mb.ref.id} className={styles.matchingBlock + ' ' + styles[mb.state]} style={{
                            width: BLOCK_SIZE + 'px',
                            height: BLOCK_SIZE + 'px',
                            left: mb.ref.x,
                            top: mb.ref.y
                        }}>
                            {(() => {
                                switch (mb.state) {
                                    case "overtowering":
                                        return <RemoveIcon title={t('game.play.sim.match.' + mb.state)} />
                                    case "matching":
                                        return <CheckIcon title={t('game.play.sim.match.' + mb.state)} />
                                    case "missing":
                                        return <QuestionMarkIcon title={t('game.play.sim.match.' + mb.state)} />
                                    case "wrongColor":
                                        return <WrongColorIcon
                                            title={t('game.play.sim.match.' + mb.state, {
                                                goal: t('game.play.block_color.' + Colors.indexOf(mb.goal!.color)),
                                                actual: t('game.play.block_color.' + Colors.indexOf(mb.block!.color))
                                            })}
                                            style={{ ['--goalBlockColor' as any]: mb.goal!.color }} />
                                    case "wrongStrength":
                                        const title = t('game.play.sim.match.' + mb.state, {
                                            goal: t('game.play.block_strength.' + mb.goal!.strength),
                                            actual: t('game.play.block_strength.' + mb.block!.strength)
                                        })

                                        if (mb.block!.strength > mb.goal!.strength) {
                                            return <ShieldMinusIcon title={title} />
                                        }
                                        return <ShieldPlusIcon title={title} />
                                }
                            })()}
                        </div>)}

                {showGoal &&
                    <div className={styles.goalContainer}>
                        {goalBlocks.map(block => <BlockComponent key={block.id} block={block} phase={phase} />)}
                    </div>}
            </AutoScaler>

            {phase instanceof ResultPhase &&
                <div className={styles.resultContainer}>
                    <div className={styles.result}>
                        <span>
                            <Trans i18nKey={phase.result.score === 1 ? 'game.play.sim.level_complete' : 'game.play.sim.level_incomplete'}
                                tOptions={{ score: Math.floor(phase.result.score * 100) }}><strong></strong></Trans>
                        </span>

                        <div className='mt-3'>
                            {phase.result.score === 1 && <>
                                <button type="button" className="btn btn-primary" onClick={props.onLevelFinishedClick}>{props.levelFinishedButtonText}</button>&nbsp;
                                <button type="button" className="btn btn-secondary" onClick={restartLevel}>{t('game.play.action_restart_level')}</button>
                            </>}
                            {phase.result.score < 1 && <>
                                <button type="button" className="btn btn-primary" onClick={restartLevel}>{t('game.play.action_try_again')}</button>&nbsp;
                                <button type="button" className="btn btn-secondary" onClick={inspectResult}>{t('game.play.action_inspect_result')}</button>
                            </>}
                        </div>
                    </div>
                </div>
            }
        </div>
    </>
}