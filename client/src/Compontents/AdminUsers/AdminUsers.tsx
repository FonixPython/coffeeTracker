import "./AdminUsers.css"
import { AdminTransactionCard, type Transaction } from "../AdminPools/AdminPools"
import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckDouble, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

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
    return (
        <SectionCard title={user.username} collapseable={true} headerChildren={
            <>
                {!user.accepted && <button className="actionButton dangerButton" style={{ borderColor: "var(--success)" }}>Accept<FontAwesomeIcon icon={faCheckDouble} /></button>}
                <button className="actionButton">Edit <FontAwesomeIcon icon={faPenToSquare} /></button>
                <button className="actionButton dangerButton">Delete <FontAwesomeIcon icon={faTrash} /></button>
            </>
        }>
            <hr />
            {user.transactions.map((transaction) => {
                <AdminTransactionCard transaction={transaction} setModalOpened={setModalOpened} setModal={setModal} reload={reload} />
            })}
        </SectionCard>
    )
}