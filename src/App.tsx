import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import HomePage from './HomePage';
import LazzleGame from './lazzle/Lazzle';
import LazzleLevelEditor from './lazzle/LazzleEditor';
import Legal from "./Legal";

import i18n from "i18next";
import { initReactI18next, Trans, useTranslation } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import translationsEn from "./i18n/en.json"
import translationsDe from "./i18n/de.json"
import { Fragment } from "react";

i18n
  .use(LanguageDetector) // detect user language, see https://github.com/i18next/i18next-browser-languageDetector
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: translationsEn },
      de: { translation: translationsDe }
    },
    supportedLngs: ["en", "de"],
    fallbackLng: "en",
    debug: false,

    interpolation: {
      escapeValue: false
    }
  });

export default function App() {

  const { t, i18n } = useTranslation()

  return (
    <BrowserRouter>
      <main className="flex-shrink-0 mb-5">
        <Switch>
          <Route path="/game">
            <LazzleGame />
          </Route>
          <Route path="/editor">
            <LazzleLevelEditor />
          </Route>
          <Route path="/legal">
            <Legal />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </main>
      <footer className="footer mt-auto py-5 bg-light">
        <div className="container">
          <div className="row text-muted">
            <div className="col-12 col-md">{t('footer.copyright')}</div>
            <div className="col-6 col-md">
              <Link className="link-secondary" to="/">{t('footer.nav.home')}</Link><br />
              <a className="link-secondary" href="https://github.com/steffenraubvogel/lazzle-issues/issues/new/choose" target="_blank" rel="noreferrer">{t('footer.nav.contribute')}</a><br/>
              <Link className="link-secondary" to="/legal">{t('footer.nav.legal')}</Link>
            </div>
            <div className="col-6 col-md">
              {(i18n.options.supportedLngs as string[]).filter(lng => lng !== 'cimode').map(lng => {
                if (i18n.language === lng) {
                  return <Fragment key={lng}><span>{t('language.' + lng)}</span><br /></Fragment>
                }
                else {
                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                  return <Fragment key={lng}><a href='' className="link-secondary" onClick={event => { i18n.changeLanguage(lng); event.preventDefault(); return false }}>{t('language.' + lng)}</a>
                    <br /></Fragment>
                }
              })}
            </div>
            <div className="col-6 col-md"><Trans i18nKey="footer.credits"><a className="link-secondary" href="https://falconiform.de">f</a></Trans></div>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  )
}
