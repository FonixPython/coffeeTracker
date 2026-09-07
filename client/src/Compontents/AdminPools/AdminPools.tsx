import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faTrash, faMoneyBillWave, faCoffee } from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"
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
    pools: Pool[],
    setModalOpened: Function,
    setModal: Function,
    reload: Function
}

interface AdminPoolCardProps {
    pool: Pool,
    setModalOpened: Function,
    setModal: Function,
    reload: Function
}

interface AdminTransactionCardProps {
    transaction: Transaction,
    setModalOpened: Function,
    setModal: Function,
    reload: Function
}

export function AdminPools({ pools, setModalOpened, setModal, reload }: AdminPoolsProps) {
    return (
        <>
            {pools.map((pool) => (
                <AdminPoolCard pool={pool} setModal={setModal} setModalOpened={setModalOpened} reload={reload} />
            ))}
        </>
    )
}

function AdminPoolCard({ pool, setModal, setModalOpened, reload }: AdminPoolCardProps) {

    async function deletePoolAction() {
        const result = await fetch("/api/deletePool/" + pool.id, { method: "DELETE" })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success("Successfully deleted pool!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    function deletePoolModal() {
        setModal({
            title: "Confirm pool deletion",
            elements:
                <div>
                    <button className="actionButton dangerButton" onClick={deletePoolAction}>Delete</button>
                    <button className="actionButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Cancel</button>
                </div>
        })
        setModalOpened(true)
        console.log("a")
    }

    return (
        <SectionCard key={pool.id} title={pool.name} collapseable={true} headerChildren={<>
            <button className="actionButton">Edit <FontAwesomeIcon icon={faPenToSquare} /></button>
            <button className="actionButton dangerButton" onClick={deletePoolModal}>Delete <FontAwesomeIcon icon={faTrash} /></button>
        </>}>
            <hr />
            {pool.transactions.length > 0 ? pool.transactions.map((transaction) => (
                <AdminTransactionCard transaction={transaction} setModal={setModal} setModalOpened={setModalOpened} reload={reload} />
            )) : <p style={{ textAlign: "center", fontWeight: 200, color: "var(--text-muted)", margin: "15px" }}>No transactions yet!</p>}
        </SectionCard>
    )
}

function AdminTransactionCard({ transaction, setModal, setModalOpened, reload }: AdminTransactionCardProps) {
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