import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import HomePage from './HomePage';
import LazzleGame from './lazzle/Lazzle';
import LazzleLevelEditor from './lazzle/LazzleEditor';
import Legal from "./Legal";

export default function App() {
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
            <div className="col-12 col-md">© Steffen Harbich</div>
            <div className="col-6 col-md">
              <Link className="link-secondary" to="/">Home</Link><br />
              <Link className="link-secondary" to="/legal">Impressum &amp; Datenschutzerklärung</Link>
            </div>
            <div className="col-6 col-md">Hosting credits to <a className="link-secondary" href="https://falconiform.de">falconiform</a></div>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  )
}
