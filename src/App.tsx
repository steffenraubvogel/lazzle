import React, { FunctionComponent, LazyExoticComponent, Suspense, useState } from 'react'

function App() {

  const [ChosenGame, setChosenGame] = useState<LazyExoticComponent<FunctionComponent>>()

  function loadLazzleGame() {
    setChosenGame(React.lazy(() => import('./lazzle/Lazzle')))
  }
  function loadLazzleEditor() {
    setChosenGame(React.lazy(() => import('./lazzle/LazzleEditor')))
  }

  return (
    <div>
      <main>

        {!ChosenGame &&
          <div>
            <h1>Choose the Game</h1>
            <ul>
              <li><button type="button" className="btn btn-link" onClick={loadLazzleGame}>Lazzle (Laser puzzle)</button></li>
              <li><button type="button" className="btn btn-link" onClick={loadLazzleEditor}>Lazzle Level Editor</button></li>
            </ul>
          </div>}

        {ChosenGame &&
          <Suspense fallback={<div>Loading game...</div>}>
            <ChosenGame />
          </Suspense>}
      </main>
    </div>
  );
}

export default App;
