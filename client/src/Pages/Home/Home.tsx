import "./Home.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoffee, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { HistoryCard } from "../../Compontents/HistoryCard/HistoryCard"
import { BalanceCard } from "../../Compontents/BalanceCard/BalanceCard"
import { useEffect, useState } from "react"

export function HomePage() {

    const [currWidth, setCurrWidth] = useState(window.innerWidth)
    const handleResize = (e) => {
        setCurrWidth(window.innerWidth)
    }

    useEffect(() => {
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    })
    return (
        <main className="homePage">
            <SectionCard>
                <div style={{ margin: 10 }}>
                    <p className="machineName">Irodai kávégép</p>
                    <p className="userBalance">11 700 Ft</p>
                    <p className="coffeeBalance">1kg kávé</p>
                </div>
            </SectionCard>
            <SectionCard className="actionContainer">
                <button className="drinkAction">
                    <FontAwesomeIcon icon={faCoffee} />
                    Drink
                </button>
                <button className="addCoffeeAction">
                    <FontAwesomeIcon icon={faCoffee} />
                    Add coffee
                </button>
                <button className="addMoneyAction">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                    Add money
                </button>
            </SectionCard>
            <div className="cardContainer">
                <SectionCard collapseable title="History" wrap={currWidth > 800} currWidth={currWidth}>
                    <HistoryCard transaction={{ type: "drink", moneyAmount: 70, coffeeAmount: 20 }} />
                    <HistoryCard transaction={{ type: "addCoffee", moneyAmount: 1770, coffeeAmount: 1000 }} />
                    <HistoryCard transaction={{ type: "addMoney", moneyAmount: 11770 }} />
                </SectionCard>
                <SectionCard collapseable title="Balances" wrap={currWidth > 800} currWidth={currWidth}>
                    <BalanceCard balance={{ name: "Irodai kávégép", coffee: 1000, user: 11770 }} />
                    <BalanceCard balance={{ name: "Közös kávégép", coffee: 2000, user: 5600 }} />
                </SectionCard>
            </div>
        </main>
    )
}