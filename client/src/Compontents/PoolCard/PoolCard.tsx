import "./PoolCard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

export function PoolCard(props) {
    const [open, setOpen] = useState((props.collapseable && !props.wrap) ? false : true)

    return (
        <div className="poolCard">
            <div className="headerBar">
                <p>{props.pool.name}</p>
                <button><FontAwesomeIcon icon={faPenToSquare} /></button>
                <button onClick={() => { setOpen(curr => (!curr)) }}><FontAwesomeIcon icon={open ? faAngleUp : faAngleDown} /></button>
            </div>
            {open && <div className="content">
                {props.pool.transactions.map((transaction)=>(
                    <div className="transactionCard">
                        
                    </div>
                ))}
            </div>}
        </div>
    )
}