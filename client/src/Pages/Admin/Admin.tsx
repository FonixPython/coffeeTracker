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

export function AdminPage() {
    const [modalOpened, setModalOpened] = useState<boolean>()
    const [modal, setModal] = useState({
        title: "",
        elements: <></>,
    })

    // Pools

    const [pools, setPools] = useState<Pool[]>()

    async function loadPools() {
        const result = await fetch("/api/getPools")
        if (result.ok) {
            const resultJson = await result.json()
            setPools(resultJson.result)
        } else {
            toast.error("Falied to load pools!")
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
            title: "Add pool",
            elements:
                <form action="" onSubmit={createPool} >
                    <input type="text" name="name" placeholder="Pool name..." required={true} />
                    <input type="submit" value="Create" />
                    <input type="button" className="dangerButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }} value="Cancel" />
                </form>
        })
        setModalOpened(true)
    }

    // Variations

    interface Variation {
        id: string,
        coffeeAmount: number
    }

    const [variations, setVariations] = useState<Variation[]>()

    async function loadVariations() {
        const result = await fetch("/api/getVariations")
        if (result.ok) {
            const resultJson = await result.json()
            setVariations(resultJson.result)
        } else {
            toast.error("Falied to load variations!")
        }
    }

    async function createVariation(e: React.SubmitEvent) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
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
            title: "Add new variation",
            elements:
                <form action="" onSubmit={createVariation}>
                    <input type="text" name="id" placeholder="Variation name..." required={true} />
                    <input type="number" name="coffeeAmount" style={{ width: "100px" }} required={true} />g
                    <input type="submit" value="Add" />
                    <input type="button" className="dangerButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }} value="Cancel" />
                </form>
        })
        setModalOpened(true)
    }

    async function deleteVariation(id: string) {
        const result = await fetch("/api/deleteVariation/" + id, { method: "DELETE" })
        if (result.ok) {
            loadVariations()
            setModalOpened(false)
            toast.success("Successfully deleted variation!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function deleteVariationModal(id: string) {
        setModal({
            title: "Delete variation",
            elements:
                <div>
                    <button className="actionButton dangerButton" onClick={() => { deleteVariation(id) }}>Delete</button>
                    <button className="actionButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Cancel</button>
                </div>
        })
        setModalOpened(true)
    }

    useEffect(() => {
        loadPools()
        loadVariations()
    }, [])

    return (
        <>
            <Toaster />
            <ModalWrapper isopen={modalOpened} setOpen={setModalOpened} title={modal.title}>
                {modal.elements}
            </ModalWrapper>
            <main className="adminPage">
                <SectionCard title="Pools" collapseable headerChildren={
                    <button onClick={addPoolModal}>Add Pool <FontAwesomeIcon icon={faPlus} /></button>
                }>
                    <hr />
                    <AdminPools pools={pools || []} setModal={setModal} setModalOpened={setModalOpened} reload={loadPools} />
                </SectionCard>
                <SectionCard title="Variations" collapseable headerChildren={
                    <button onClick={addVariationModal}>Add variation<FontAwesomeIcon icon={faPlus} /></button>
                }>
                    <hr />
                    {variations?.map((variation) => (
                        <div className="variationCard">
                            <p>{variation.id} | {variation.coffeeAmount}g/serving</p>
                            <div>
                                <button className="actionButton">Edit<FontAwesomeIcon icon={faPenToSquare} /></button>
                                <button className="actionButton dangerButton" onClick={() => { deleteVariationModal(variation.id) }}>Delete<FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </div>
                    ))}
                </SectionCard>
                <SectionCard title="Users" collapseable>
                    <button>Register User</button>
                </SectionCard>
            </main>
        </>
    )
}