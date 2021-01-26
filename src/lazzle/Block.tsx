import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { Colors, LevelBlock, PersistentLevel } from "./Levels";
import styles from "./Lazzle.module.scss";
import { nextId } from "./Util";
import { ReactComponent as BlockLinkIcon } from "bootstrap-icons/icons/pause.svg"
import { LevelEditorPhase, Phase } from "./Phase";

export class Block {

    readonly id: string
    readonly original: LevelBlock
    public color: string // CSS color value
    public x: number // top left coordinates within world
    public y: number
    public state: "destroyed" | "active"
    public strength: number // number of shots to resist
    public links: { left: boolean, top: boolean } // links to adjacent blocks

    constructor(block: LevelBlock, level: PersistentLevel) {
        this.id = nextId()
        this.original = block
        this.x = WORLD_WIDTH / 2 - level.gridX / 2 * BLOCK_SIZE + block.x * BLOCK_SIZE
        this.y = WORLD_HEIGHT - level.gridY * BLOCK_SIZE + block.y * BLOCK_SIZE
        this.color = Colors[block.color]
        this.state = "active"
        this.strength = block.strength === undefined ? 1 : block.strength
        this.links = { ...block.link }
    }

}

export default function BlockComponent(props: { block: Block, phase: Phase }) {

    return (
        <div
            className={styles.block + ' ' + styles[props.block.state]}
            style={{
                width: BLOCK_SIZE + 'px',
                height: BLOCK_SIZE + 'px',
                backgroundColor: props.block.color,
                left: props.block.x,
                top: props.block.y
            }}
        >
            {(props.block.links.top || (props.phase instanceof LevelEditorPhase && props.phase.showLinkToNeighbor(0, -1, props.block))) &&
                <div className={styles.blockLink + ' ' + styles.blockLinkTop + ' ' + (props.block.links.top ? styles.blockLinkActive : styles.blockLinkInactive)}
                    onClick={() => props.phase instanceof LevelEditorPhase && props.phase.onTopLinkClick(props.block)}>
                    <BlockLinkIcon />
                </div>}

            {(props.block.links.left || (props.phase instanceof LevelEditorPhase && props.phase.showLinkToNeighbor(-1, 0, props.block))) &&
                <div className={styles.blockLink + ' ' + styles.blockLinkLeft + ' ' + (props.block.links.left ? styles.blockLinkActive : styles.blockLinkInactive)}
                    onClick={() => props.phase instanceof LevelEditorPhase && props.phase.onLeftLinkClick(props.block)}>
                    <BlockLinkIcon />
                </div>}

            {props.block.strength === 2 && <div className={styles.blockStrengthened + ' ' + styles.blockStrengthened1} />}
            {props.block.strength === 3 && <div className={styles.blockStrengthened + ' ' + styles.blockStrengthened2} />}
        </div>
    )
}