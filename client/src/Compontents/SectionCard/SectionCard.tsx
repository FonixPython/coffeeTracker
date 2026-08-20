import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./SectionCard.css"

export function SectionCard({ children, collapseable, title }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="sectionCard">
            {collapseable && <div className="header">
                <p>{title}</p>
                <button onClick={() => { setOpen(curr => (!curr)) }}><FontAwesomeIcon icon={open ? "angle-up" : "angle-down"} /></button>
            </div>}
            {children}
        </div>
    )
}