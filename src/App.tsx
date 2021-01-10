import { BrowserRouter, Switch, Route } from "react-router-dom";
import HomePage from './HomePage';
import LazzleGame from './lazzle/Lazzle';
import LazzleLevelEditor from './lazzle/LazzleEditor';
import Legal from "./Legal";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
