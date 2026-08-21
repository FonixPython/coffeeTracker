import "./BalanceCard.css"

export function BalanceCard(props) {
    return (
        <div className="balanceCard">
            <p className="machineName">{props.balance.name}</p>
            <hr />
            <p className="userBalance">{props.balance.user} Ft</p>
            <p className="coffeeBalance">{props.balance.coffee}g of beans</p>
        </div>
    )
}