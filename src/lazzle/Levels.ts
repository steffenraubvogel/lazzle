import Level1 from './levels/level_simple_easypeasy.json'
import Level2 from './levels/level_simple_twoshots.json'
import Level3 from './levels/level_simple_aliasing.json'
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

export type LevelBlock = {
    x: number
    y: number
    color: number
}

export type LevelLaser = {
    order: number
    angle: number
    rotation: number
    distance: number
    movable: boolean
    rotatable: boolean
}

export type Level = {
    name: string
    gridX: number
    gridY: number
    blocks: LevelBlock[]
    goal: LevelBlock[]
    lasers: LevelLaser[]
}

export const AllLevels: Level[] = [Level1, Level2, Level3, LevelRestricted, Level5, Level4]