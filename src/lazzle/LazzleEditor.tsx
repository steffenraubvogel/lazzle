import { ChangeEvent, useEffect, useState } from "react";
import styles from "./Lazzle.module.scss";
import LaserComponent, { Laser } from "./Laser";
import BlockComponent, { Block } from "./Block";
import { AllLevels, BlockStrengthNames, ColorNames, Colors, Level, LevelBlock, LevelLaser } from "./Levels";
import { LevelEditorPhase } from "./Phase";
import Tabs, { Tab } from "../components/Tabs";
import Accordion, { AccordionItem } from "../components/Accordion";
import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";
import { ReactComponent as EraserIcon } from "bootstrap-icons/icons/eraser.svg"
import { ReactComponent as ClipboardIcon } from "bootstrap-icons/icons/clipboard.svg"
import Modal from "../components/Modal";
import Game from "./Game";
import Obfuscate from 'react-obfuscate';

export default function LazzleLevelEditor() {

    const [level, setLevel] = useState<Level>({
        name: 'New Level',
        gridX: 4,
        gridY: 5,
        blocks: [],
        goal: [],
        lasers: []
    })
    const [lasers, setLasers] = useState<Laser[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const [goalBlocks, setGoalBlocks] = useState<Block[]>([])
    const [showGoal, setShowGoal] = useState<boolean>(false)

    const [activeBlockColor, setActiveBlockColor] = useState<number>(0)
    const [activeStrength, setActiveStrength] = useState<number>(1)

    const [testLevel, setTestLevel] = useState<Level>()

    const [importValue, setImportValue] = useState<string>('')

    function handleLevelNameChange(event: ChangeEvent<HTMLInputElement>) {
        setLevel(prev => ({ ...prev, name: event.target.value }))
    }
    function handleGridXRangeChange(event: ChangeEvent<HTMLInputElement>) {
        const newGridX = Number(event.target.value)
        setLevel(prev => ({
            ...prev, gridX: newGridX,
            blocks: removeOutsideBlocks(prev.blocks, newGridX, prev.gridY),
            goal: removeOutsideBlocks(prev.goal, newGridX, prev.gridY)
        }))
    }
    function handleGridYRangeChange(event: ChangeEvent<HTMLInputElement>) {
        const newGridY = Number(event.target.value)
        setLevel(prev => ({
            ...prev, gridY: newGridY,
            blocks: removeOutsideBlocks(prev.blocks, prev.gridX, newGridY),
            goal: removeOutsideBlocks(prev.goal, prev.gridX, newGridY)
        }))
    }

    function removeOutsideBlocks(blocks: LevelBlock[], gridX: number, gridY: number) {
        return blocks.filter(b => b.x < gridX && b.y < gridY)
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
            alert(`Imported level '${loadedLevel.name}'.`)
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
            alert(`Imported level '${existingLevel.name}'.`)
        }
    }

    return <div className={"container-md " + styles.lazzle}>
        <h1>Lazzle - Level Editor</h1>

        <section>
            <h2>Settings</h2>

            <div className="row">
                <div className="col-12 col-md-6">
                    <div className="mb-3 mb-md-0">
                        <label htmlFor="levelNameInput" className="form-label"> Level name:</label>
                        <input id="levelNameInput" name="levelName" type="text" className="form-control" value={level.name} onChange={handleLevelNameChange} />
                        <div className="form-text">Provide a funny and short description for the level, usually with a hint on difficulty.</div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className='mb-3'>
                        <label htmlFor="gridXRange" className="form-label">Level width: {level.gridX} blocks</label>
                        <input id="gridXRange" type="range" className="form-range" min="1" max="15" step="1" value={level.gridX} onChange={handleGridXRangeChange} />
                    </div>

                    <div className='mb-3 mb-md-0'>
                        <label htmlFor="gridYRange" className="form-label">Level height: {level.gridY} blocks</label>
                        <input id="gridYRange" type="range" className="form-range" min="1" max="15" step="1" value={level.gridY} onChange={handleGridYRangeChange} />
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h2>Design</h2>

            <div className={"btn-group " + styles.editorSwitchMode} role="group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={!showGoal} onChange={() => setShowGoal(false)} />
                <label className="btn btn-outline-primary" htmlFor="btnradio1">Starting Blocks</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={showGoal} onChange={() => setShowGoal(true)} />
                <label className="btn btn-outline-primary" htmlFor="btnradio2">Goal Blocks</label>
            </div>
            <div className={styles.world + ' ' + styles.editor + ' mb-3'} style={{ width: WORLD_WIDTH + 'px', height: WORLD_HEIGHT + 'px' }}>
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
            </div>

            <Tabs>
                <Tab header='Blocks'>
                    <div className="mb-3">
                        <label className="form-label">Select a color and click on a block above to color it:</label>
                        <div>
                            <button className={'btn btn-outline-secondary me-2' + (-1 === activeBlockColor ? ' active' : '')}
                                onClick={() => setActiveBlockColor(-1)}>
                                <EraserIcon />&nbsp;Rubber
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
                        <div className="form-text">Colors are predefined. Use the rubber to remove blocks.</div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor='strengthSelect' className="form-label">Block Strength:</label>
                        <select id='strengthSelect' className="form-select" value={activeStrength} onChange={event => setActiveStrength(Number(event.target.value))}>
                            {BlockStrengthNames.map((bsn, index) => (index === 0 ? undefined :
                                <option key={index} value={index}>{bsn} ({index} shots to destroy)</option>))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Or use one of the tools below:</label>
                        <div>
                            <button className='btn btn-outline-secondary me-2' onClick={removeAllBlocks}>Remove all blocks</button>
                        </div>
                    </div>
                </Tab>
                <Tab header='Lasers'>
                    <Accordion>
                        {level.lasers.map((laser, index) => <AccordionItem key={index} header={'Laser #' + (index + 1)}>
                            <div className='row'>
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserOrderInput_" + index} className="form-label">Order:</label>
                                    <input type="number" className="form-control" id={"laserOrderInput_" + index} value={laser.order}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'order', event)} min={1} max={level.lasers.length} step={1} />
                                    <div className="form-text">The order defines the sequence of laser shots. Lower order numbers start first.</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserDistanceInput_" + index} className="form-label">Distance: {laser.distance}</label>
                                    <input type="range" className="form-range" id={"laserDistanceInput_" + index} value={laser.distance}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'distance', event)} min={200} max={400} step={25} />
                                    <div className="form-text">The distance from the bottom center of the blocks (radius of laser's semi-circle).</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserAngleInput_" + index} className="form-label">Angle: {laser.angle}°</label>
                                    <input type="range" className="form-range" id={"laserAngleInput_" + index} value={laser.angle}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'angle', event)} min={0} max={180} step={1} />
                                    <div className="form-text">Controls where the laser is positioned on its semi-circle.</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserRotationInput_" + index} className="form-label">Rotation: {laser.rotation}°</label>
                                    <input type="range" className="form-range" id={"laserRotationInput_" + index} value={laser.rotation}
                                        onChange={event => handleNumericLaserPropertyChange(laser, 'rotation', event)} min={0} max={359} step={1} />
                                    <div className="form-text">Sets the direction in which the laser shoots.</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id={"laserMovableSwitch_" + index} checked={laser.movable}
                                            onChange={event => handleBooleanLaserPropertyChange(laser, 'movable', event)} />
                                        <label className="form-check-label" htmlFor={"laserMovableSwitch_" + index}>Can be moved</label>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id={"laserRotatableSwitch_" + index} checked={laser.rotatable}
                                            onChange={event => handleBooleanLaserPropertyChange(laser, 'rotatable', event)} />
                                        <label className="form-check-label" htmlFor={"laserRotatableSwitch_" + index}>Can be rotated</label>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserColor_" + index} className="form-label">Effect:</label>
                                    <select id={"laserColor_" + index} className="form-select" value={laser.color}
                                        onChange={event => handleLaserColorChange(laser, event)}>
                                        <option value={-1}>Destroys blocks</option>
                                        {Colors.map((color, index) =>
                                            <option key={index} value={index} style={{ backgroundColor: color }}>Colors blocks to {ColorNames[index]}</option>)}
                                    </select>
                                    <div className="form-text">If a color is chosen then the laser will not destroy but color the hit blocks.</div>
                                </div>
                            </div>
                            <button className='btn btn-outline-secondary' onClick={() => removeLaser(index)}>Remove This Laser</button>
                        </AccordionItem>)}
                    </Accordion>

                    <button className='btn btn-outline-secondary' onClick={addLaser}>Add Laser</button>
                </Tab>
            </Tabs>
        </section >

        <section>
            <h2>Test Level</h2>
            <p>
                You can try out your level here. A fullscreen dialog will open and show how the level would be played by users.
            </p>
            <button className='btn btn-outline-secondary' onClick={() => setTestLevel(level)}>Test Level</button>
            {testLevel &&
                <Modal title='Test Your Level' fullScreen={true} close={() => setTestLevel(undefined)}>
                    <div className='d-flex justify-content-center'>
                        <div>
                            <Game level={testLevel} levelFinishedButtonText='Close Test' onLevelFinishedClick={() => setTestLevel(undefined)} />
                        </div>
                    </div>
                </Modal>}
        </section>

        <section>
            <h2>Export</h2>

            <label htmlFor="exportOutput" className="form-label">
                The level is stored as JSON file. If you would like to share your awesome level, copy the level data below and send me 
                an <Obfuscate email="steffen@lazzle.de">email</Obfuscate>:
            </label>
            <div className='row'>
                <div className='col'>
                    <textarea
                        className={'form-control ' + styles.exportOutput} id="exportOutput" rows={10} readOnly={true}
                        value={JSON.stringify(level, null, 4)}>
                    </textarea>
                </div>
                <div className='col-auto'>
                    <button type="button" className="btn btn-outline-secondary" onClick={copyExportOutput}><ClipboardIcon /></button>
                </div>
            </div>
        </section>

        <section>
            <h2>Import</h2>

            <div className="mb-3">
                <label htmlFor="importInput" className="form-label">
                    In case you need to refine an existing level or don't want to start from scratch, you can paste the level JSON
                below and click the <em>Load Level</em> button.
            </label>
                <div className='row'>
                    <div className='col'>
                        <textarea
                            className={'form-control ' + styles.importInput} id="importInput" rows={4}
                            value={importValue} onChange={handleImportInputChange}>
                        </textarea>
                    </div>
                    <div className='col-auto'>
                        <button type="button" className="btn btn-outline-secondary" onClick={importLevel}>Load Level</button>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="importExistingLevelSelect" className="form-label">Alternatively you can load an existing level from the game:</label>
                <select id="importExistingLevelSelect" className="form-select" value={undefined} onChange={importExistingLevel}>
                    <option value={-1}>Select a level to load it.</option>
                    {AllLevels.map((existingLevel, index) =>
                        <option key={index} value={index}>{(index + 1) + ' - ' + existingLevel.name}</option>)}
                </select>
            </div>
        </section>
    </div >

}