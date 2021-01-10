import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className='container'>
            <h1 className='display-1'>Welcome to Lazzle!</h1>
            <div className="row my-5">
                <div className='col-12 col-md-5 col-lg-4 mb-3'>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Play the Game</h5>
                            <p className="card-text">Click to play the game level by level.</p>
                            <Link className="btn btn-primary stretched-link" to="/game">Play</Link>
                        </div>
                    </div>
                </div>
                <div className='col-12 col-md-5 col-lg-4'>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Game Level Editor</h5>
                            <p className="card-text">Create your own Lazzle levels by starting from scratch or loading existing levels.</p>
                            <Link className="btn btn-primary stretched-link" to="/editor">Open Editor</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}