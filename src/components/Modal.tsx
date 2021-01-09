import { ReactNode, useEffect } from "react";

export default function Modal(props: { title: string, fullScreen: boolean, children: ReactNode, close: () => void}) {

    useEffect(() => {
        // add a class to body such that scroll bar of body doesn't appear
        const body = document.querySelector("body")!
        body.classList.add('modal-open')
        return () => {
            body.classList.remove('modal-open')
        }
    }, [])

    return <div className="modal d-block">
        <div className={"modal-dialog" + (props.fullScreen ? ' modal-fullscreen' : '')}>
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title h4">{props.title}</h5>
                    <button type="button" className="btn-close" onClick={props.close}></button>
                </div>
                <div className="modal-body">
                    {props.children}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={props.close}>Close</button>
                </div>
            </div>
        </div>
    </div>
}