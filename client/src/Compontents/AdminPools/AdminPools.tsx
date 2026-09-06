import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faTrash, faMoneyBillWave, faCoffee } from "@fortawesome/free-solid-svg-icons"
import "./AdminPools.css"

interface Transaction {
    id: string,
    userId: string,
    poolId: string,
    type: string,
    moneyAmount: number,
    coffeeAmount: number,
    coffeeVariationId: string,
    dateOfTransaction: string
}

export interface Pool {
    id: string,
    name: string,
    transactions: Transaction[],
    dateOfCreation: string
}

interface AdminPoolsProps {
    pools: Pool[]
}

interface AdminPoolCardProps {
    pool: Pool
}

interface AdminTransactionCardProps {
    transaction: Transaction
}

export function AdminPools({ pools }: AdminPoolsProps) {
    return (
        <>
            {pools.map((pool) => (
                <AdminPoolCard pool={pool} />
            ))}
        </>
    )
}

function AdminPoolCard({ pool }: AdminPoolCardProps) {
    return (
        <SectionCard key={pool.id} title={pool.name} collapseable={true} >
            <div>
                <button>Edit <FontAwesomeIcon icon={faPenToSquare} /></button>
                <button>Delete <FontAwesomeIcon icon={faTrash} /></button>
            </div>
            {pool.transactions.map((transaction) => (
                <AdminTransactionCard transaction={transaction} />
            ))}
        </SectionCard>
    )
}

function AdminTransactionCard({ transaction }: AdminTransactionCardProps) {
    let color = ""
    let text = ""
    switch (transaction.type) {
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
        <div className="historyCard" key={transaction.id}>
            <div className="left">
                <div className="iconCircle" style={{ backgroundColor: color }}>
                    <FontAwesomeIcon icon={transaction.type == "addMoney" ? faMoneyBillWave : faCoffee} />
                </div>
                <div className="textContainer">
                    <p className="actionText">{text}</p>
                    <p className="amountText">{transaction.type == "drink" ? "-" : "+"}{transaction.moneyAmount} Ft {transaction.type != "addMoney" ? `(${transaction.coffeeAmount}g)` : ""}</p>
                </div>
            </div>
            <FontAwesomeIcon icon={faPenToSquare} style={{ margin: "5px", fontSize: "1.1rem" }} />
        </div>
    )
}