import { i18n } from "i18next";
import { useEffect } from "react";

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

// register shortcuts properly
export function useShortcuts(keyToActionMap: { [key: string]: (event: KeyboardEvent) => void }) {
    useEffect(() => {
        const eventListener: (event: KeyboardEvent) => void = (event) => {
            if ((event.target as Element).matches("input,textarea")) {
                // when an input element is focused, do not trigger shortcuts
                return;
            }
            if (keyToActionMap[event.key]) {
                keyToActionMap[event.key](event)
                event.preventDefault() // prevents browser features like quick search
            }
        }
        document.addEventListener("keydown", eventListener);
        return () => document.removeEventListener("keydown", eventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}