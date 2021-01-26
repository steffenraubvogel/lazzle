import styles from "./Lazzle.module.scss";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Modal from "../components/Modal";
import { LOCAL_STORAGE_KEY_FEATURES_INTRODUCED, LOCAL_STORAGE_KEY_SHOW_HINTS } from "./Constants";
import { Colors, Level, LevelFeature } from "./Levels";
import { ReactComponent as LaserSvg } from "./images/laser.svg"
import { ReactComponent as GripIcon } from "bootstrap-icons/icons/grip-vertical.svg"
import { ReactComponent as PlayIcon } from "bootstrap-icons/icons/play.svg"
import { ReactComponent as BlockLinkIcon } from "bootstrap-icons/icons/pause.svg"
import { readAndParseFromLocalStorage as readObjectFromLocalStorage } from "./Util";

export default function FeatureIntroduction(props: { level: Level }) {

    const { t } = useTranslation()
    const [featuresToIntroduce, setFeaturesToIntroduce] = useState<LevelFeature[]>()
    const [disableHintsInFuture, setDisableHintsInFuture] = useState<boolean>(false)

    useEffect(() => {

        // check if we have shown the introductions of the new level features in the past
        const alreadyShown = readObjectFromLocalStorage<LevelFeature[]>(LOCAL_STORAGE_KEY_FEATURES_INTRODUCED, [])
        const newFeatures = props.level.firstOccurrenceOfFeatures
        const toIntroduce = newFeatures.filter(f => !alreadyShown.includes(f))

        if (toIntroduce.length > 0) {
            setFeaturesToIntroduce(toIntroduce)
        }

    }, [props.level])

    function close() {
        const newIntroduced = readObjectFromLocalStorage<LevelFeature[]>(LOCAL_STORAGE_KEY_FEATURES_INTRODUCED, []).concat(featuresToIntroduce!)
        localStorage.setItem(LOCAL_STORAGE_KEY_FEATURES_INTRODUCED, JSON.stringify(newIntroduced))
        localStorage.setItem(LOCAL_STORAGE_KEY_SHOW_HINTS, JSON.stringify(!disableHintsInFuture))
        setFeaturesToIntroduce(undefined)
    }

    const showHints = readObjectFromLocalStorage<boolean>(LOCAL_STORAGE_KEY_SHOW_HINTS, true)

    return showHints && featuresToIntroduce ? (
        <Modal close={close}>
            <div className={styles.intro}>
                {featuresToIntroduce.includes("FIRST") && <>
                    <h3>{t('game.help.features.first.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.first.p1'>
                            <LaserSvg /><div className={styles.block} style={{ backgroundColor: Colors[0] }}></div><PlayIcon /><em></em>
                        </Trans>
                    </p>
                    <p>
                        {t('game.help.features.first.p2')}
                    </p>

                    <h3>{t('game.help.features.first.h2')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.first.p3'>
                            <GripIcon /><span className={styles.introLaserAimLine}></span>
                        </Trans>
                    </p>
                </>}

                {featuresToIntroduce.includes("BLOCK_COLOR") && <>
                    <h3>{t('game.help.features.blockColor.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.blockColor.p1'>
                            {[0, 1, 2].map(c => <div className={styles.block} style={{ backgroundColor: Colors[c] }} />)}
                        </Trans>
                    </p>
                </>}

                {featuresToIntroduce.includes("STRENGTHENED_BLOCK") && <>
                    <h3>{t('game.help.features.strengthenedBlock.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.strengthenedBlock.p1'>
                            <StrengthenedBlockIcon strength={2} />
                            <StrengthenedBlockIcon strength={3} />
                        </Trans>
                    </p>
                </>}

                {featuresToIntroduce.includes("LINKED_BLOCK") && <>
                    <h3>{t('game.help.features.linkedBlock.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.linkedBlock.p1'>
                            <BlockLinkIcon />
                        </Trans>
                    </p>
                </>}

                {featuresToIntroduce.includes("LASER_COLOR") && <>
                    <h3>{t('game.help.features.laserColor.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.laserColor.p1'>
                            <LaserSvg style={{ color: Colors[0] }} />
                        </Trans>
                    </p>
                </>}

                {featuresToIntroduce.includes("LASER_ORDER") && <>
                    <h3>{t('game.help.features.laserOrder.h1')}</h3>
                    <p>{t('game.help.features.laserOrder.p1')}</p>
                </>}

                {featuresToIntroduce.includes("UNMOVABLE_LASER") && <>
                    <h3>{t('game.help.features.unmovableLaser.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.unmovableLaser.p1'>
                            <GripIcon className={styles.introUnmovable} />
                        </Trans>
                    </p>
                </>}

                {featuresToIntroduce.includes("UNROTATABLE_LASER") && <>
                    <h3>{t('game.help.features.unrotatableLaser.h1')}</h3>
                    <p>
                        <Trans i18nKey='game.help.features.unrotatableLaser.p1'>
                            <span className={styles.introLaserAimLine + ' ' + styles.introUnrotatable}></span>
                        </Trans>
                    </p>
                </>}
            </div>
            <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" id="hintsCheckBox" checked={disableHintsInFuture}
                    onChange={event => setDisableHintsInFuture(event.target.checked)} />
                <label className="form-check-label" htmlFor="hintsCheckBox">Do not show hints in future.</label>
            </div>
        </Modal>
    ) : <></>
}

function StrengthenedBlockIcon(props: { strength: number }) {
    return <div className={styles.block} style={{ backgroundColor: Colors[0] }}>
        <div className={styles.blockStrengthened + ' ' + styles['blockStrengthened' + (props.strength - 1)]} />
    </div>
}