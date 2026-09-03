import "./Admin.css"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"
import { ModalWrapper } from "../../Compontents/ModalWrapper/ModalWrapper"
import { useState } from "react"
import { Toaster, toast } from "sonner"

export function AdminPage() {
    const [modalOpened, setModalOpened] = useState<boolean>()
    const [modal, setModal] = useState(<></>)

    async function createPool(e) {
        e.preventDefault()
        const name = e.currentTarget.elements[0].value
        const result = await fetch("/api/addPool", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
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

    return (
        <>
            <Toaster />
            <ModalWrapper isopen={modalOpened} setOpen={setModalOpened} title="Test modal">
                {modal}
            </ModalWrapper>
            <main>
                <SectionCard title="Pools" collapseable>
                    <button onClick={addPoolModal}>Add Pool</button>
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