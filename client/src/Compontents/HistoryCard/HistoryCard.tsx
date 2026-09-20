import "./HistoryCard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoffee, faMoneyBillWave, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"
import type { Transaction } from "../AdminPools/AdminPools"
import type { Balance, Variation } from "../../Pages/Home/Home"
import { EditTransactionModal } from "../EditTransactionModal/EditTransactionModal"
import { toast } from "sonner"

interface HistoryCardProps {
    balances: Balance[],
    variations: Variation[],
    transaction: Transaction,
    setModal: Function,
    setModalOpened: Function,
    loadUserData: Function,
    getPoolTransactions: Function
}

export function HistoryCard({ transaction, setModal, setModalOpened, loadUserData, getPoolTransactions, balances, variations }: HistoryCardProps) {
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
        case ("useMoney"):
            color = "var(--danger)"
            text = "Used Money"
            break
        default:
            color = "var(--bg-dark)"
            text = "Unknown"
            break
    }

    async function editTransaction() {
        setModal({
            title: "Edit transaction",
            elements: <EditTransactionModal
                transaction={transaction}
                balances={balances}
                variations={variations}
                setModal={setModal}
                setModalOpened={setModalOpened}
                loadUserData={loadUserData}
                getPoolTransactions={getPoolTransactions}
            />
        })
        setModalOpened(true)
    }

    async function deleteTransactionAction() {
        const result = await fetch("/api/deleteTransaction/" + transaction.id, { method: "DELETE" })
        if (result.ok) {
            loadUserData()
            setModalOpened(false)
            getPoolTransactions()
            toast.success("Successfully deleted transaction!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function deleteTransactionModal() {
        setModal({
            title: "Delete transaction",
            elements:
                <div>
                    <button className="dangerButton" onClick={deleteTransactionAction}>Delete</button>
                    <button className="" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Cancel</button>
                </div>
        })
        setModalOpened(true)
    }
    return (
        <div className="historyCard">
            <div className="left">
                <div className="iconCircle" style={{ backgroundColor: color }}>
                    <FontAwesomeIcon icon={transaction.type == "addMoney" ? faMoneyBillWave : faCoffee} />
                </div>
                <div className="textContainer">
                    <p className="actionText">{text}</p>
                    <p className="amountText">{transaction.moneyAmount} Ft {transaction.type != "addMoney" ? `(${transaction.coffeeAmount}g)` : ""}</p>
                </div>
            </div>
            {transaction.edit && <div>
                <button onClick={() => { editTransaction() }}><FontAwesomeIcon icon={faEdit} style={{ margin: "5px", fontSize: "1.1rem" }} /></button>
                <button onClick={() => { deleteTransactionModal() }} className="dangerButton"><FontAwesomeIcon icon={faTrash} style={{ margin: "5px", fontSize: "1.1rem" }} /></button>
            </div>}
        </div>
    )
}