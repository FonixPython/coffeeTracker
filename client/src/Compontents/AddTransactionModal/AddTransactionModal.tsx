import { toast } from "sonner"
import type { Balance, Variation } from "../../Pages/Home/Home"
import { useEffect, useState } from "react"

interface AddTransactionModalProps {
    type: string,
    pool: string,
    balances: Balance[],
    variations: Variation[],
    setModal: Function,
    setModalOpened: Function,
    setPool: Function,
    setSearchParams: Function,
    loadUserData: Function,
    getPoolTransactions: Function
}

export function AddTransactionModal({ type, setModal, setModalOpened, setPool, setSearchParams, pool, balances, loadUserData, getPoolTransactions, variations }: AddTransactionModalProps) {
    async function addCoffeeAction(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const coffeeAmount = Number(data.get("coffeeAmount"))
        const moneyAmount = Number(data.get("moneyAmount"))
        const result = await fetch("/api/addTransaction", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "addCoffee",
                coffeeAmount,
                moneyAmount,
                poolId: selectedPool,
            })
        })
        if (result.ok) {
            loadUserData()
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Tranzakció sikeresen hozzáadásra került!")
            getPoolTransactions()
        } else {
            const resultJson = await result.json()
            toast.error(resultJson.message)
        }
    }

    async function useMoneyAction(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const coffeeAmount = Number(data.get("coffeeAmount"))
        const moneyAmount = Number(data.get("moneyAmount"))
        const result = await fetch("/api/addTransaction", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "useMoney",
                coffeeAmount,
                moneyAmount,
                poolId: selectedPool,
            })
        })
        if (result.ok) {
            loadUserData()
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Tranzakció sikeresen hozzáadásra került!")
            getPoolTransactions()
        } else {
            const resultJson = await result.json()
            toast.error(resultJson.message)
        }
    }


    async function addMoneyAction(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const moneyAmount = Number(data.get("moneyAmount"))
        const result = await fetch("/api/addTransaction", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "addMoney",
                coffeeAmount: 0,
                moneyAmount,
                poolId: selectedPool,
            })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Tranzakció sikeresen hozzáadásra került!")
            loadUserData()
            getPoolTransactions()
        } else {
            const resultJson = await result.json()
            toast.error(resultJson.message)
        }
    }

    const [customVariation, setCustomVariation] = useState(false)
    const [avgCost, setAvgCost] = useState(0)
    const [coffeeAmount, setCoffeeAmount] = useState(variations[0].coffeeAmount)
    const [selectedPool, setSelectedPool] = useState<string>(pool)

    const selectedBalance = balances.find(
        balance => balance.poolId === selectedPool
    )
    let hasEnoughCoffee = coffeeAmount <= Number(selectedBalance?.coffeeAmount)
    let hasEnoughMoney = Math.ceil(avgCost * coffeeAmount) <= Number(selectedBalance?.moneyBalance)
    let canDrink = hasEnoughCoffee && hasEnoughMoney

    async function getAvgCost(poolId: string) {
        const result = await fetch("/api/coffeeCost/" + poolId)
        if (result.ok) {
            const resultJson = await result.json()
            setAvgCost(resultJson.result)
        } else {
            toast.error("Hiba a kávé átlagárának betöltésekor!")
        }
    }

    const [moneyAmount, setMoneyAmount] = useState<number>(0)
    const canUse = moneyAmount <= Number(selectedBalance?.poolMoneyOnly)

    async function drinkAction(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = new FormData(e.target)
        const variation = data.get("variation") == "customVariationValue" ? null : variations[Math.min(Number(data.get("variation")), variations.length - 1)].id
        const result = await fetch("/api/addTransaction", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                poolId: selectedPool,
                type: "drink",
                moneyAmount: 0,
                coffeeAmount: coffeeAmount,
                coffeeVariation: variation
            })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Tranzakció sikeresen hozzáadásra került!")
            loadUserData()
            getPoolTransactions()
        } else {
            const resultJson = await result.json()
            toast.error(resultJson.message)
        }
    }

    useEffect(() => {
        getAvgCost(selectedPool)
    }, [])



    switch (type) {
        case "addCoffee":
            return (
                <form className="newTransactionForm" action="" onSubmit={addCoffeeAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Medence: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Kávé mennyisége:</p>
                        <input type="number" required name="coffeeAmount" placeholder="Súly grammban" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Kávé értéke:</p>
                        <input type="number" required name="moneyAmount" placeholder="Érték forintban" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" value="Hozzáadás" style={{ width: "100%", margin: "3px" }} />
                        <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Mégse" />
                    </div>
                </form>
            )
        case "useMoney":
            return (
                <form className="newTransactionForm" action="" onSubmit={useMoneyAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Medence: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Kávé mennyisége:</p>
                        <input type="number" required name="coffeeAmount" placeholder="Súly grammban" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pénz felhasználva:</p>
                        <input type="number" required name="moneyAmount" onChange={(e) => { setMoneyAmount(Number(e.target.value)) }} placeholder="Érték forintban" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p style={!canUse ? { color: "var(--danger)" } : {}}><strong>Maradék pénz:</strong>{Number(selectedBalance?.poolMoneyOnly) - moneyAmount} Ft</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" className={!canUse ? "dangerButton" : ""} value="Hozzáadás" style={{ width: "100%", margin: "3px" }} disabled={!canUse} />
                        <input type="button" className={canUse ? "dangerButton" : ""} style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Mégse" />
                    </div>
                </form>
            )
        case "addMoney":
            return (
                <form className="newTransactionForm" action="" onSubmit={addMoneyAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Medence: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <input type="number" required name="moneyAmount" placeholder="Érték forintban" />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" value="Hozzáadás" style={{ width: "100%", margin: "3px" }} />
                        <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Mégse" />
                    </div>
                </form>
            )
        case "drink":
            return (
                <form className="newTransactionForm" action="" onSubmit={drinkAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Medence: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            getAvgCost(newPool)
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Variáció: </p>
                        <select className="machineName" required name="variation" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            if (e.target.value !== "customVariationValue") {
                                setCustomVariation(false)
                                setCoffeeAmount(variations[Number(e.target.value)].coffeeAmount)
                            } else {
                                setCoffeeAmount(0)
                            }
                        }}>
                            {variations.map((variation, index) => (<option key={variation.id} value={index}>{variation.id}</option>))}
                            <option onClick={() => { setCustomVariation(true) }} value="customVariationValue">Egyéni</option>
                        </select>
                    </div>
                    {customVariation &&
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                            <p>Kávé mennyisége:</p>
                            <input type="number" required name="coffeeAmount" style={{ width: "100px" }} onChange={(e) => { setCoffeeAmount(Number(e.target.value)) }} />
                        </div>
                    }
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p style={!canDrink ? { color: "var(--danger)" } : {}}><strong>Becsült érték:</strong> ~{Math.ceil(avgCost * coffeeAmount)} Ft</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" className={!canDrink ? "dangerButton" : ""} value="Hozzáadás" style={{ width: "100%", margin: "3px" }} disabled={!canDrink} />
                        <input type="button" className={canDrink ? "dangerButton" : ""} style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Mégse" />
                    </div>
                </form>
            )
    }
}