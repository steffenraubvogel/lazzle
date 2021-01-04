import { ChangeEvent, useEffect, useState } from "react";
import styles from "./Lazzle.module.scss";
import LaserComponent, { Laser } from "./Laser";
import BlockComponent, { Block } from "./Block";
import { AllLevels, Colors, Level, LevelBlock, LevelLaser } from "./Levels";
import { LevelEditorPhase } from "./Phase";
import Tabs, { Tab } from "../components/Tabs";
import Accordion, { AccordionItem } from "../components/Accordion";
import { BLOCK_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "./Constants";

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

    const [importValue, setImportValue] = useState<string>('')

    function handleLevelNameChange(event: ChangeEvent<HTMLInputElement>) {
        setLevel(prev => ({ ...prev, name: event.target.value }))
    }
    function handleGridXRangeChange(event: ChangeEvent<HTMLInputElement>) {
        const newGridX = Number(event.target.value)
        setLevel(prev => ({ ...prev, gridX: newGridX, blocks: removeOutsideBlocks(prev.blocks, newGridX, prev.gridY) }))
    }
    function handleGridYRangeChange(event: ChangeEvent<HTMLInputElement>) {
        const newGridY = Number(event.target.value)
        setLevel(prev => ({ ...prev, gridY: newGridY, blocks: removeOutsideBlocks(prev.blocks, prev.gridX, newGridY) }))
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
        setLevel(prev => ({ ...prev, blocks: [] }))
    }

    function handleBlockClick(blockX: number, blockY: number) {
        const blocksType: keyof Level = showGoal ? 'goal' : 'blocks'
        const existingBlock = level[blocksType].find(b => b.x === blockX && b.y === blockY)

        if (!existingBlock && activeBlockColor >= 0) {
            // add a new block
            setLevel(prev => ({ ...prev, [blocksType]: prev[blocksType].concat({ x: blockX, y: blockY, color: activeBlockColor }) }))
        }
        else if (existingBlock && activeBlockColor === -1) {
            // remove a block
            setLevel(prev => ({ ...prev, [blocksType]: prev[blocksType].filter(b => b !== existingBlock) }))
        }
        else if (existingBlock && activeBlockColor >= 0) {
            // re-color block
            setLevel(prev => ({
                ...prev,
                [blocksType]: prev[blocksType].map(b => {
                    if (b === existingBlock) {
                        return { ...b, color: activeBlockColor }
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
                order: 1
            })
        }))
    }

    function removeLaser(index: number) {
        setLevel(prev => ({ ...prev, lasers: prev.lasers.filter((_l, i) => i !== index) }))
    }

    function handleLaserPropertyChange(laser: LevelLaser, property: keyof LevelLaser, event: ChangeEvent<HTMLInputElement>) {
        setLevel(prev => ({
            ...prev, lasers: prev.lasers.map(l => {
                if (l === laser) {
                    return { ...l, [property]: event.target.valueAsNumber }
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
                    <div className="mb-3">
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

                    <div className='mb-3'>
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
            <div id='world' className={styles.world + ' ' + styles.editor + ' mb-3'} style={{ width: WORLD_WIDTH + 'px', height: WORLD_HEIGHT + 'px' }}>
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                </svg>
                            &nbsp;Rubber
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
                                        onChange={event => handleLaserPropertyChange(laser, 'order', event)} min={1} max={level.lasers.length} step={1} />
                                    <div className="form-text">The order defines the sequence of laser shots. Lower order numbers start first.</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserDistanceInput_" + index} className="form-label">Distance: {laser.distance}</label>
                                    <input type="range" className="form-range" id={"laserDistanceInput_" + index} value={laser.distance}
                                        onChange={event => handleLaserPropertyChange(laser, 'distance', event)} min={200} max={400} step={25} />
                                    <div className="form-text">The distance from the bottom center of the blocks (radius of laser's semi-circle).</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserAngleInput_" + index} className="form-label">Angle: {laser.angle}°</label>
                                    <input type="range" className="form-range" id={"laserAngleInput_" + index} value={laser.angle}
                                        onChange={event => handleLaserPropertyChange(laser, 'angle', event)} min={0} max={180} step={1} />
                                    <div className="form-text">Controls where the laser is positioned on its semi-circle.</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor={"laserRotationInput_" + index} className="form-label">Rotation: {laser.rotation}°</label>
                                    <input type="range" className="form-range" id={"laserRotationInput_" + index} value={laser.rotation}
                                        onChange={event => handleLaserPropertyChange(laser, 'rotation', event)} min={0} max={359} step={1} />
                                    <div className="form-text">Sets the direction in which the laser shoots.</div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id={"laserMovableSwitch_" + index} disabled />
                                        <label className="form-check-label" htmlFor={"laserMovableSwitch_" + index}>Fixed angle (not movable)</label>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 mb-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id={"laserRotatableSwitch_" + index} disabled />
                                        <label className="form-check-label" htmlFor={"laserRotatableSwitch_" + index}>Fixed rotation (not rotatable)</label>
                                    </div>
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
            <h2>Export</h2>

            <label htmlFor="exportOutput" className="form-label">
                The level is stored as JSON within code. Copy/paste the following text into levels folder of lazzle and import it in <em>Levels.ts</em>:
            </label>
            <div className='row'>
                <div className='col'>
                    <textarea
                        className={'form-control ' + styles.exportOutput} id="exportOutput" rows={10} readOnly={true}
                        value={JSON.stringify(level, null, 4)}>
                    </textarea>
                </div>
                <div className='col-auto'>
                    <button type="button" className="btn btn-outline-secondary" onClick={copyExportOutput}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={styles.bi} viewBox="0 0 16 16">
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"></path>
                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"></path>
                        </svg>
                    </button>
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