import { useMemo } from "react";
import styles from "./Lazzle.module.scss";
import { Level, AllLevels } from "./Levels";
import { LOCAL_STORAGE_KEY_GAME_PROGRESS } from "./Constants";
import Game from "./Game";
import { ReactComponent as CheckIcon } from "bootstrap-icons/icons/check.svg"
import { ReactComponent as TrophyIcon } from "./images/trophy.svg"
import { Link, Route, RouteComponentProps, Switch, useRouteMatch } from "react-router-dom";
import LevelPreview from "./LevelPreview";

function getGameProgressFromLocalStorage() {
    const storedProgress = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_PROGRESS)
    return storedProgress ? Math.min(AllLevels.length, Math.max(0, Math.round(Number(storedProgress)))) : 0
}

export function LevelChooser(props: RouteComponentProps) {

    const progress = getGameProgressFromLocalStorage()

    return <section>
        <h2>Choose a Level</h2>
        <div className="row my-3 cardRow">
            {AllLevels.map((availableLevel, index) =>
                <div key={index} className='col-12 col-sm-6 col-md-4 col-lg-3 mb-3'>
                    <div className={"card shadow-sm " + (index < progress ? styles.levelCompleted : (index === progress ? styles.levelUnlocked : styles.levelLocked))}>
                        <div className='card-img-top'>
                            <LevelPreview level={availableLevel} />
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">Level {index + 1}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">{availableLevel.name}</h6>
                            <div className='cardActions d-flex'>
                                <Link className={"btn "
                                    + (index === progress ? 'btn-outline-primary' : 'btn-outline-secondary')
                                    + " stretched-link"
                                    + (index > progress ? ' disabled' : '')}
                                    to={props.match.path + '/' + index}
                                >
                                    {(index < progress ? 'Play again' : (index === progress ? 'Play' : 'Locked'))}
                                </Link>
                                {index < progress && <CheckIcon className={styles.levelCompletedCheckMark} />}
                            </div>
                        </div>
                    </div>
                </div>)}
        </div>
    </section>
}

export function LevelLoader(props: RouteComponentProps<{ levelIndex?: string | undefined }>) {

    const level = useMemo<Level | undefined>(
        () => {
            // load level as in URL parameters
            const parsedLevelIndex = Number(props.match.params.levelIndex)
            return parsedLevelIndex >= 0 && parsedLevelIndex < AllLevels.length ? AllLevels[parsedLevelIndex] : undefined
        },
        [props.match.params.levelIndex])

    function startNextLevel() {
        const nextLevelIndex = AllLevels.indexOf(level!) + 1

        if (nextLevelIndex === AllLevels.length) {
            // all levels completed
            props.history.push('/game/completed')
        }
        else {
            props.history.push('/game/' + nextLevelIndex)
        }
    }

    function storeProgress() {
        const nextLevel = AllLevels.indexOf(level!) + 1
        if (nextLevel > getGameProgressFromLocalStorage()) {
            localStorage.setItem(LOCAL_STORAGE_KEY_GAME_PROGRESS, nextLevel.toString())
        }
    }

    return <>
        {level && <>
            <section>
                <h2>Level {AllLevels.indexOf(level) + 1} - {level.name}</h2>
                <Game level={level}
                    levelFinishedButtonText={AllLevels.indexOf(level) === AllLevels.length - 1 ? 'Finish Level' : 'Next Level'} 
                    onLevelFinished={storeProgress}
                    onLevelFinishedClick={startNextLevel} />
            </section>

            <section>
                <h2>How to</h2>
                <p>
                    The game consists of colored blocks and lasers.
                </p>
                <ul>
                    <li>Use <em>Toggle Goal</em> to see the target blocks arrangement that you need to accomplish by shooting with the lasers.</li>
                    <li>Lasers can be dragged around on their semi-circle and rotated in any direction (if allowed by level). Drag the grip behind
                        the laser to move it. Drag the laser aid line to rotate it.</li>
                    <li>Once you are ready click <em>Start Lasers</em>. Lasers will be shot in sequence as indicated by their numbers. The lasers will
                        destroy or re-color the blocks they are aiming at. Blocks up in the air will then fall down. After all lasers shot, the resulting
                        block arrangement will be compared with the goal.</li>
                    <li>If a laser has a color different than black then its shot will not destroy but re-color the blocks hit.</li>
                </ul>
                <p>
                    You will win the level if all resulting blocks match with the target blocks. Have fun!
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

        {!level && <>
            <h2>Level not found</h2>
            <p>
                The level you are requesting doesn't exist. Please visit the <Link to='/game'>level chooser</Link>.
            </p>
        </>}
    </>
}

function LevelsCompleted() {
    return <section>
        <h2>Congratulations!</h2>
        <p>
            You managed to solve all levels. Well done!
        </p>
        <TrophyIcon />
    </section>
}

export default function LazzleGame() {

    const match = useRouteMatch();

    return <div className={"container-md " + styles.lazzle}>
        <h1>Lazzle</h1>

        <Switch>
            <Route path={match.path + '/completed'} component={LevelsCompleted} />
            <Route path={match.path + '/:levelIndex'} component={LevelLoader} />
            <Route path={match.path} component={LevelChooser} />
        </Switch>
    </div>
}