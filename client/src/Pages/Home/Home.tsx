import "./Home.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Toaster, toast } from "sonner"
import { faCoffee, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { HistoryCard } from "../../Compontents/HistoryCard/HistoryCard"
import { BalanceCard } from "../../Compontents/BalanceCard/BalanceCard"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { TopBar } from "../../Compontents/TopBar/TopBar"
import type { User } from "../../Compontents/AdminUsers/AdminUsers"
import { ModalWrapper } from "../../Compontents/ModalWrapper/ModalWrapper"
import type { Transaction } from "../../Compontents/AdminPools/AdminPools"
import { AddTransactionModal } from "../../Compontents/AddTransactionModal/AddTransactionModal"

export const formatWeight = (w: number) => {
    return (w > 1000) ? `${(w / 1000).toFixed(2)} kg` : `${w} g`
}

export const formatMoney = (m: number) => {
    return `${m.toLocaleString("en-US").replace(/,/g, " ")} Ft`
}

export interface Balance {
    poolId: string,
    poolName: string,
    coffeeAmount: number | null,
    moneyBalance: number | null
}

export interface Variation {
    id: string,
    coffeeAmount: number
}

export function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [currWidth, setCurrWidth] = useState(window.innerWidth)
    const handleResize = () => {
        setCurrWidth(window.innerWidth)
    }

    const [modalOpened, setModalOpened] = useState<boolean>(false)
    const [modal, setModal] = useState({
        title: "",
        elements: <></>
    })

    useEffect(() => {
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    })

    const [user, setUser] = useState<User | null>(null)
    const [balances, setBalances] = useState<Balance[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [variations, setVariations] = useState<Variation[]>([])
    const [pool, setPool] = useState<string | null>(searchParams.get("pool") || null)

    async function loadUserData() {
        try {
            const user = await fetch("/api/verify")
            const userJson = await user.json()
            setUser(userJson.user)
            const balancesResult = await fetch("/api/getBalances")
            if (balancesResult.ok) {
                const balancesJsonResult = await balancesResult.json()
                setBalances(balancesJsonResult.result)
            } else {
                throw Error("Error fetching balances!")
            }


            const variationsResult = await fetch("/api/getVariations")
            if (variationsResult.ok) {
                const variationsJsonResult = await variationsResult.json()
                setVariations(variationsJsonResult.result)
            } else {
                throw Error("Error fetching variations!")
            }
        } catch (e) {
            console.log(e)
            toast.error("Something went wrong when loading user data! Try reloading the page!")
        }
    }

    async function getPoolTransactions() {
        try {
            if (pool) {
                const transactionsResult = await fetch("/api/getTransactions/" + pool)
                if (transactionsResult.ok) {
                    const transactionsJsonResult = await transactionsResult.json()
                    setTransactions(transactionsJsonResult.result)
                } else {
                    throw Error("Error fetching transactions!")
                }
            } else {
                setTransactions([])
            }

        } catch (e) {
            console.log(e)
            toast.error("Something went wrong when loading transactions for selected pool! Try reloading the page!")
        }
    }

    useEffect(() => {
        loadUserData()
    }, [])

    useEffect(() => {
        if (searchParams.get("pool") != null) {
            console.log(searchParams.get("pool"))
            setPool(searchParams.get("pool"))
        } else if (balances.length != 0) {
            setSearchParams({ pool: balances[0].poolId })
            setPool(balances[0].poolId)
        } else {
            setPool(null)
        }
    }, [balances])

    useEffect(() => {
        getPoolTransactions()
    }, [pool])

    async function handleActionButton(e: React.MouseEvent<HTMLButtonElement>) {
        if (pool != null) {
            const buttonName = e.currentTarget.name
            let title = ""
            switch (buttonName) {
                case "addCoffee":
                    title = "Add coffee to pool"
                    break
                case "addMoney":
                    title = "Add money to pool"
                    break
                case "drink":
                    title = "Drink from pool"
                    break
                default:
                    return null
            }
            setModal({
                title,
                elements: <AddTransactionModal
                    type={buttonName}
                    pool={pool}
                    balances={balances}
                    variations={variations}
                    setModal={setModal}
                    setModalOpened={setModalOpened}
                    setPool={setPool}
                    setSearchParams={setSearchParams}
                    loadUserData={loadUserData}
                    getPoolTransactions={getPoolTransactions}
                />
            })
            setModalOpened(true)
        }
    }

    const selectedBalance = balances.find(
        balance => balance.poolId === pool
    )

    return (
        <>
            <Toaster theme="system" />
            <TopBar user={user} setModalOpened={setModalOpened} setModal={setModal} reload={loadUserData} />
            <ModalWrapper isopen={modalOpened} setOpen={setModalOpened} title={modal.title}>
                {modal.elements}
            </ModalWrapper>
            <main className="homePage">
                <SectionCard>
                    <div style={{ margin: 10 }} className="topCard">
                        <select value={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                        <p className="userBalance">{formatMoney(selectedBalance?.moneyBalance || 0)}</p>
                        <p className="coffeeBalance">{formatWeight(selectedBalance?.coffeeAmount || 0)}</p>
                    </div>
                </SectionCard>
                <SectionCard className="actionContainer">
                    <button className="drinkAction" name="drink" onClick={handleActionButton}>
                        <FontAwesomeIcon icon={faCoffee} />
                        Drink
                    </button>
                    <button className="addCoffeeAction" name="addCoffee" onClick={handleActionButton}>
                        <FontAwesomeIcon icon={faCoffee} />
                        Add coffee
                    </button>
                    <button className="addMoneyAction" name="addMoney" onClick={handleActionButton}>
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        Add money
                    </button>
                </SectionCard>
                <div className="cardContainer">
                    <SectionCard collapseable title="History" wrap={currWidth > 800} currWidth={currWidth}>
                        {transactions.map((transaction) => (<HistoryCard transaction={transaction} />))}
                    </SectionCard>
                    <SectionCard collapseable title="Balances" wrap={currWidth > 800} currWidth={currWidth}>
                        {balances.map((balance) => (<BalanceCard balance={balance} highlighted={balance.poolId == pool} />))}
                    </SectionCard>
                </div>
            </main>
        </>
    )
}