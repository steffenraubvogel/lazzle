import { useMemo } from "react";
import styles from "./Lazzle.module.scss";
import { Level, AllLevels } from "./Levels";
import { LOCAL_STORAGE_KEY_GAME_PROGRESS } from "./Constants";
import Game from "./Game";
import { ReactComponent as CheckIcon } from "bootstrap-icons/icons/check.svg"
import { ReactComponent as TrophyIcon } from "./images/trophy.svg"
import { Link, Route, RouteComponentProps, Switch, useRouteMatch } from "react-router-dom";
import LevelPreview from "./LevelPreview";
import { Trans, useTranslation } from "react-i18next";
import { getTranslation } from "./Util";

function getGameProgressFromLocalStorage() {
    const storedProgress = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_PROGRESS)
    return storedProgress ? Math.min(AllLevels.length, Math.max(0, Math.round(Number(storedProgress)))) : 0
}

export function LevelChooser(props: RouteComponentProps) {

    const { t, i18n } = useTranslation()
    const progress = getGameProgressFromLocalStorage()

    return <section>
        <h2>{t('game.level.choose')}</h2>
        <div className="row my-3 cardRow">
            {AllLevels.map((availableLevel, index) =>
                <div key={index} className='col-12 col-sm-6 col-md-4 col-lg-3 mb-3'>
                    <div className={"card shadow-sm " + (index < progress ? styles.levelCompleted : (index === progress ? styles.levelUnlocked : styles.levelLocked))}>
                        <div className='card-img-top'>
                            <LevelPreview level={availableLevel} />
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">{t('game.level.title', { index: index + 1 })}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">{getTranslation(availableLevel.name, i18n)}</h6>
                            <div className='cardActions d-flex'>
                                <Link className={"btn "
                                    + (index === progress ? 'btn-outline-primary' : 'btn-outline-secondary')
                                    + " stretched-link"
                                    + (index > progress ? ' disabled' : '')}
                                    to={props.match.path + '/' + index}
                                >
                                    {t(index < progress ? 'game.level.play_again' : (index === progress ? 'game.level.play' : 'game.level.locked'))}
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

    const { t, i18n } = useTranslation()

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
                <h2>Level {AllLevels.indexOf(level) + 1} - {getTranslation(level.name, i18n)}</h2>
                <Game level={level}
                    levelFinishedButtonText={AllLevels.indexOf(level) === AllLevels.length - 1 ? t('game.play.action_finish_level') : t('game.play.action_next_level')}
                    onLevelFinished={storeProgress}
                    onLevelFinishedClick={startNextLevel} />
            </section>

            <section dangerouslySetInnerHTML={{ __html: t('game.help.shortcuts')}}>
            </section>
        </>}

        {!level && <>
            <h2>{t('game.level.not_found.heading')}</h2>
            <p>
                <Trans i18nKey="game.level.not_found.description"><Link to='/game'></Link></Trans>
            </p>
        </>}
    </>
}

function LevelsCompleted() {

    const { t } = useTranslation()

    return <section>
        <h2>{t('game.won.heading')} </h2>
        <p>
            {t('game.won.description')}
        </p>
        <TrophyIcon />
    </section>
}

export default function LazzleGame() {

    const { t } = useTranslation()
    const match = useRouteMatch();

    return <div className={"container-md " + styles.lazzle}>
        <h1>{t('game.heading')}</h1>

        <Switch>
            <Route path={match.path + '/completed'} component={LevelsCompleted} />
            <Route path={match.path + '/:levelIndex'} component={LevelLoader} />
            <Route path={match.path} component={LevelChooser} />
        </Switch>
    </div>
}