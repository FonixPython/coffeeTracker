import "./AdminUsers.css"
import { AdminTransactionCard, type Transaction } from "../AdminPools/AdminPools"
import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckDouble, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"

export interface User {
    id: String,
    username: String,
    accepted: Boolean,
    pfpId: String,
    admin: Boolean,
    dateOfRegistration: String,
    transactions: Transaction[]
}

interface AdminUsersProps {
    users: User[],
    setModalOpened: Function,
    setModal: Function,
    reload: Function
}

interface UserProps {
    user: User,
    setModalOpened: Function,
    setModal: Function,
    reload: Function
}

export function AdminUsers({ users, setModalOpened, setModal, reload }: AdminUsersProps) {
    return (
        <>
            {users.map((user) => (
                <AdminUserCard user={user} setModalOpened={setModalOpened} setModal={setModal} reload={reload} />
            ))}
        </>
    )
}

function AdminUserCard({ user, setModalOpened, setModal, reload }: UserProps) {
    async function deleteUserAction() {
        const result = await fetch("/api/deleteSpecifiedUser/" + user.id, { method: "DELETE" })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success("Successfully deleted user!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    function deleteUserModal() {
        setModal({
            title: "Confirm deletion of user " + user.username,
            elements:
                <div>
                    <button className="actionButton dangerButton" onClick={deleteUserAction}>Delete</button>
                    <button className="actionButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Cancel</button>
                </div>
        })
        setModalOpened(true)
    }

    async function acceptUser() {
        const result = await fetch("/api/editUser/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: user.id, username: user.username, accepted: true, pfpId: user.pfpId, admin: user.admin })
        })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success("User " + user.username + " accepted!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    return (
        <SectionCard title={user.username} collapseable={true} headerChildren={
            <>
                {!user.accepted && <button className="actionButton dangerButton" style={{ borderColor: "var(--success)" }} onClick={acceptUser}>Accept<FontAwesomeIcon icon={faCheckDouble} /></button>}
                <button className="actionButton">Edit <FontAwesomeIcon icon={faPenToSquare} /></button>
                <button className="actionButton dangerButton" onClick={deleteUserModal}>Delete <FontAwesomeIcon icon={faTrash} /></button>
            </>
        }>
            <hr />
            {user.transactions.map((transaction) => {
                <AdminTransactionCard transaction={transaction} setModalOpened={setModalOpened} setModal={setModal} reload={reload} />
            })}
        </SectionCard>
    )
}