import { MouseEvent, ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Modal.module.scss";

export default function Modal(props: { title?: string, fullScreen?: boolean, children: ReactNode, close: () => void }) {

    const { t } = useTranslation()

    useEffect(() => {
        // add a class to body such that scroll bar of body doesn't appear
        const body = document.querySelector("body")!
        body.classList.add('modal-open')
        return () => {
            body.classList.remove('modal-open')
        }
    }, [])

    function backdropClicked(event: MouseEvent<HTMLDivElement>) {
        if ((event.target as Element).classList?.contains("modal")) {
            // here we made sure click is directly on backdrop (not propagated)
            props.close()
        }
    }

    return <>
        <div className={"modal-backdrop show " + styles.modalBackDrop}></div>
        <div className={"modal show d-block " + styles.modal} onClick={backdropClicked}>
            <div className={"modal-dialog modal-dialog-centered modal-dialog-scrollable " + (props.fullScreen ? 'modal-fullscreen ' : '') + styles.modalDialog}>
                <div className="modal-content shadow">
                    {props.title &&
                        <div className="modal-header">
                            <h5 className="modal-title h4">{props.title}</h5>
                            <button type="button" className="btn-close" onClick={props.close}></button>
                        </div>}
                    <div className="modal-body">
                        {props.children}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={props.close}>{t('modal.close')}</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}