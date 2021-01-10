import styles from "./Lazzle.module.scss";
import { useEffect, useRef, useState } from "react";
import BlockComponent, { Block } from "./Block";
import { WORLD_ASPECT, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import LaserComponent, { Laser } from "./Laser";
import { Level } from "./Levels";
import { LevelPreviewPhase } from "./Phase";

export default function LevelPreview(props: { level: Level }) {

    const [lasers, setLasers] = useState<Laser[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const phase = new LevelPreviewPhase()

    const wrapperRef = useRef<HTMLDivElement>(null)
    const [previewScaling, setPreviewScaling] = useState<number>(1)

    useEffect(() => {
        setLasers(props.level.lasers.map(l => new Laser(l)))
        setBlocks(props.level.blocks.map(b => new Block(b, props.level)))
    }, [props.level])

    useEffect(() => {
        function handleResize() {
            if (wrapperRef.current) {
                const targetWidth = wrapperRef.current.offsetHeight * WORLD_ASPECT
                setPreviewScaling(targetWidth / WORLD_WIDTH)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => { window.removeEventListener('resize', handleResize) }
    })

    return (
        <div ref={wrapperRef} className={styles.levelPreview + ' bg-light'} style={{
            paddingBottom: 'min(' + (1 / WORLD_ASPECT * 100) + '%, 7rem)' // scale height of div such that aspect ratio is presevered but do not exceed a maximum height
        }}>
            <div className={styles.world + ' mb-3'} style={{
                width: WORLD_WIDTH + 'px',
                height: WORLD_HEIGHT + 'px',
                transform: 'scale(' + previewScaling + ') translateX(-50%)'
            }}>
                {blocks.map(block => <BlockComponent key={block.id} block={block} />)}
                {lasers.map(laser => <LaserComponent key={laser.id} laser={laser} phase={phase} blocks={blocks} />)}
            </div>
        </div>
    )
}