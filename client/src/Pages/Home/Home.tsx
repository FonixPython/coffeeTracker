import "./Home.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Toaster, toast } from "sonner"
import { faCoffee, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { HistoryCard } from "../../Compontents/HistoryCard/HistoryCard"
import { BalanceCard } from "../../Compontents/BalanceCard/BalanceCard"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

export function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [currWidth, setCurrWidth] = useState(window.innerWidth)
    const handleResize = (e) => {
        setCurrWidth(window.innerWidth)
    }

    useEffect(() => {
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    })
    const [balances, setBalances] = useState([])
    const [transactions, setTransactions] = useState([])
    const [variations, setVariations] = useState([])
    const [pool, setPool] = useState<string | null>(searchParams.get("pool") || null)
    const [uiEnabled, setUiEnabled] = useState(false)

    async function loadUserData() {
        try {
            const balancesResult = await fetch("/api/getBalances")
            if (balancesResult.ok) {
                const balancesJsonResult = await balancesResult.json()
                setBalances(balancesJsonResult.result)
                if (searchParams.get("pool") != null) {
                    setPool(searchParams.get("pool"))
                } else if (balances.length != 0) {
                    setPool(balancesJsonResult.result.poolId)
                } else {
                    setPool(null)
                }
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
        getPoolTransactions()
    }, [pool])

    async function handleActionButton(e) {
        if (!pool) {
            toast.error("No pool selected!")
        }
    }

    const selectedBalance = balances.find(
        balance => balance.poolId === pool
    )

    return (
        <>
            <Toaster theme="system" />
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
                        <p className="userBalance">{selectedBalance?.moneyAmount ?? 0} Ft</p>
                        <p className="coffeeBalance">{(selectedBalance?.coffeeAmount ?? 0) / 1000} kg</p>
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
                        {balances.map((balance) => (<BalanceCard balance={balance} />))}
                    </SectionCard>
                </div>
            </main>
        </>
    )
}