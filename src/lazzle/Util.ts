// global variable for unqiue IDs on client-side, especially useful for react keys
let idCounter: number = 0;

export function nextId(): string {
    idCounter++
    return idCounter.toString()
}