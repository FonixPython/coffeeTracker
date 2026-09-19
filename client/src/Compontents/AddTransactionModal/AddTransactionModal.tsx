import { toast } from "sonner"
import type { Balance, Variation } from "../../Pages/Home/Home"
import { useState } from "react"

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
                poolId: pool,
            })
        })
        if (result.ok) {
            loadUserData()
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Successfully added transaction!")
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
                poolId: pool,
            })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            toast.success("Successfully added transaction!")
            loadUserData()
            getPoolTransactions()
        } else {
            const resultJson = await result.json()
            toast.error(resultJson.message)
        }
    }

    const [customVariation, setCustomVariation] = useState(false)

    switch (type) {
        case "addCoffee":
            return (
                <form className="newTransactionForm" action="" onSubmit={addCoffeeAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Amount of coffee:</p>
                        <input type="number" name="coffeeAmount" placeholder="Weight in gramms" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Cost of coffee:</p>
                        <input type="number" name="moneyAmount" placeholder="Cost in HUF" />
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
        case "addMoney":
            return (
                <form className="newTransactionForm" action="" onSubmit={addMoneyAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <input type="number" name="moneyAmount" placeholder="Cost in HUF" />
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
                <form className="newTransactionForm" action="" onSubmit={addMoneyAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Pool: </p>
                        <select defaultValue={pool || ""} onChange={(e) => {
                            const newPool = e.target.value
                            setPool(newPool)
                            setSearchParams({ pool: newPool })
                        }} className="machineName">
                            {balances.map((balance) => (<option key={balance.poolId} value={balance.poolId}>{balance.poolName}</option>))}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <p>Variation: </p>
                        <select className="machineName" onChange={(e) => {
                            if (e.target.value !== "customVariationValue") {
                                setCustomVariation(false)
                            }
                        }}>
                            {variations.map((variation) => (<option key={variation.id} value={variation.id}>{variation.id}</option>))}
                            <option onClick={() => { setCustomVariation(true) }} value="customVariationValue">Custom</option>
                        </select>
                    </div>
                    {customVariation &&
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                            <p>Amount of coffee:</p>
                            <input type="number" name="coffeeAmount" style={{ width: "100px" }} />
                        </div>
                    }
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" value="Save" style={{ width: "100%", margin: "3px" }} />
                        <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Cancel" />
                    </div>
                </form>
            )
    }
}