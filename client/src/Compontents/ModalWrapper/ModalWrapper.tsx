import { useState } from "react"
import "./ModalWrapper.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

interface ModalWrapperProps extends React.PropsWithChildren {
    title: string,
    isopen: boolean,
    setOpen: Function
}

export function ModalWrapper({ title, isopen, setOpen, children }: ModalWrapperProps) {
    if (isopen) {
        return (
            <div className="screenCover" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setOpen(false)
                }
            }}>
                <div className="modalWrapper" onClick={() => { }}>
                    <div className="titleBar">
                        <p>{title || ""}</p>
                        <button className="closeButton" onClick={() => { setOpen(false) }}><FontAwesomeIcon icon={faXmark} /></button>
                    </div>
                    <hr />
                    <div className="contentWrapper">
                        {children}
                    </div>
                </div>
            </div>
        )
    } else {
        return null
    }
}