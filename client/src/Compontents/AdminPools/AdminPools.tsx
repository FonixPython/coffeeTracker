import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faTrash, faMoneyBillWave, faCoffee, faQrcode, faGlobe } from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"
import "./AdminPools.css"
import type { User } from "../AdminUsers/AdminUsers"
import { EditTransactionModal } from "../EditTransactionModal/EditTransactionModal"
import type { Variation } from "../../Pages/Home/Home"
import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { AddTransactionModal } from "../AddTransactionModal/AddTransactionModal"

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
                <AdminPoolCard pool={pool} key={pool.id} setModal={setModal} setModalOpened={setModalOpened} reload={reload} variations={variations} />
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
            toast.success("Medence sikeresen törlésre került!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    function deletePoolModal() {
        setModal({
            title: "Medence törlésének megerősítése",
            elements:
                <div>
                    <button className="actionButton dangerButton" onClick={deletePoolAction}>Törlés</button>
                    <button className="actionButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Mégse</button>
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
            title: "Medence nevének szerkesztése",
            elements:
                <form action="" onSubmit={editPoolAction}>
                    <input type="text" defaultValue={pool.name} name="name" />
                    <input type="submit" value="Mentés" />
                    <input type="button" className="dangerButton" value="Mégse" onClick={() => {
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
        const url = `${window.location.origin}/#/?pool=${pool.id}`
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
                    <button className="actionButton" onClick={downloadQr}>Letöltés</button>
                </div>
        })
        setModalOpened(true)
    }

    async function globalTransactionModal() {
        setModal({
            title: "Globális tranzakció hozzáadása",
            elements: <AddTransactionModal type="globalTransaction" setModal={setModal} setModalOpened={setModalOpened} pool={pool.id} setPool={() => { }} variations={[]} balances={[]} setSearchParams={() => { }} loadUserData={reload} getPoolTransactions={() => { }} />
        })
        setModalOpened(true)
    }

    return (
        <SectionCard key={pool.id} title={pool.name} collapseable={true} headerChildren={<>
            <button className="actionButton" onClick={globalTransactionModal}>Globális Tranzakció<FontAwesomeIcon icon={faGlobe} /></button>
            <button className="actionButton" onClick={showQr}>QR megjelenítése<FontAwesomeIcon icon={faQrcode} /></button>
            <button className="actionButton" onClick={editPoolModal}>Szerkesztés <FontAwesomeIcon icon={faPenToSquare} /></button>
            <button className="actionButton dangerButton" onClick={deletePoolModal}>Törlés <FontAwesomeIcon icon={faTrash} /></button>
        </>}>
            <hr />
            {pool.transactions.length > 0 ? pool.transactions.map((transaction) => (
                <AdminTransactionCard key={transaction.id} transaction={transaction} setModal={setModal} setModalOpened={setModalOpened} reload={reload} pool variations={variations} />
            )) : <p style={{ textAlign: "center", fontWeight: 200, color: "var(--text-muted)", margin: "15px" }}>Még nincsenek tranzakciók!</p>}
        </SectionCard>
    )
}

export function AdminTransactionCard({ transaction, setModal, setModalOpened, reload, pool, variations }: AdminTransactionCardProps) {

    let color = ""
    let text = ""
    switch (transaction.type) {
        case ("drink"):
            color = "var(--info)"
            text = "kávét ivott"
            break
        case ("addCoffee"):
            color = "var(--warning)"
            text = "kávét adott hozzá"
            break
        case ("addMoney"):
            color = "var(--success)"
            text = "pénzt adott hozzá"
            break
        case ("useMoney"):
            color = "var(--danger)"
            text = "pénzt használt fel"
            break
        case ("globalTransaction"):
            color = "var(--bg-dark)"
            text = "globális tranzakciót hajtott végre"
            break
        default:
            color = "var(--bg-dark)"
            text = "ismeretlen akciót hajtott végre"
            break
    }

    async function editTransaction() {
        const balancesResponse = await fetch("/api/getBalancesForUser/" + transaction.user?.id)
        const balancesResponseJson = await balancesResponse.json()
        if (balancesResponse.ok) {
            setModal({
                title: "Tranzakció szerkesztése",
                elements: <EditTransactionModal
                    transaction={transaction}
                    balances={balancesResponseJson.result}
                    variations={variations}
                    setModal={setModal}
                    setModalOpened={setModalOpened}
                    loadUserData={reload}
                    getPoolTransactions={() => { }}
                />
            })
            setModalOpened(true)
        } else {
            toast.error(balancesResponseJson.message)
        }
    }

    async function deleteTransactionAction() {
        const result = await fetch("/api/deleteTransaction/" + transaction.id, { method: "DELETE" })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success("Tranzakció sikeresen törlésre került!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function deleteTransactionModal() {
        setModal({
            title: "Tranzakció törlése",
            elements:
                <div>
                    <button className="dangerButton" onClick={deleteTransactionAction}>Törlés</button>
                    <button className="" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Mégse</button>
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
                    <p className="actionText">{pool ? `${transaction.user?.username == undefined ? "Törölt felhasználó" : transaction.user?.username} ` : ""}{text}{!pool ? ` in ${transaction.pool?.name}` : ""}</p>
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