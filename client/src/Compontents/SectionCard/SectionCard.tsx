import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons"
import "./SectionCard.css"


interface SectionCardProps extends React.PropsWithChildren {
    title?: String,
    collapseable?: Boolean,
    wrap?: Boolean,
    headerChildren?: React.ReactNode,
    titleChildren?: React.ReactNode,
    currWidth?: number,
    className?: String
}

export function SectionCard({ title, collapseable, wrap, children, headerChildren, titleChildren, currWidth, className }: SectionCardProps) {
    const [open, setOpen] = useState((collapseable && !wrap) ? false : true)
    return (
        <div className="sectionCard" style={{ flex: wrap ? 1 : "" }}>
            {(collapseable && !wrap) && <div className="header">
                <div style={{ display: "flex", alignItems: "center" }}>
                    {titleChildren}
                    <p>{title}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "right", alignItems: "center" }}>
                    {headerChildren}
                    <button className="collapseButton" onClick={() => { setOpen(curr => (!curr)) }}><FontAwesomeIcon icon={open ? faAngleUp : faAngleDown} /></button>
                </div>
            </div>}
            <div className={"content " + className}>
                {(open || (currWidth ? currWidth : 0) >= 800) && children}
            </div>
        </div>
    )
}