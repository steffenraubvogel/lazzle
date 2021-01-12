import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { Colors, Level, LevelBlock } from "./Levels";
import styles from "./Lazzle.module.scss";
import { nextId } from "./Util";

export class Block {

    readonly id: string
    public color: string // CSS color value
    public x: number // top left coordinates within world
    public y: number
    public state: "destroyed" | "active"
    public strength: number // number of shots to resist

    constructor(block: LevelBlock, level: Level) {
        this.id = nextId()
        this.x = WORLD_WIDTH / 2 - level.gridX / 2 * BLOCK_SIZE + block.x * BLOCK_SIZE
        this.y = WORLD_HEIGHT - level.gridY * BLOCK_SIZE + block.y * BLOCK_SIZE
        this.color = Colors[block.color]
        this.state = "active"
        this.strength = block.strength === undefined ? 1 : block.strength
    }

}

export default function BlockComponent(props: { block: Block }) {

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
            {props.block.strength === 2 && <div className={styles.blockStrengthened + ' ' + styles.blockStrengthened1} />}
            {props.block.strength === 3 && <div className={styles.blockStrengthened + ' ' + styles.blockStrengthened2} />}
        </div>
    )
}