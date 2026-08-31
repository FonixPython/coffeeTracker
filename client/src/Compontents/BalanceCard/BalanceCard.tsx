import "./BalanceCard.css"

export function BalanceCard(props) {
    return (
        <div className="balanceCard">
            <p className="machineName">{props.balance.poolName}</p>
            <hr />
            <p className="userBalance">{props.balance.moneyBalance} Ft</p>
            <p className="coffeeBalance">{props.balance.coffeeAmount}g of beans</p>
        </div>
    )
}