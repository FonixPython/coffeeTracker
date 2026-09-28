import { formatMoney, formatWeight, type Balance } from "../../Pages/Home/Home"
import "./BalanceCard.css"


interface BalanceCardProps {
    balance: Balance,
    highlighted: boolean
}

export function BalanceCard({ balance, highlighted }: BalanceCardProps) {
    return (
        <div className="balanceCard" style={highlighted ? { borderColor: "var(--secondary)", borderWidth: "3px", scale: "1.01" } : {}}>
            <p className="machineName">{balance.poolName}</p>
            <hr />
            <p className="userBalance">{formatMoney(balance.moneyBalance || 0)}</p>
            <p className="coffeeBalance">{formatWeight(balance.coffeeAmount || 0)} of beans</p>
        </div>
    )
}