import { useState } from "react";
import styles from "./Lazzle.module.scss";
import { Level, AllLevels } from "./Levels";
import { LOCAL_STORAGE_KEY_GAME_PROGRESS } from "./Constants";
import Game from "./Game";
import { ReactComponent as CheckIcon } from "bootstrap-icons/icons/check.svg"

export default function LazzleGame() {

    const [level, setLevel] = useState<Level>()
    const [progress, setProgress] = useState<number>(() => {
        // check local storage for previous game progress
        const storedProgress = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_PROGRESS)
        return storedProgress ? Math.min(AllLevels.length, Math.max(0, Math.round(Number(storedProgress)))) : 0
    })

    function startNextLevel() {
        const nextLevel = (AllLevels.indexOf(level!) + 1) % AllLevels.length
        if (nextLevel > progress) {
            localStorage.setItem(LOCAL_STORAGE_KEY_GAME_PROGRESS, nextLevel.toString())
            setProgress(nextLevel)
        }
        setLevel(AllLevels[nextLevel])
    }

    return <div className={"container-md " + styles.lazzle}>
        <h1>Lazzle</h1>

        {!level && <>
            <section>
                <h2>Choose Your Level</h2>
                <div className="row my-3">
                    {AllLevels.map((availableLevel, index) =>
                        <div key={index} className='col-12 col-sm-6 col-md-4 col-lg-3 mb-3'>
                            <div className={"card shadow-sm " + (index < progress ? styles.levelCompleted : (index === progress ? styles.levelUnlocked : styles.levelLocked))}>
                                <div className="card-body">
                                    <h5 className="card-title">Level {index + 1}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{availableLevel.name}</h6>
                                    <div className='d-flex'>
                                        <button type="button" className="btn btn-outline-secondary stretched-link" disabled={index > progress} onClick={() => setLevel(availableLevel)}>
                                            {(index < progress ? 'Play again' : (index === progress ? 'Play' : 'Locked'))}
                                        </button>
                                        {index < progress && <CheckIcon className={styles.levelCompletedCheckMark} />}
                                    </div>
                                </div>
                            </div>
                        </div>)}
                </div>
            </section>
        </>}

        {level && <>
            <section>
                <h2>Level {AllLevels.indexOf(level) + 1} - {level.name}</h2>
                <Game level={level} levelFinishedButtonText='Next Level' onLevelFinished={startNextLevel} />
            </section>

            <section>
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
            </section>

            <section>
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
            </section>
        </>}
    </div>

}