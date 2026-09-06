import "./Admin.css"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { AdminPools } from "../../Compontents/AdminPools/AdminPools"
import type { Pool } from "../../Compontents/AdminPools/AdminPools"
import { ModalWrapper } from "../../Compontents/ModalWrapper/ModalWrapper"
import { useEffect, useState } from "react"
import { Toaster, toast } from "sonner"
import type { SubmitEvent } from "react"

export function AdminPage() {
    const [modalOpened, setModalOpened] = useState<boolean>()
    const [modal, setModal] = useState(<></>)

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
            setModal(<></>)
        } else {
            const jsonResult = await result.json()
            toast.error(jsonResult.message)
        }
    }

    function addPoolModal() {
        setModal(
            <form action="" onSubmit={createPool} >
                <input type="text" placeholder="Pool name..." required={true} />
                <button >Cancel</button>
                <input type="submit" value="Create" />
            </form>
        )
        setModalOpened(true)
    }

    useEffect(() => {
        loadPools()
    }, [])

    return (
        <>
            <Toaster />
            <ModalWrapper isopen={modalOpened} setOpen={setModalOpened} title="Test modal">
                {modal}
            </ModalWrapper>
            <main className="adminPage">
                <SectionCard title="Pools" collapseable>
                    <button onClick={addPoolModal}>Add Pool</button>
                    <AdminPools pools={pools || []} />
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