import { i18n } from "i18next";

// global variable for unqiue IDs on client-side, especially useful for react keys
let idCounter: number = 0;

export function nextId(): string {
    idCounter++
    return idCounter.toString()
}

// like a normal string but mapped to languages
export type TranslatedString = {
    [lng: string]: string
}

export function getTranslation(texts: TranslatedString, i18n: i18n) {
    if (texts[i18n.language] !== undefined) {
        return texts[i18n.language]
    }
    return texts[i18n.options.fallbackLng as string]
}