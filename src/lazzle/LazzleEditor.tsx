import { ChangeEvent, useEffect, useState } from "react";
import styles from "./Lazzle.module.scss";
import LaserComponent, { Laser } from "./Laser";
import BlockComponent, { Block } from "./Block";
import { AllLevels, Colors, Level, LevelBlock, LevelLaser, MAX_BLOCK_STRENGTH } from "./Levels";
import { LevelEditorPhase } from "./Phase";
import Tabs, { Tab } from "../components/Tabs";
import Accordion, { AccordionItem } from "../components/Accordion";
import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { ReactComponent as EraserIcon } from "bootstrap-icons/icons/eraser.svg"
import { ReactComponent as ClipboardIcon } from "bootstrap-icons/icons/clipboard.svg"
import Modal from "../components/Modal";
import AutoScaler from "../components/AutoScaler";
import Game from "./Game";
import Obfuscate from 'react-obfuscate';
import { Trans, useTranslation } from "react-i18next";
import { getTranslation } from "./Util";

export default function LazzleLevelEditor() {

    const { t, i18n } = useTranslation()

    const [level, setLevel] = useState<Level>({
        name: { 'en': 'New Level', 'de': 'Neues Level' },
        gridX: 4,
        gridY: 5,
        blocks: [],
        goal: [],
        lasers: [{
            order: 1,
            distance: 300,
            angle: 120,
            rotation: 270,
            movable: true,
            rotatable: true,
            color: undefined
        }]
    })
    const [lasers, setLasers] = useState<Laser[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const [goalBlocks, setGoalBlocks] = useState<Block[]>([])
    const [showGoal, setShowGoal] = useState<boolean>(false)

    const [activeBlockColor, setActiveBlockColor] = useState<number>(0)
    const [activeStrength, setActiveStrength] = useState<number>(1)
    const [initialLaserOpen, setInitialLaserOpen] = useState<number>()

    const [testLevel, setTestLevel] = useState<Level>()

    const [importValue, setImportValue] = useState<string>('')

    function handleLevelNameChange(event: ChangeEvent<HTMLInputElement>, lng: string) {
        setLevel(prev => ({
            ...prev, name: {
                ...prev.name,
                [lng]: event.target.value
            }
        }))
    }
    function handleGridXRangeChange(event: ChangeEvent<HTMLInputElement>) {
        const oldGridX = level.gridX
        const newGridX = Number(event.target.value)
        let offsetX = (newGridX - oldGridX) / 2.0
        if (offsetX % 1 !== 0) {
            // fractional offset, means the diff gridX is uneven, so we have to decide to put a new column to the left or right of blocks
            if (newGridX % 2 === 0) {
                offsetX = Math.floor(offsetX)
            }
            else {
                offsetX = Math.ceil(offsetX)
            }
        }

        setLevel(prev => ({
            ...prev, gridX: newGridX,
            blocks: moveBlocksAndRemoveOutsideBlocks(prev.blocks, offsetX, 0, newGridX, prev.gridY),
            goal: moveBlocksAndRemoveOutsideBlocks(prev.goal, offsetX, 0, newGridX, prev.gridY)
        }))
    }
    function handleGridYRangeChange(event: ChangeEvent<HTMLInputElement>) {
        const oldGridY = level.gridY
        const newGridY = Number(event.target.value)
        const offsetY = newGridY - oldGridY
        setLevel(prev => ({
            ...prev, gridY: newGridY,
            blocks: moveBlocksAndRemoveOutsideBlocks(prev.blocks, 0, offsetY, prev.gridX, newGridY),
            goal: moveBlocksAndRemoveOutsideBlocks(prev.goal, 0, offsetY, prev.gridX, newGridY)
        }))
    }

    function moveBlocksAndRemoveOutsideBlocks(blocks: LevelBlock[], offsetX: number, offsetY: number, gridX: number, gridY: number) {
        return blocks.map(b => ({ ...b, x: b.x + offsetX, y: b.y + offsetY }))
            .filter(b => b.x < gridX && b.x >= 0 && b.y < gridY && b.y >= 0)
    }

    useEffect(() => {
        setLasers(level.lasers.map(l => new Laser(l)))
        setBlocks(level.blocks.map(b => new Block(b, level)))
        setGoalBlocks(level.goal.map(b => new Block(b, level)))
    }, [level])

    function removeAllBlocks() {
        setLevel(prev => ({ ...prev, blocks: [], goal: [] }))
    }

    function handleBlockClick(blockX: number, blockY: number) {
        const blocksType: keyof Level = showGoal ? 'goal' : 'blocks'
        const existingBlock = level[blocksType].find(b => b.x === blockX && b.y === blockY)

        if (!existingBlock && activeBlockColor >= 0) {
            // add a new block with active color and strength
            setLevel(prev => ({ ...prev, [blocksType]: prev[blocksType].concat({ x: blockX, y: blockY, color: activeBlockColor, strength: activeStrength }) }))
        }
        else if (existingBlock && activeBlockColor === -1) {
            // remove a block
            setLevel(prev => ({ ...prev, [blocksType]: prev[blocksType].filter(b => b !== existingBlock) }))
        }
        else if (existingBlock && activeBlockColor >= 0) {
            // re-color block and adapt strength
            setLevel(prev => ({
                ...prev,
                [blocksType]: prev[blocksType].map(b => {
                    if (b === existingBlock) {
                        return { ...b, color: activeBlockColor, strength: activeStrength }
                    }
                    return b
                })
            }))
        }
    }

    function addLaser() {
        setInitialLaserOpen(level.lasers.length)
        setLevel(prev => ({
            ...prev, lasers: prev.lasers.concat({
                distance: 300,
                rotation: 90,
                angle: Math.ceil(10 + 160 * Math.random()),
                order: 1,
                movable: true,
                rotatable: true
            })
        }))
    }

    function removeLaser(index: number) {
        setLevel(prev => ({ ...prev, lasers: prev.lasers.filter((_l, i) => i !== index) }))
    }

    function handleNumericLaserPropertyChange(laser: LevelLaser, property: keyof LevelLaser, event: ChangeEvent<HTMLInputElement>) {
        setLevel(prev => ({
            ...prev, lasers: prev.lasers.map(l => {
                if (l === laser) {
                    return { ...l, [property]: event.target.valueAsNumber }
                }
                return l
            })
        }))
    }

    function handleBooleanLaserPropertyChange(laser: LevelLaser, property: keyof LevelLaser, event: ChangeEvent<HTMLInputElement>) {
        setLevel(prev => ({
            ...prev, lasers: prev.lasers.map(l => {
                if (l === laser) {
                    return { ...l, [property]: event.target.checked }
                }
                return l
            })
        }))
    }

    function handleLaserColorChange(laser: LevelLaser, event: ChangeEvent<HTMLSelectElement>) {
        setLevel(prev => ({
            ...prev, lasers: prev.lasers.map(l => {
                if (l === laser) {
                    return { ...l, color: event.target.value === "-1" ? undefined : Number(event.target.value) }
                }
                return l
            })
        }))
    }

    function copyExportOutput() {
        const copyText = document.getElementById("exportOutput") as HTMLTextAreaElement;
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */
        document.execCommand("copy");
    }

    function handleImportInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setImportValue(event.target.value)
    }

    function importLevel() {
        try {
            const loadedLevel = JSON.parse(importValue) as Level
            setLevel(loadedLevel)
            alert(t('editor.import.success', { name: getTranslation(loadedLevel.name, i18n) }))
        }
        catch (e) {
            alert(e)
        }
    }

    function importExistingLevel(event: ChangeEvent<HTMLSelectElement>) {
        const index = Number(event.target.value)
        if (index >= 0) {
            const existingLevel = AllLevels[index]
            setLevel(existingLevel)
            alert(t('editor.import.success', { name: getTranslation(existingLevel.name, i18n) }))
        }
    }

    useEffect(() => {
        // handle shortcuts
        const eventListener: (event: KeyboardEvent) => void = (event) => {
            if (event.key === 'g') {
                setShowGoal(prev => !prev)
                event.preventDefault() // prevents browser features like quick search
            }
        }
        document.addEventListener("keydown", eventListener);
        return () => document.removeEventListener("keydown", eventListener);
    }, [])

    return <div className={"container-md " + styles.lazzle}>
        <h1>{t('editor.heading')}</h1>

        <section>
            <h2>{t('editor.settings.heading')}</h2>

            <div className="row">
                <div className="col-12 col-md-6">
                    <div className="mb-3 mb-md-0">
                        <label htmlFor="levelNameInput0" className="form-label">{t('editor.settings.level_name')}</label>
                        {(i18n.options.supportedLngs as string[]).filter(lng => lng !== 'cimode').map((lng, index) =>
                            <div className="input-group mb-1">
                                <span className="input-group-text">{lng.toUpperCase()}</span>
                                <input key={lng} id={"levelNameInput" + index} name={"levelName" + index} type="text" className="form-control"
                                    value={level.name[lng]} onChange={event => handleLevelNameChange(event, lng)} />
                            </div>)}
                        <div className="form-text">{t('editor.settings.level_name_description')}</div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className='mb-3'>
                        <label htmlFor="gridXRange" className="form-label">{t('editor.settings.width', { value: level.gridX })}</label>
                        <input id="gridXRange" type="range" className="form-range" min="1" max="25" step="1" value={level.gridX} onChange={handleGridXRangeChange} />
                    </div>

                    <div className='mb-3 mb-md-0'>
                        <label htmlFor="gridYRange" className="form-label">{t('editor.settings.height', { value: level.gridY })}</label>
                        <input id="gridYRange" type="range" className="form-range" min="1" max="13" step="1" value={level.gridY} onChange={handleGridYRangeChange} />
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h2>{t('editor.design.heading')}</h2>

            <div className={"btn-group " + styles.editorSwitchMode} role="group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={!showGoal} onChange={() => setShowGoal(false)} />
                <label className="btn btn-outline-primary" htmlFor="btnradio1">{t('editor.design.starting_blocks')}</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={showGoal} onChange={() => setShowGoal(true)} />
                <label className="btn btn-outline-primary" htmlFor="btnradio2">{t('editor.design.goal_blocks')}</label>
            </div>

            <div className={styles.editor + ' mb-3 ' + styles.worldContainer}>
                <AutoScaler defaultWidth={WORLD_WIDTH} defaultHeight={WORLD_HEIGHT} className={styles.world} maxScaledHeight='100vh'>
                    <div className={styles.blockAidLines}>
                        {Array(level.gridY).fill(0).map((_y, indexY) =>
                            <div key={indexY} className={styles.blockAidLinesRow}>
                                {Array(level.gridX).fill(0).map((_x, indexX) =>
                                    <div key={indexX}
                                        className={styles.blockAidLinesCell}
                                        style={{ width: BLOCK_SIZE + 'px', height: BLOCK_SIZE + 'px' }}
                                        onClick={() => handleBlockClick(indexX, indexY)}>
                                    </div>)}
                            </div>)}
                    </div>

                    {blocks.map(block => <BlockComponent key={block.id} block={block} />)}
                    {lasers.map(laser => <LaserComponent key={laser.id} laser={laser} phase={new LevelEditorPhase()} blocks={[]} />)}

                    {showGoal && <>
                        <div className={styles.goalContainer}>
                            {goalBlocks.map(block => <BlockComponent key={block.id} block={block} />)}
                        </div>
                    </>}
                </AutoScaler>
            </div>

            <Tabs>
                <Tab header='Blocks'>
                    <div className="mb-3">
                        <label className="form-label">{t('editor.design.block.color')}</label>
                        <div>
                            <button className={'btn btn-outline-secondary me-2' + (-1 === activeBlockColor ? ' active' : '')}
                                onClick={() => setActiveBlockColor(-1)}>
                                <EraserIcon />&nbsp;{t('editor.design.block.rubber')}
                            </button>

                            {Colors.map((_color, index) =>
                                <button key={index}
                                    className={'btn btn-outline-secondary me-2' + (index === activeBlockColor ? ' active' : '')}
                                    onClick={() => setActiveBlockColor(index)}
                                >
                                    <span className='px-2' style={{ backgroundColor: Colors[index] }}>&nbsp;</span>
                                </button>
                            )}
                        </div>
                        <div className="form-text">{t('editor.design.block.color_description')}</div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor='strengthSelect' className="form-label">{t('editor.design.block.strength')}</label>
                        <select id='strengthSelect' className="form-select" value={activeStrength} onChange={event => setActiveStrength(Number(event.target.value))}>
                            {Array(MAX_BLOCK_STRENGTH + 1).fill(0).map((_, index) => (index === 0 ? undefined :
                                <option key={index} value={index}>
                                    {t('editor.design.block.strength_item', { name: t('game.play.block_strength.' + index), count: index })}
                                </option>))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('editor.design.block.other_tools')}</label>
                        <div>
                            <button className='btn btn-outline-secondary me-2' onClick={removeAllBlocks}>{t('editor.design.block.tool_remove_all')}</button>
                        </div>
                    </div>
                </Tab>
                <Tab header='Lasers'>
                    <Accordion initialOpened={initialLaserOpen}>
                        {level.lasers.map((laser, index) => <AccordionItem key={index} header={'Laser #' + (index + 1)}>
                            <div className='row'>
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserOrderInput_" + index} className="form-label">{t('editor.design.laser.order')}</label>
                                    <input type="number" className="form-control" id={"laserOrderInput_" + index} value={laser.order}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'order', event)} min={1} max={level.lasers.length} step={1} />
                                    <div className="form-text">{t('editor.design.laser.order_description')}</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserDistanceInput_" + index} className="form-label">{t('editor.design.laser.distance', { value: laser.distance })}</label>
                                    <input type="range" className="form-range" id={"laserDistanceInput_" + index} value={laser.distance}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'distance', event)} min={200} max={400} step={25} />
                                    <div className="form-text">{t('editor.design.laser.distance_description')}</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserAngleInput_" + index} className="form-label">{t('editor.design.laser.angle', { value: laser.angle })}</label>
                                    <input type="range" className="form-range" id={"laserAngleInput_" + index} value={laser.angle}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'angle', event)} min={0} max={180} step={1} />
                                    <div className="form-text">{t('editor.design.laser.angle_description')}</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserRotationInput_" + index} className="form-label">{t('editor.design.laser.rotation', { value: laser.rotation })}</label>
                                    <input type="range" className="form-range" id={"laserRotationInput_" + index} value={laser.rotation}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'rotation', event)} min={0} max={359} step={1} />
                                    <div className="form-text">{t('editor.design.laser.rotation_description')}</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id={"laserMovableSwitch_" + index} checked={laser.movable}
                                            onChange={event => handleBooleanLaserPropertyChange(laser, 'movable', event)} />
                                        <label className="form-check-label" htmlFor={"laserMovableSwitch_" + index}>{t('editor.design.laser.movable')}</label>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id={"laserRotatableSwitch_" + index} checked={laser.rotatable}
                                            onChange={event => handleBooleanLaserPropertyChange(laser, 'rotatable', event)} />
                                        <label className="form-check-label" htmlFor={"laserRotatableSwitch_" + index}>{t('editor.design.laser.rotatable')}</label>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserColor_" + index} className="form-label">{t('editor.design.laser.effect')}</label>
                                    <select id={"laserColor_" + index} className="form-select" value={laser.color}
                                        onChange={event => handleLaserColorChange(laser, event)}>
                                        <option value={-1}>{t('editor.design.laser.effect_destroy')}</option>
                                        {Colors.map((color, index) =>
                                            <option key={index} value={index} style={{ backgroundColor: color }}>
                                                {t('editor.design.laser.effect_recolor', { colorName: t('game.play.block_color.' + index) })}
                                            </option>)}
                                    </select>
                                    <div className="form-text">{t('editor.design.laser.effect_description')}</div>
                                </div>
                            </div>
                            <button className='btn btn-outline-secondary' onClick={() => removeLaser(index)}>{t('editor.design.laser.remove')}</button>
                        </AccordionItem>)}
                    </Accordion>

                    <button className='btn btn-outline-secondary' onClick={addLaser}>{t('editor.design.laser.add')}</button>
                </Tab>
            </Tabs>
        </section >

        <section>
            <h2>{t('editor.test.heading')}</h2>
            <p>
                {t('editor.test.description')}
            </p>
            <button className='btn btn-outline-secondary' onClick={() => setTestLevel(level)}>{t('editor.test.action')}</button>
            {testLevel &&
                <Modal title='Test Your Level' fullScreen={true} close={() => setTestLevel(undefined)}>
                    <div className='container-md'>
                        <Game level={testLevel} levelFinishedButtonText={t('editor.test.close')} onLevelFinishedClick={() => setTestLevel(undefined)} />
                    </div>
                </Modal>}
        </section>

        <section>
            <h2>{t('editor.export.heading')}</h2>

            <label htmlFor="exportOutput" className="form-label">
                {t('editor.export.description_0') /* obfuscate doesn't work with Trans component */}
                <Obfuscate email="steffen@lazzle.de">{t('editor.export.description_1')}</Obfuscate>
                {t('editor.export.description_2')}
            </label>
            <div className='row'>
                <div className='col'>
                    <textarea
                        className={'form-control ' + styles.exportOutput} id="exportOutput" rows={10} readOnly={true}
                        value={JSON.stringify(level, null, 4)}>
                    </textarea>
                </div>
                <div className='col-auto'>
                    <button type="button" className="btn btn-outline-secondary" onClick={copyExportOutput} title={t('editor.export.copy_tooltip')}><ClipboardIcon /></button>
                </div>
            </div>
        </section>

        <section>
            <h2>{t('editor.import.heading')}</h2>

            <div className="mb-3">
                <label htmlFor="importInput" className="form-label">
                    <Trans i18nKey='editor.import.description'><em></em></Trans>
                </label>
                <div className='row'>
                    <div className='col'>
                        <textarea
                            className={'form-control ' + styles.importInput} id="importInput" rows={4}
                            value={importValue} onChange={handleImportInputChange}>
                        </textarea>
                    </div>
                    <div className='col-auto'>
                        <button type="button" className="btn btn-outline-secondary" onClick={importLevel}>{t('editor.import.load')}</button>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="importExistingLevelSelect" className="form-label">{t('editor.import.existing_level')}</label>
                <select id="importExistingLevelSelect" className="form-select" value={undefined} onChange={importExistingLevel}>
                    <option value={-1}>{t('editor.import.existing_level_placeholder')}</option>
                    {AllLevels.map((existingLevel, index) =>
                        <option key={index} value={index}>{(index + 1) + ' - ' + getTranslation(existingLevel.name, i18n)}</option>)}
                </select>
            </div>
        </section>

        <section>
            <h2>{t('editor.shortcuts.heading')}</h2>
            <ul>
                <li><kbd>g</kbd> - {t('editor.shortcuts.toggle_goal')}</li>
            </ul>
        </section>
    </div >

}