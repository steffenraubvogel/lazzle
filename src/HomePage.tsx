import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function HomePage() {

    const { t } = useTranslation()

    return (
        <div className='container'>
            <h1 className='display-1'>{t('homepage.welcome')}</h1>
            <div className="row my-5 cardRow">
                <div className='col-12 col-md-5 col-lg-4 mb-3'>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">{t('homepage.play')}</h5>
                            <p className="card-text">{t('homepage.play_description')}</p>
                            <div className='cardActions'>
                                <Link className="btn btn-primary stretched-link" to="/game">{t('homepage.play_action')}</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-12 col-md-5 col-lg-4 mb-3'>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">{t('homepage.editor')}</h5>
                            <p className="card-text">{t('homepage.editor_description')}</p>
                            <div className='cardActions'>
                                <Link className="btn btn-primary stretched-link" to="/editor">{t('homepage.editor_action')}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}