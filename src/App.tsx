import React, { FunctionComponent, LazyExoticComponent, Suspense, useState } from 'react'

export default function App() {

  const [ChosenGame, setChosenGame] = useState<LazyExoticComponent<FunctionComponent>>()

  function loadLazzleGame() {
    setChosenGame(React.lazy(() => import('./lazzle/Lazzle')))
  }
  function loadLazzleEditor() {
    setChosenGame(React.lazy(() => import('./lazzle/LazzleEditor')))
  }

  return <>
    {!ChosenGame &&
      <div className='container'>
        <h1 className='display-1'>Welcome to Lazzle!</h1>
        <div className="row">
          <div className='col-12 col-md-5 col-lg-4 mb-3'>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Play the Game</h5>
                <p className="card-text">Click to play the game level by level.</p>
                <button type="button" className="btn btn-primary stretched-link" onClick={loadLazzleGame}>Play</button>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-5 col-lg-4'>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Game Level Editor</h5>
                <p className="card-text">Create your own Lazzle levels by starting from scratch or loading existing levels.</p>
                <button type="button" className="btn btn-primary stretched-link" onClick={loadLazzleEditor}>Open Editor</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    {ChosenGame &&
      <Suspense fallback={<div>Loading game...</div>}>
        <ChosenGame />
      </Suspense>
    }
  </>
}
