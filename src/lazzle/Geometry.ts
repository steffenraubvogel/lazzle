import { BLOCK_SIZE } from "./Constants";

export type Point = {
    x: number
    y: number
}

export function cross(v: Point, w: Point) {
    return v.x * w.y - v.y * w.x
}

export function dot(v: Point, w: Point) {
    return v.x * w.x + v.y * w.y
}

export function rayIntersectsLine(p: Point, r: Point, q: Point, s: Point): boolean {
    // https://stackoverflow.com/a/565282/1063673
    const rs_cross = cross(r, s);
    const a = cross({ x: q.x - p.x, y: q.y - p.y }, s);
    const b = cross({ x: q.x - p.x, y: q.y - p.y }, r);

    if (rs_cross === 0 && b === 0) {
        // collinear, check overlapping
        const t0 = dot({ x: q.x - p.x, y: q.y - p.y }, r) / dot(r, r);
        return t0 >= 0;
    }
    else if (rs_cross === 0 && b !== 0) {
        // parallel, non-intersection
        return false;
    }
    else {
        // lines intersecting, check segments intersecting
        const t = a / rs_cross;
        const u = b / rs_cross;

        return t >= 0 && u >= 0 && u <= 1;
    }
}

export function rayIntersectsBlock(p: Point, r: Point, block: Point) {
    return rayIntersectsLine(p, r, { x: block.x, y: block.y }, { x: BLOCK_SIZE, y: 0 }) ||
        rayIntersectsLine(p, r, { x: block.x, y: block.y }, { x: 0, y: BLOCK_SIZE }) ||
        rayIntersectsLine(p, r, { x: block.x + BLOCK_SIZE, y: block.y }, { x: 0, y: BLOCK_SIZE }) ||
        rayIntersectsLine(p, r, { x: block.x, y: block.y + BLOCK_SIZE }, { x: BLOCK_SIZE, y: 0 })
}