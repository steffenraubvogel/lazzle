import styles from "./Lazzle.module.scss";
import { useEffect, useState } from "react";
import BlockComponent, { Block } from "./Block";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import LaserComponent, { Laser } from "./Laser";
import { Level } from "./Levels";
import { LevelPreviewPhase } from "./Phase";
import AutoScaler from "../components/AutoScaler";

export default function LevelPreview(props: { level: Level }) {

    const [lasers, setLasers] = useState<Laser[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const phase = new LevelPreviewPhase()

    useEffect(() => {
        setLasers(props.level.lasers.map(l => new Laser(l)))
        setBlocks(props.level.blocks.map(b => new Block(b, props.level)))
    }, [props.level])

    return (
        <div className={styles.levelPreview + ' bg-light'}>
            <AutoScaler defaultWidth={WORLD_WIDTH} defaultHeight={WORLD_HEIGHT} maxScaledHeight='7rem' className={styles.world}>
                {blocks.map(block => <BlockComponent key={block.id} block={block} phase={phase} />)}
                {lasers.map(laser => <LaserComponent key={laser.id} laser={laser} phase={phase} blocks={blocks} />)}
            </AutoScaler>
        </div>
    )
}