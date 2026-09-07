import "./Admin.css"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { AdminPools } from "../../Compontents/AdminPools/AdminPools"
import type { Pool } from "../../Compontents/AdminPools/AdminPools"
import { ModalWrapper } from "../../Compontents/ModalWrapper/ModalWrapper"
import { useEffect, useState } from "react"
import { Toaster, toast } from "sonner"
import type { SubmitEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export function AdminPage() {
    const [modalOpened, setModalOpened] = useState<boolean>()
    const [modal, setModal] = useState({
        title: "",
        elements: <></>,
    })

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

    function confirmationModal(confirmText: string) {
        setModal({
            title: "Confirmation",
            elements:
                <div>
                    <button className="dangerButton">{confirmText || "Do it!"}</button>
                    <button className="actionButton">Cancel</button>
                </div>
        })
    }

    useEffect(() => {
        loadPools()
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
                <SectionCard title="Variations" collapseable>
                    <button>Add variation</button>
                </SectionCard>
                <SectionCard title="Users" collapseable>
                    <button>Register User</button>
                </SectionCard>
            </main>
        </>
    )
}