import "./HistoryCard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoffee, faMoneyBillWave, faEdit } from "@fortawesome/free-solid-svg-icons"

export function HistoryCard(props) {
    let color = ""
    let text = ""
    switch (props.transaction.type) {
        case ("drink"):
            color = "var(--info)"
            text = "Drank"
            break
        case ("addCoffee"):
            color = "var(--warning)"
            text = "Drank"
            text = "Added Coffee"
            break
        case ("addMoney"):
            color = "var(--success)"
            text = "Added Money"
            break
        default:
            color = "var(--bg-dark)"
            text = "Unknown"
            break
    }

    return (
        <div className="historyCard">
            <div className="left">
                <div className="iconCircle" style={{ backgroundColor: color }}>
                    <FontAwesomeIcon icon={props.transaction.type == "addMoney" ? faMoneyBillWave : faCoffee} />
                </div>
                <div className="textContainer">
                    <p className="actionText">{text}</p>
                    <p className="amountText">{props.transaction.type == "drink" ? "-" : "+"}{props.transaction.moneyAmount} Ft {props.transaction.type != "addMoney" ? `(${props.transaction.coffeeAmount}g)` : ""}</p>
                </div>
            </div>
            <FontAwesomeIcon icon={faEdit} style={{ margin: "5px", fontSize: "1.1rem" }} />
        </div>
    )
}