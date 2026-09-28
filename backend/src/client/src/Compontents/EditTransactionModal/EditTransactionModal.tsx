import { toast } from "sonner"
import type { Balance, Variation } from "../../Pages/Home/Home"
import { useEffect, useState } from "react"
import type { Transaction } from "../AdminPools/AdminPools"

interface EditTransactionModalProps {
    transaction: Transaction,
    balances: Balance[],
    variations: Variation[],
    setModal: Function,
    setModalOpened: Function,
    loadUserData: Function,
    getPoolTransactions: Function
}

export function EditTransactionModal({ transaction, setModal, setModalOpened, balances, loadUserData, getPoolTransactions, variations }: EditTransactionModalProps) {
    async function addCoffeeAction(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const coffeeAmount = Number(data.get("coffeeAmount"))
        const moneyAmount = Number(data.get("moneyAmount"))
        const result = await fetch("/api/editTransaction/" + transaction.id, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coffeeAmount,
                moneyAmount,
                poolId: selectedPool,
            })
        })
        if (result.ok) {
            loadUserData()
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Successfully edited transaction!")
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
        console.log(selectedPool)
        const result = await fetch("/api/editTransaction/" + transaction.id, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "useMoney",
                coffeeAmount,
                moneyAmount,
                poolId: selectedPool
            })
        })
        if (result.ok) {
            loadUserData()
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Successfully edited transaction!")
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
        const result = await fetch("/api/editTransaction/" + transaction.id, {
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
            toast.success("Successfully edited transaction!")
            loadUserData()
            getPoolTransactions()
        } else {
            const resultJson = await result.json()
            toast.error(resultJson.message)
        }
    }

    const [customVariation, setCustomVariation] = useState(transaction.coffeeVariationId == null)
    const [avgCost, setAvgCost] = useState(0)
    const [coffeeAmount, setCoffeeAmount] = useState(transaction.coffeeAmount)
    const [selectedPool, setSelectedPool] = useState<string>(transaction.poolId)

    const selectedBalance = balances.find(
        balance => balance.poolId === selectedPool
    )
    let hasEnoughCoffee = transaction.poolId == selectedPool ? coffeeAmount <= Number(selectedBalance?.coffeeAmount) + transaction.coffeeAmount : coffeeAmount <= Number(selectedBalance?.coffeeAmount)
    let hasEnoughMoney = transaction.poolId == selectedPool ? Math.ceil(avgCost * coffeeAmount) <= Number(selectedBalance?.moneyBalance) + transaction.moneyAmount : Math.ceil(avgCost * coffeeAmount) <= Number(selectedBalance?.moneyBalance)
    let canDrink = hasEnoughCoffee && hasEnoughMoney

    async function getAvgCost(poolId: string) {
        const result = await fetch("/api/coffeeCost/" + poolId)
        if (result.ok) {
            const resultJson = await result.json()
            setAvgCost(resultJson.result)
        } else {
            toast.error("Error loading avarage coffee cost for this pool!")
        }
    }

    const [moneyAmount, setMoneyAmount] = useState<number>(transaction.moneyAmount)
    const canUse = transaction.poolId == selectedPool ? moneyAmount <= Number(selectedBalance?.poolMoneyOnly) + transaction.moneyAmount : moneyAmount <= Number(selectedBalance?.poolMoneyOnly)

    async function drinkAction(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = new FormData(e.target)
        const variation = data.get("variation") == "customVariationValue" ? null : data.get("variation")
        const result = await fetch("/api/editTransaction/" + transaction.id, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                poolId: selectedPool,
                moneyAmount: 0,
                coffeeAmount: coffeeAmount,
                coffeeVariation: variation
            })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Successfully edited transaction!")
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



    switch (transaction.type) {
        case "addCoffee":
            return (
                <form className="newTransactionForm" action="" onSubmit={addCoffeeAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={transaction.poolId || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Amount of coffee:</p>
                        <input type="number" required name="coffeeAmount" defaultValue={transaction.coffeeAmount} placeholder="Weight in gramms" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Cost of coffee:</p>
                        <input type="number" required name="moneyAmount" defaultValue={transaction.moneyAmount} placeholder="Cost in HUF" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" value="Save" style={{ width: "100%", margin: "3px" }} />
                        <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Cancel" />
                    </div>
                </form>
            )
        case "useMoney":
            return (
                <form className="newTransactionForm" action="" onSubmit={useMoneyAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={transaction.poolId || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Amount of coffee:</p>
                        <input type="number" required name="coffeeAmount" defaultValue={transaction.coffeeAmount} placeholder="Weight in gramms" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Money used:</p>
                        <input type="number" required name="moneyAmount" defaultValue={transaction.moneyAmount} onChange={(e) => { setMoneyAmount(Number(e.target.value)) }} placeholder="Cost in HUF" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p style={!canUse ? { color: "var(--danger)" } : {}}><strong>Money left:</strong>{transaction.poolId == selectedPool ? Number(selectedBalance?.poolMoneyOnly) + transaction.moneyAmount - moneyAmount : Number(selectedBalance?.poolMoneyOnly) - moneyAmount} Ft</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" className={!canUse ? "dangerButton" : ""} value="Save" style={{ width: "100%", margin: "3px" }} disabled={!canUse} />
                        <input type="button" className={canUse ? "dangerButton" : ""} style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Cancel" />
                    </div>
                </form>
            )
        case "addMoney":
            return (
                <form className="newTransactionForm" action="" onSubmit={addMoneyAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={transaction.poolId || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <input type="number" required name="moneyAmount" defaultValue={transaction.moneyAmount} placeholder="Cost in HUF" />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" value="Save" style={{ width: "100%", margin: "3px" }} />
                        <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Cancel" />
                    </div>
                </form>
            )
        case "drink":
            return (
                <form className="newTransactionForm" action="" onSubmit={drinkAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={transaction.poolId || ""} onChange={(e) => {
                            const newPool = e.target.value
                            getAvgCost(newPool)
                            setSelectedPool(newPool)
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Variation: </p>
                        <select className="machineName" required name="variation" defaultValue={transaction.coffeeVariationId != null ? transaction.coffeeVariationId : "customVariationValue"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            if (e.target.value !== "customVariationValue") {
                                setCustomVariation(false)
                                setCoffeeAmount(variations?.find(variation => variation.id === e.target.value)?.coffeeAmount ?? 0)
                            } else {
                                setCoffeeAmount(0)
                            }
                        }}>
                            {variations.map((variation) => (<option key={variation.id} value={variation.id}>{variation.id}</option>))}
                            <option onClick={() => { setCustomVariation(true) }} value="customVariationValue">Custom</option>
                        </select>
                    </div>
                    {customVariation &&
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                            <p>Amount of coffee:</p>
                            <input type="number" required name="coffeeAmount" defaultValue={Math.abs(transaction.coffeeAmount)} style={{ width: "100px" }} onChange={(e) => { setCoffeeAmount(Number(e.target.value)) }} />
                        </div>
                    }
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p style={!canDrink ? { color: "var(--danger)" } : {}}><strong>Estimated cost:</strong> ~{Math.abs(Math.ceil(avgCost * coffeeAmount))} Ft</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" className={!canDrink ? "dangerButton" : ""} value="Save" style={{ width: "100%", margin: "3px" }} disabled={!canDrink} />
                        <input type="button" className={canDrink ? "dangerButton" : ""} style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Cancel" />
                    </div>
                </form>
            )
    }
}