import { useState } from "react"
import "./ModalWrapper.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

export function ModalWrapper(props) {
    if (props.isopen) {
        return (
            <div className="screenCover" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    props.setOpen(false)
                }
            }}>
                <div className="modalWrapper" onClick={() => { }}>
                    <div className="titleBar">
                        <p>{props.title || ""}</p>
                        <button onClick={() => { props.setOpen(false) }}><FontAwesomeIcon icon={faXmark} /></button>
                    </div>
                    <hr />
                    <div className="contentWrapper">
                        {props.children}
                    </div>
                </div>
            </div>
        )
    } else {
        return null
    }
}