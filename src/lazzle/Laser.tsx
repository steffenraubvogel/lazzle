import { useState } from "react";
import styles from "./Lazzle.module.scss";
import { LaserShotPhase, Phase, SetupPhase } from "./Phase";
import { LevelLaser } from "./Levels";
import { nextId } from "./Util";
import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { Block } from "./Block";
import { rayIntersectsBlock } from "./Geometry";

export class Laser {

    readonly id: string
    private _x: number = 0 // position on canvas
    private _y: number = 0
    private _angle: number // in radians
    private _distance: number // from bottom center of blocks in pixels
    private _rotation: number // in radians
    readonly order: number // a number indicating when to shoot this laser in shoot phase

    constructor(config: LevelLaser) {
        this._angle = config.angle * Math.PI / 180
        this._distance = config.distance
        this._rotation = config.rotation * Math.PI / 180 + Math.PI
        this.order = config.order

        this.id = nextId()
        this.updatePosition()
    }

    private updatePosition() {
        this._x = WORLD_WIDTH / 2 + this._distance * Math.cos(this._angle)
        this._y = WORLD_HEIGHT - this._distance * Math.sin(this._angle)
    }

    public drag(mouseX: number, mouseY: number) {
        const relativeX = mouseX - WORLD_WIDTH / 2
        const relativeY = Math.max(0, WORLD_HEIGHT - mouseY)
        const newAngle = Math.atan2(relativeY, relativeX)
        const oldAngle = this._angle

        this._angle = Math.max(0, Math.min(newAngle, Math.PI))
        this._rotation = this._rotation - (newAngle - oldAngle)
        this.updatePosition()
    }

    public rotate(mouseX: number, mouseY: number) {
        const relativeX = this._x - mouseX
        const relativeY = this._y - mouseY
        this._rotation = Math.atan2(relativeY, relativeX) - Math.PI
    }

    get x() {
        return this._x
    }

    get y() {
        return this._y
    }

    get rotation() {
        return this._rotation
    }

    get distance() {
        return this._distance
    }

}

export default function LaserComponent(props: { laser: Laser, blocks: Block[], phase: Phase }) {

    const [isMoving, setMoving] = useState(false)
    const [isRotating, setRotating] = useState(false)
    const [, setForceRerender] = useState(0)

    function laserMoveHandleMouseDown() {
        setMoving(true)
        drag(props.laser.drag.bind(props.laser))
    }

    function laserRotationHandleMouseDown() {
        setRotating(true)
        drag(props.laser.rotate.bind(props.laser))
    }

    function drag(cb: (x: number, y: number) => void) {
        document.onmousemove = event => {
            const worldBounds = document.querySelector("#world")!.getBoundingClientRect()
            cb(event.clientX - worldBounds.left, event.clientY - worldBounds.top)
            setForceRerender(prev => prev + 1)
        };

        document.onmouseup = () => {
            // unregister mouse event handlers
            document.onmousemove = null
            document.onmouseup = null

            setMoving(false)
            setRotating(false)
        };
    }

    function getCssClassNames() {
        const classes = [styles.laser]
        if (isMoving) {
            classes.push(styles.laserMoving)
        }
        if (isRotating) {
            classes.push(styles.laserRotating)
        }
        if (!(props.phase instanceof SetupPhase)) {
            classes.push(styles.laserLocked)
        }
        return classes.join(' ')
    }

    return (<>
        <div
            className={styles.orbit}
            style={{
                width: props.laser.distance * 2,
                height: props.laser.distance * 2
            }}>
        </div>
        <div
            className={getCssClassNames()}
            style={{
                transform: "translateY(-50%) translate(" + props.laser.x + "px, " + props.laser.y + "px) rotate(" + props.laser.rotation + "rad)",
                transformOrigin: 'center left'
            }}>

            <div className={styles.laserHelpLine + ' ' + (props.phase instanceof LaserShotPhase && props.phase.order === props.laser.order ? styles.shoot : '')}>
            </div>

            <div className={styles.laserDevice}>
            </div>

            <div className={styles.laserOrder}>
                <div style={{ transform: "rotate(" + (-props.laser.rotation) + "rad)" }}>{props.laser.order}</div>
            </div>

            <div className={styles.laserMoveHandle} onMouseDown={laserMoveHandleMouseDown}>
            </div>

            <div className={styles.laserRotationHandle} onMouseDown={laserRotationHandleMouseDown}>
            </div>
        </div>
        <div className={styles.laserHitBlocks}>
            {props.blocks.filter(b => b.state !== "destroyed")
                .filter(b => rayIntersectsBlock(props.laser, { x: Math.cos(props.laser.rotation), y: Math.sin(props.laser.rotation) }, b))
                .map(b => <div key={b.id} className={styles.laserHitBlock} style={{ left: b.x, top: b.y, width: BLOCK_SIZE + 'px', height: BLOCK_SIZE + 'px' }}></div>)}
        </div>
    </>
    )
}