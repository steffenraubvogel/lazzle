import { useEffect, useRef, useState } from "react";
import styles from "./Laser.module.scss";
import { LaserShotPhase, Phase, SetupPhase } from "./Phase";
import { Colors, LevelLaser } from "./Levels";
import { nextId } from "./Util";
import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { Block } from "./Block";
import { Point, rayIntersectsBlock } from "./Geometry";
import { ReactComponent as LaserSvg } from "./images/laser.svg"
import { ReactComponent as GripIcon } from "bootstrap-icons/icons/grip-vertical.svg"
import { ReactComponent as ArrowRightIcon } from "bootstrap-icons/icons/arrow-right.svg"
import { ReactComponent as ReplyIcon } from "bootstrap-icons/icons/reply.svg"

export class Laser {

    readonly id: string
    private _x: number = 0 // position on canvas
    private _y: number = 0
    private _angle: number // in radians
    private _distance: number // from bottom center of blocks in pixels
    private _rotation: number // in radians
    readonly order: number // a number indicating when to shoot this laser in shoot phase
    readonly movable: boolean // can user move the laser around?
    readonly rotatable: boolean // can user rotate the laser?
    readonly color?: number

    private _leftMoveArrowPos: Point = { x: 0, y: 0 } // moving indicator position left of laser
    private _leftMoveArrowRotation: number = 0
    private _rightMoveArrowPos: Point = { x: 0, y: 0 } // moving indicator position right of laser
    private _rightMoveArrowRotation: number = 0

    private _leftRotationArrowPos: Point = { x: 0, y: 0 }
    private _leftRotationArrowRotation: number = 0
    private _rightRotationArrowPos: Point = { x: 0, y: 0 }
    private _rightRotationArrowRotation: number = 0

    constructor(config: LevelLaser) {
        this._angle = config.angle * Math.PI / 180
        this._distance = config.distance
        this._rotation = config.rotation * Math.PI / 180 + Math.PI
        this.order = config.order
        this.movable = config.movable
        this.rotatable = config.rotatable
        this.color = config.color

        this.id = nextId()
        this.updatePosition()
    }

    private updatePosition() {
        this._x = WORLD_WIDTH / 2 + this._distance * Math.cos(this._angle)
        this._y = WORLD_HEIGHT - this._distance * Math.sin(this._angle)

        const MOVE_ARROW_ANGLE_GAP = 8 * Math.PI / 180 // in rad

        this._leftMoveArrowPos = {
            x: WORLD_WIDTH / 2 + Math.cos(this._angle + MOVE_ARROW_ANGLE_GAP) * this._distance,
            y: WORLD_HEIGHT - Math.sin(this._angle + MOVE_ARROW_ANGLE_GAP) * this._distance
        }
        this._leftMoveArrowRotation = -this._angle - MOVE_ARROW_ANGLE_GAP - Math.PI / 2

        this._rightMoveArrowPos = {
            x: WORLD_WIDTH / 2 + Math.cos(this._angle - MOVE_ARROW_ANGLE_GAP) * this._distance,
            y: WORLD_HEIGHT - Math.sin(this._angle - MOVE_ARROW_ANGLE_GAP) * this._distance
        }
        this._rightMoveArrowRotation = -this._angle + MOVE_ARROW_ANGLE_GAP + Math.PI / 2

        const ROTATION_ARROW_DISTANCE_GAP = 80 // in px
        const ROTATION_ARROW_ANGLE_GAP = 25 * Math.PI / 180 // in rad
        const ROTATION_ARROW_ROTATION_CORRECTION = 45 * Math.PI / 180 // in rad

        this._leftRotationArrowPos = {
            x: this._x + Math.cos(this._rotation - ROTATION_ARROW_ANGLE_GAP) * ROTATION_ARROW_DISTANCE_GAP,
            y: this._y + Math.sin(this._rotation - ROTATION_ARROW_ANGLE_GAP) * ROTATION_ARROW_DISTANCE_GAP,
        }
        this._leftRotationArrowRotation = this._rotation + Math.PI / 2 - ROTATION_ARROW_ROTATION_CORRECTION

        this._rightRotationArrowPos = {
            x: this._x + Math.cos(this._rotation + ROTATION_ARROW_ANGLE_GAP) * ROTATION_ARROW_DISTANCE_GAP,
            y: this._y + Math.sin(this._rotation + ROTATION_ARROW_ANGLE_GAP) * ROTATION_ARROW_DISTANCE_GAP,
        }
        this._rightRotationArrowRotation = this._rotation + Math.PI / 2 + ROTATION_ARROW_ROTATION_CORRECTION
    }

    public drag(mouseX: number, mouseY: number) {
        const relativeX = mouseX - WORLD_WIDTH / 2
        const relativeY = Math.max(0, WORLD_HEIGHT - mouseY)
        const newAngle = Math.atan2(relativeY, relativeX)
        const oldAngle = this._angle

        this._angle = Math.max(0, Math.min(newAngle, Math.PI))
        if (this.rotatable) {
            this._rotation = this._rotation - (newAngle - oldAngle)
        }
        this.updatePosition()
    }

    public rotate(mouseX: number, mouseY: number) {
        const relativeX = this._x - mouseX
        const relativeY = this._y - mouseY
        this._rotation = Math.atan2(relativeY, relativeX) - Math.PI
        this.updatePosition()
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

    get angle() {
        return this._angle
    }

    get distance() {
        return this._distance
    }

    get leftMoveArrowPos() {
        return this._leftMoveArrowPos
    }

    get leftMoveArrowRotation() {
        return this._leftMoveArrowRotation
    }

    get rightMoveArrowPos() {
        return this._rightMoveArrowPos
    }

    get rightMoveArrowRotation() {
        return this._rightMoveArrowRotation
    }

    get leftRotationArrowPos() {
        return this._leftRotationArrowPos
    }

    get leftRotationArrowRotation() {
        return this._leftRotationArrowRotation
    }

    get rightRotationArrowPos() {
        return this._rightRotationArrowPos
    }

    get rightRotationArrowRotation() {
        return this._rightRotationArrowRotation
    }
}

export default function LaserComponent(props: { laser: Laser, blocks: Block[], phase: Phase }) {

    const [isMoving, setMoving] = useState(false)
    const [isRotating, setRotating] = useState(false)
    const [, setForceRerender] = useState(0)

    const gripMove = useRef<HTMLDivElement>(null)
    const gripRotate = useRef<HTMLDivElement>(null)

    function laserMoveHandleMouseDown() {
        if (props.laser.movable) {
            setMoving(true)
            dragStart(props.laser.drag.bind(props.laser))
        }
    }

    function laserRotationHandleMouseDown() {
        if (props.laser.rotatable) {
            setRotating(true)
            dragStart(props.laser.rotate.bind(props.laser))
        }
    }

    function dragStart(cb: (x: number, y: number) => void) {
        document.onmousemove = event => {
            drag(cb, event.clientX, event.clientY)
        };

        document.onmouseup = () => {
            // unregister mouse event handlers
            document.onmousemove = null
            document.onmouseup = null

            setMoving(false)
            setRotating(false)
        };
    }
    function drag(cb: (x: number, y: number) => void, clientX: number, clientY: number) {
        const world = document.querySelector("#world")!
        const scaledWorldBounds = world.getBoundingClientRect()
        const unscaledWorldBounds = { width: world.clientWidth, height: world.clientHeight }

        // NOTE: the world is usually scaled (css transform) to adapt to available space; we need to scale
        // the mouse position appropriately
        const relativeX = (clientX - scaledWorldBounds.left) / scaledWorldBounds.width
        const relativeY = (clientY - scaledWorldBounds.top) / scaledWorldBounds.height

        cb(relativeX * unscaledWorldBounds.width, relativeY * unscaledWorldBounds.height)
        setForceRerender(prev => prev + 1)
    }

    useEffect(() => {
        const gm = gripMove.current!
        gm.addEventListener("touchstart", laserMoveHandleTouchStart, { passive: false })
        gm.addEventListener("touchmove", laserMoveHandleTouchMove, { passive: false })
        gm.addEventListener("touchend", laserMoveHandleTouchEnd, { passive: false })
        
        const gr = gripRotate.current!
        gr.addEventListener("touchstart", laserRotationHandleTouchStart, { passive: false })
        gr.addEventListener("touchmove", laserRotationHandleTouchMove, { passive: false })
        gr.addEventListener("touchend", laserRotationHandleTouchEnd, { passive: false })

        return () => {
            gm.removeEventListener("touchstart", laserMoveHandleTouchStart)
            gm.removeEventListener("touchmove", laserMoveHandleTouchMove)
            gm.removeEventListener("touchend", laserMoveHandleTouchEnd)
            
            gr.removeEventListener("touchstart", laserRotationHandleTouchStart)
            gr.removeEventListener("touchmove", laserRotationHandleTouchMove)
            gr.removeEventListener("touchend", laserRotationHandleTouchEnd)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function laserMoveHandleTouchStart(event: TouchEvent) {
        event.preventDefault()
        if (props.laser.movable) {
            setMoving(true)
        }
    }
    function laserMoveHandleTouchMove(event: TouchEvent) {
        event.preventDefault()
        const touch = event.changedTouches[0];
        drag(props.laser.drag.bind(props.laser), touch.clientX, touch.clientY)
    }
    function laserMoveHandleTouchEnd(event: TouchEvent) {
        setMoving(false)
    }

    function laserRotationHandleTouchStart(event: TouchEvent) {
        event.preventDefault()
        if (props.laser.rotatable) {
            setRotating(true)
        }
    }
    function laserRotationHandleTouchMove(event: TouchEvent) {
        event.preventDefault()
        const touch = event.changedTouches[0];
        drag(props.laser.rotate.bind(props.laser), touch.clientX, touch.clientY)
    }
    function laserRotationHandleTouchEnd(event: TouchEvent) {
        setRotating(false)
    }

    function getAdditionalCssClassNames() {
        const classes = []
        isMoving && classes.push(styles.laserMoving)
        isRotating && classes.push(styles.laserRotating)
        !props.laser.movable && classes.push(styles.laserNotMovable)
        !props.laser.rotatable && classes.push(styles.laserNotRotatable)

        if (!(props.phase instanceof SetupPhase)) {
            classes.push(styles.laserLocked)
        }

        return ' ' + classes.join(' ')
    }

    return (<>
        <div
            className={styles.laserOrbit + getAdditionalCssClassNames()}
            style={{
                width: props.laser.distance * 2,
                height: props.laser.distance * 2
            }}
        >
        </div>
        <div
            className={styles.laser + getAdditionalCssClassNames()}
            style={{
                transform: "translateY(-50%) translate(" + props.laser.x + "px, " + props.laser.y + "px) rotate(" + props.laser.rotation + "rad)",
                transformOrigin: 'center left',
                ['--laser-color' as any]: props.laser.color === undefined ? 'black' : Colors[props.laser.color]
            }}>

            <div className={styles.laserHelpLine + ' ' + (props.phase instanceof LaserShotPhase && props.phase.order === props.laser.order ? styles.shoot : '')}>
            </div>

            <div className={styles.laserDevice}>
                <LaserSvg />
            </div>

            <div className={styles.laserOrder}>
                <div style={{ transform: "rotate(" + (-props.laser.rotation) + "rad)" }}>{props.laser.order}</div>
            </div>

            <div ref={gripMove} className={styles.laserMoveHandle} onMouseDown={laserMoveHandleMouseDown}>
                <GripIcon />
            </div>

            <div ref={gripRotate} className={styles.laserRotationHandle} onMouseDown={laserRotationHandleMouseDown}>
            </div>
        </div>
        <div className={styles.laserHoveredElements + getAdditionalCssClassNames()}>
            <div className={styles.laserMoveHandleArrow} style={{
                left: props.laser.leftMoveArrowPos.x,
                top: props.laser.leftMoveArrowPos.y,
                transform: 'translate(-50%, -50%) rotate(' + props.laser.leftMoveArrowRotation + 'rad)'
            }}>
                <ArrowRightIcon />
            </div>
            <div className={styles.laserMoveHandleArrow} style={{
                left: props.laser.rightMoveArrowPos.x,
                top: props.laser.rightMoveArrowPos.y,
                transform: 'translate(-50%, -50%) rotate(' + props.laser.rightMoveArrowRotation + 'rad)'
            }}>
                <ArrowRightIcon />
            </div>
            <div className={styles.laserRotationHandleArrow} style={{
                left: props.laser.leftRotationArrowPos.x,
                top: props.laser.leftRotationArrowPos.y,
                transform: 'translate(-50%, -50%) rotate(' + props.laser.leftRotationArrowRotation + 'rad)'
            }}>
                <ReplyIcon />
            </div>
            <div className={styles.laserRotationHandleArrow} style={{
                left: props.laser.rightRotationArrowPos.x,
                top: props.laser.rightRotationArrowPos.y,
                transform: 'translate(-50%, -50%) rotate(' + props.laser.rightRotationArrowRotation + 'rad) scaleX(-1)'
            }}>
                <ReplyIcon />
            </div>
            <div className={styles.laserHitBlocks}>
                {props.blocks.filter(b => b.state !== "destroyed")
                    .filter(b => rayIntersectsBlock(props.laser, { x: Math.cos(props.laser.rotation), y: Math.sin(props.laser.rotation) }, b))
                    .map(b => <div key={b.id} className={styles.laserHitBlock} style={{ left: b.x, top: b.y, width: BLOCK_SIZE + 'px', height: BLOCK_SIZE + 'px' }}></div>)}
            </div>
        </div>
    </>
    )
}