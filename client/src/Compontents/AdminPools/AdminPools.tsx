import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faTrash, faMoneyBillWave, faCoffee, faQrcode } from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"
import "./AdminPools.css"
import type { User } from "../AdminUsers/AdminUsers"
import { EditTransactionModal } from "../EditTransactionModal/EditTransactionModal"
import type { Balance, Variation } from "../../Pages/Home/Home"
import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

export interface Transaction {
    id: string,
    userId: string,
    poolId: string,
    type: string,
    moneyAmount: number,
    coffeeAmount: number,
    coffeeVariationId: string,
    dateOfTransaction: string,
    user?: User,
    pool?: Pool,
    edit: boolean
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
    reload: Function,
    variations: Variation[]
}

interface AdminPoolCardProps {
    pool: Pool,
    setModalOpened: Function,
    setModal: Function,
    reload: Function,
    variations: Variation[]
}

interface AdminTransactionCardProps {
    transaction: Transaction,
    setModalOpened: Function,
    setModal: Function,
    reload: Function,
    pool: boolean,
    variations: Variation[]
}

export function AdminPools({ pools, setModalOpened, setModal, reload, variations }: AdminPoolsProps) {
    return (
        <>
            {pools.map((pool) => (
                <AdminPoolCard pool={pool} setModal={setModal} setModalOpened={setModalOpened} reload={reload} variations={variations} />
            ))}
        </>
    )
}

function AdminPoolCard({ pool, setModal, setModalOpened, reload, variations }: AdminPoolCardProps) {

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
    }

    async function editPoolAction(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const name = data.get("name")
        const result = await fetch("/api/editPool/" + pool.id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            reload()
        } else {
            const jsonResult = await result.json()
            toast.error(jsonResult.message)
        }
    }

    function editPoolModal() {
        setModal({
            title: "Edit pool name",
            elements:
                <form action="" onSubmit={editPoolAction}>
                    <input type="text" defaultValue={pool.name} name="name" />
                    <input type="submit" value="Change" />
                    <input type="button" className="dangerButton" value="Cancel" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }} />
                </form>
        })
        setModalOpened(true)
    }

    function QrCode({ text }: { text: string }) {
        const canvasRef = useRef<HTMLCanvasElement | null>(null)

        useEffect(() => {
            if (!canvasRef.current) return
            QRCode.toCanvas(canvasRef.current, text, {
                width: 256,
                margin: 2,
                errorCorrectionLevel: "H",
                color: { dark: "#000000", light: "#FFFFFF" },
            })
        }, [text])

        return (
            <div>
                <canvas ref={canvasRef}></canvas>
            </div>
        )
    }

    async function showQr() {
        const url = `${window.location.origin}/?pool=${pool.id}`
        async function downloadQr() {
            const dataUrl = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "H" })
            const a = document.createElement("a")
            a.href = dataUrl
            a.download = `${pool.name}_QR.png`
            a.click()

        }
        setModal({
            title: "QR",
            elements:
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "5px", margin: "30px" }}>
                        <QrCode text={url} />
                    </div>
                    <button className="actionButton" onClick={downloadQr}>Download</button>
                </div>
        })
        setModalOpened(true)
    }

    return (
        <SectionCard key={pool.id} title={pool.name} collapseable={true} headerChildren={<>
            <button className="actionButton" onClick={showQr}>Show QR <FontAwesomeIcon icon={faQrcode} /></button>
            <button className="actionButton" onClick={editPoolModal}>Edit <FontAwesomeIcon icon={faPenToSquare} /></button>
            <button className="actionButton dangerButton" onClick={deletePoolModal}>Delete <FontAwesomeIcon icon={faTrash} /></button>
        </>}>
            <hr />
            {pool.transactions.length > 0 ? pool.transactions.map((transaction) => (
                <AdminTransactionCard transaction={transaction} setModal={setModal} setModalOpened={setModalOpened} reload={reload} pool variations={variations} />
            )) : <p style={{ textAlign: "center", fontWeight: 200, color: "var(--text-muted)", margin: "15px" }}>No transactions yet!</p>}
        </SectionCard>
    )
}

export function AdminTransactionCard({ transaction, setModal, setModalOpened, reload, pool, variations }: AdminTransactionCardProps) {
    const [balances, setBalances] = useState<Balance[]>([])
    async function loadBalances() {
        const balancesResponse = await fetch("/api/getBalancesForUser/" + transaction.user)
        const balancesResponseJson = await balancesResponse.json()
        if (balancesResponse.ok) {
            setBalances(balancesResponseJson.result)
        } else {
            toast.error(balancesResponseJson.message)
        }
    }
    loadBalances()
    let color = ""
    let text = ""
    switch (transaction.type) {
        case ("drink"):
            color = "var(--info)"
            text = "drank coffee"
            break
        case ("addCoffee"):
            color = "var(--warning)"
            text = "Drank"
            text = "added coffee"
            break
        case ("addMoney"):
            color = "var(--success)"
            text = "added money"
            break
        case ("useMoney"):
            color = "var(--danger)"
            text = "used money"
            break
        default:
            color = "var(--bg-dark)"
            text = "unknown"
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
                loadUserData={reload}
                getPoolTransactions={() => { }}
            />
        })
        setModalOpened(true)
    }

    async function deleteTransactionAction() {
        const result = await fetch("/api/deleteTransaction/" + transaction.id, { method: "DELETE" })
        if (result.ok) {
            reload()
            setModalOpened(false)
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
        <div className="historyCard" key={transaction.id}>
            <div className="left">
                <div className="iconCircle" style={{ backgroundColor: color }}>
                    <FontAwesomeIcon icon={transaction.type == "addMoney" ? faMoneyBillWave : faCoffee} />
                </div>
                <div className="textContainer">
                    <p className="actionText">{pool ? `${transaction.user?.username} ` : ""}{text}{!pool ? ` in ${transaction.pool?.name}` : ""}</p>
                    <p className="amountText">{transaction.moneyAmount} Ft {transaction.type != "addMoney" ? `(${transaction.coffeeAmount}g)` : ""}</p>
                </div>
            </div>
            <div>
                <button className="actionButton" onClick={editTransaction}>
                    <FontAwesomeIcon icon={faPenToSquare} style={{ margin: "5px", fontSize: "1.1rem" }} />
                </button>
                <button className="actionButton dangerButton" onClick={deleteTransactionModal}>
                    <FontAwesomeIcon icon={faTrash} style={{ margin: "5px", fontSize: "1.1rem" }} />
                </button>
            </div>
        </div>
    )
}