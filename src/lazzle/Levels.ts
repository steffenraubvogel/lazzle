import Level1 from './levels/level_simple_easypeasy.json'
import Level2 from './levels/level_simple_twoshots.json'
import Level3 from './levels/level_simple_aliasing.json'
import LevelStrengthened from './levels/level_simple_strengthened.json'
import LevelRecolor from './levels/level_simple_recolor.json'
import LevelRestricted from './levels/level_medium_restricted.json'
import Level4 from './levels/level_medium_cross.json'
import Level5 from './levels/level_medium_colored.json'

export const Colors: string[] = [
    '#dc3545', // red
    '#198754', // green
    '#0d6efd', // blue
    '#ffc107', // yellow
    '#d63384', // pink
    '#0dcaf0', // cyan
    '#adb5bd', // gray
    '#6f42c1', // purple
    '#4f3222', // brown
    '#fd7e14', // orange
    '#ace600', // yellow-green
]

export const ColorNames: string[] = [ // must match Colors
    'red',
    'green',
    'blue',
    'yellow',
    'pink',
    'cyan',
    'gray',
    'purple',
    'brown',
    'orange',
    'yellowish green',
]

export const BlockStrengthNames: string[] = [
    'destroyed', // 0
    'normal', // 1
    'strengthened', // 2
    'heavy' // 3
]

export type LevelBlock = {
    x: number // coordinate on grid
    y: number // coordinate on grid
    color: number // index, see Colors
    strength?: number // how many shots the block can resist before destroyed, defaults to 1
}

export type LevelLaser = {
    order: number // when will the laser shot (sequence number)
    angle: number // on its semi-circle in degrees (0 to 180)
    rotation: number // in degrees (0 to 360) where 0 is "rotate to left side"
    distance: number // from bottom center of blocks in pixels
    movable: boolean
    rotatable: boolean
    color?: number // if specified, the laser will not destroy but color the blocks; index, see Colors
}

export type Level = {
    name: string // fancy name of level, short description
    gridX: number // maximum number of horizontal blocks
    gridY: number // maximum number of vertical blocks
    blocks: LevelBlock[] // initial blocks
    goal: LevelBlock[] // goal to be reached to win the level
    lasers: LevelLaser[] // initial lasers
}

export const AllLevels: Level[] = [Level1, Level2, Level3, LevelStrengthened, LevelRecolor, LevelRestricted, Level5, Level4]