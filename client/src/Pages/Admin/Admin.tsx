import "./Admin.css"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { AdminPools } from "../../Compontents/AdminPools/AdminPools"
import type { Pool } from "../../Compontents/AdminPools/AdminPools"
import { ModalWrapper } from "../../Compontents/ModalWrapper/ModalWrapper"
import { useEffect, useState } from "react"
import { Toaster, toast } from "sonner"
import type { SubmitEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { AdminUsers, type User } from "../../Compontents/AdminUsers/AdminUsers"
import { TopBar } from "../../Compontents/TopBar/TopBar"

export function AdminPage() {
    const [modalOpened, setModalOpened] = useState<boolean>(false)
    const [modal, setModal] = useState({
        title: "",
        elements: <></>,
    })

    const [user, setUser] = useState<User | null>(null)
    async function loadUser() {
        const user = await fetch("/api/verify")
        const userJson = await user.json()
        setUser(userJson.user)
    }
    // Pools

    const [pools, setPools] = useState<Pool[]>()

    async function loadPools() {
        const result = await fetch("/api/getPools")
        if (result.ok) {
            const resultJson = await result.json()
            setPools(resultJson.result)
        } else {
            toast.error("Hiba a medencék betöltésekor!")
        }
    }

    async function createPool(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get("name")
        const result = await fetch("/api/addPool", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            loadPools()
        } else {
            const jsonResult = await result.json()
            toast.error(jsonResult.message)
        }
    }

    function addPoolModal() {
        setModal({
            title: "Medence hozzáadása",
            elements:
                <form action="" onSubmit={createPool} >
                    <input type="text" name="name" placeholder="Név..." required={true} />
                    <input type="submit" value="Hozzáadás" />
                    <input type="button" className="dangerButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }} value="Mégse" />
                </form>
        })
        setModalOpened(true)
    }

    // Variations

    interface Variation {
        id: string,
        coffeeAmount: number
    }

    const [variations, setVariations] = useState<Variation[]>([])

    async function loadVariations() {
        const result = await fetch("/api/getVariations")
        if (result.ok) {
            const resultJson = await result.json()
            setVariations(resultJson.result)
        } else {
            toast.error("Hiba a variációk betöltésekor!")
        }
    }

    async function createVariation(e: React.SubmitEvent) {
        e.preventDefault()
        const formData = new FormData(e.target)
        const id = formData.get("id")
        const coffeeAmount = Number(formData.get("coffeeAmount"))
        const result = await fetch("/api/addVariation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, coffeeAmount })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            loadVariations()
        } else {
            const jsonResult = await result.json()
            toast.error(jsonResult.message)
        }
    }

    async function addVariationModal() {
        setModal({
            title: "Variáció hozzáadása",
            elements:
                <form action="" onSubmit={createVariation}>
                    <input type="text" name="id" placeholder="Név..." required={true} />
                    <input type="number" name="coffeeAmount" style={{ width: "100px" }} required={true} />g
                    <input type="submit" value="Hozzáadás" />
                    <input type="button" className="dangerButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }} value="Mégse" />
                </form>
        })
        setModalOpened(true)
    }

    async function editVariation(e: React.SubmitEvent, old: string) {
        e.preventDefault()
        const formData = new FormData(e.target)
        const id = formData.get("id")
        const coffeeAmount = Number(formData.get("coffeeAmount"))
        const result = await fetch("/api/editVariation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: old, name: id, coffeeAmount })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            loadVariations()
        } else {
            const jsonResult = await result.json()
            toast.error(jsonResult.message)
        }
    }

    async function editVariationModal(id: string, coffeeAmount: number) {
        setModal({
            title: "Variáció szerkesztése",
            elements:
                <form action="" onSubmit={(e) => { editVariation(e, id) }}>
                    <input type="text" name="id" placeholder="Új név..." required={true} defaultValue={id} />
                    <input type="number" name="coffeeAmount" style={{ width: "100px" }} required={true} defaultValue={coffeeAmount} />g
                    <input type="submit" value="Mentés" />
                    <input type="button" className="dangerButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }} value="Mégse" />
                </form>
        })
        setModalOpened(true)
    }

    async function deleteVariation(id: string) {
        const result = await fetch("/api/deleteVariation/" + id, { method: "DELETE" })
        if (result.ok) {
            loadVariations()
            setModalOpened(false)
            toast.success("Variáció sikeresen törtlésre került!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function deleteVariationModal(id: string) {
        setModal({
            title: "Variáció törlése",
            elements:
                <div>
                    <button className="actionButton dangerButton" onClick={() => { deleteVariation(id) }}>Törlés</button>
                    <button className="actionButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Mégse</button>
                </div>
        })
        setModalOpened(true)
    }

    // Users

    const [users, setUsers] = useState<User[]>([])

    async function loadUsers() {
        const result = await fetch("/api/getAllUsers")
        if (result.ok) {
            const resultJson = await result.json()
            setUsers(resultJson.result)
        } else {
            toast.error("Hiba a felhasználók betöltésekor!")
        }
    }

    async function addUserAction(e: React.SubmitEvent) {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")
        const password = formData.get("password")
        const admin = Boolean(formData.get("admin"))

        const result = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, admin })
        })
        if (result.ok) {
            setModalOpened(false)
            setModal({ title: "", elements: <></> })
            loadUsers()
        } else {
            const jsonResult = await result.json()
            toast.error(jsonResult.message)
        }
    }

    async function addUserModal() {
        setModal({
            title: "Új felhasználó regisztrációja",
            elements:
                <form action="" className="newUserForm" onSubmit={addUserAction}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        Felhasználónév: <input type="username" name="username" placeholder="Felhasználónév" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        Jelszó: <input type="password" name="password" placeholder="Jelszó" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", margin: "5px" }}>
                        Adminisztrátor: <input type="checkbox" name="admin" defaultChecked={false} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        <input type="submit" value="Regisztálás" style={{ width: "100%", margin: "3px" }} />
                        <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                            setModalOpened(false)
                            setModal({ title: "", elements: <></> })
                        }} value="Mégse" />
                    </div>
                </form>
        })
        setModalOpened(true)
    }

    useEffect(() => {
        loadPools()
        loadVariations()
        loadUsers()
    }, [])

    useEffect(() => {
        loadUser()
    }, users)

    return (
        <>
            <Toaster theme="system" />
            <ModalWrapper isopen={modalOpened} setOpen={setModalOpened} title={modal.title}>
                {modal.elements}
            </ModalWrapper>
            <TopBar user={user} setModal={setModal} setModalOpened={setModalOpened} reload={loadUser} />
            <main className="adminPage">
                <SectionCard title="Medencék" collapseable headerChildren={
                    <button onClick={addPoolModal}>Medence hozzáadása <FontAwesomeIcon icon={faPlus} /></button>
                }>
                    <hr />
                    <AdminPools pools={pools || []} setModal={setModal} setModalOpened={setModalOpened} reload={loadPools} variations={variations} />
                </SectionCard>
                <SectionCard title="Variációk" collapseable headerChildren={
                    <button onClick={addVariationModal}>Variáció hozzáadása<FontAwesomeIcon icon={faPlus} /></button>
                }>
                    <hr />
                    {variations?.map((variation) => (
                        <div className="variationCard">
                            <p>{variation.id} | {variation.coffeeAmount}g/adag</p>
                            <div>
                                <button className="actionButton" onClick={() => { editVariationModal(variation.id, variation.coffeeAmount) }}>Szerkesztés<FontAwesomeIcon icon={faPenToSquare} /></button>
                                <button className="actionButton dangerButton" onClick={() => { deleteVariationModal(variation.id) }}>Törlés<FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </div>
                    ))}
                </SectionCard>
                <SectionCard title="Felhasználók" collapseable headerChildren={
                    <button onClick={addUserModal}>Felhasználó regisztrációja<FontAwesomeIcon icon={faPlus} /></button>
                }>
                    <hr />
                    <AdminUsers users={users} setModal={setModal} setModalOpened={setModalOpened} reload={loadUsers} variations={variations} />
                </SectionCard>
            </main>
        </>
    )
}