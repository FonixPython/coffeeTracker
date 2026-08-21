import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons"
import "./SectionCard.css"

export function SectionCard(props) {
    const [open, setOpen] = useState((props.collapseable && !props.wrap) ? false : true)
    return (
        <div className="sectionCard" style={{ flex: props.wrap ? 1 : "" }}>
            {(props.collapseable && !props.wrap) && <div className="header">
                <p>{props.title}</p>
                <button onClick={() => { setOpen(curr => (!curr)) }}><FontAwesomeIcon icon={open ? faAngleUp : faAngleDown} /></button>
            </div>}
            <div className={"content " + props.className}>
                {(open || props.currWidth >= 800) && props.children}
            </div>
        </div>
    )
}