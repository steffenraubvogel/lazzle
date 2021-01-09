import { useEffect, useState } from "react";
import styles from "./Lazzle.module.scss";
import { Level, AllLevels } from "./Levels";
import { LOCAL_STORAGE_KEY_GAME_PROGRESS } from "./Constants";
import Game from "./Game";

export default function LazzleGame() {

    const [level, setLevel] = useState<Level>(AllLevels[0])

    useEffect(() => {
        // check local storage for previous game progress
        const gameProgress = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_PROGRESS)
        let levelToLoad = 0
        if (gameProgress) {
            levelToLoad = Math.min(AllLevels.length, Math.max(0, Math.round(Number(gameProgress))))
        }

        setLevel(AllLevels[1])
    }, [])

    function startNextLevel() {
        const nextLevel = (AllLevels.indexOf(level) + 1) % AllLevels.length
        localStorage.setItem(LOCAL_STORAGE_KEY_GAME_PROGRESS, nextLevel.toString())
        setLevel(AllLevels[nextLevel])
    }

    return <div className={"container-md " + styles.lazzle}>
        <h1>Lazzle</h1>

        <h2>Level {AllLevels.indexOf(level) + 1} - {level.name}</h2>
        <Game level={level} levelFinishedButtonText='Next Level' onLevelFinished={startNextLevel} />

        <h2>How to</h2>
        <p>
            The game consists of colored blocks and lasers.
        </p>
        <ul>
            <li>Use <em>Toggle Goal</em> to see the target blocks arrangement that you need to accomplish by shooting with the lasers.</li>
            <li>Each laser can be dragged around on its semi-circle and rotated in any direction. Hover a laser to see its movement and rotation handles.
                    Drag a handle to move or rotate the laser.</li>
            <li>Once you are ready click <em>Start Lasers</em>. Lasers will be shot in sequence as indicated by their numbers. The lasers will
                    destroy or re-color the blocks they are aiming at. Blocks up in the air will then fall down. After all lasers shot, the resulting block arrangement
                    will be compared with the goal.</li>
        </ul>
        <p>
            You will win the level if all resulting blocks match with the target blocks.
        </p>

        <h2>Hints and Help</h2>
        <p>
            The difficulty will increase with each level. At the moment there are {AllLevels.length} levels available.
        </p>
        <p>
            Shortcuts:
        </p>
        <ul>
            <li><kbd>g</kbd> - toggle goal</li>
        </ul>
    </div>

}