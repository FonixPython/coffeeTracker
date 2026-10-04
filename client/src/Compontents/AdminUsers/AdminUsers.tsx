import "./AdminUsers.css"
import { AdminTransactionCard, type Transaction } from "../AdminPools/AdminPools"
import { SectionCard } from "../SectionCard/SectionCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckDouble, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"
import React, { useRef, useState } from "react"
import type { Variation } from "../../Pages/Home/Home"

export interface User {
    id: string,
    username: string,
    accepted: boolean,
    admin?: boolean,
    permission?: "none" | "user" | "admin",
    dateOfRegistration: string,
    transactions: Transaction[]
}

interface AdminUsersProps {
    users: User[],
    setModalOpened: Function,
    setModal: Function,
    reload: Function,
    variations: Variation[]
}

interface UserProps {
    user: User,
    setModalOpened: Function,
    setModal: Function,
    reload: Function,
    adminPanel?: boolean,
    variations?: Variation[]

}

export function AdminUsers({ users, setModalOpened, setModal, reload, variations }: AdminUsersProps) {
    return (
        <>
            {users.map((user) => (
                <AdminUserCard user={user} setModalOpened={setModalOpened} setModal={setModal} reload={reload} variations={variations} />
            ))}
        </>
    )
}

export function EditUserForm({ user, setModalOpened, setModal, reload, adminPanel }: UserProps) {
    const [pfpVersion, setPfpVersion] = useState(Date.now());
    const [chPw, setChPw] = useState(false)
    const pfpInputRef = useRef<HTMLInputElement>(null)
    async function editUserAction(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const username = data.get("username")
        const admin = Boolean(data.get("admin"))
        const accepted = Boolean(data.get("accepted"))
        const result = await fetch("/api/editUser/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: user.id, username, accepted, admin })
        })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success(user.username + " sikeresen szerkesztve!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function changeUserPassword(e: React.MouseEvent) {
        const form = e.currentTarget.closest("form")
        if (!form) return
        const data = new FormData(form)
        const password = data.get("password")
        const password_again = data.get("password-again")
        if (password !== password_again) {
            toast.error("Az új jelszavak nem egyeznek!")
            return null
        }
        const result = await fetch("/api/changePassword", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: user.id, newPassword: password })
        })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success(user.username + " jelszava sikeresen megváltoztatásra került!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function uploadProfilePicture(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        const files = e.target.files;
        if (!files) {
            return;
        }
        const data = new FormData();
        data.append("file", files[0]);
        data.append("id", user.id)
        const result = await fetch("/api/uploadProfilePicture/", {
            method: "POST",
            body: data
        })
        if (result.ok) {
            reload()
            setPfpVersion(Date.now())
            toast.success(user.username + " profilikonja sikeresen szerkesztésre került!")
        } else {
            toast.error((await result.json()).message)
        }
    }

    async function removeProfilePicture(e: React.MouseEvent) {
        e.preventDefault()
        const result = await fetch("/api/deleteProfilePicture/" + user.id, { method: "DELETE" })
        if (result.ok) {
            reload()
            setPfpVersion(Date.now())
            toast.success(user.username + " profilikonja sikeresen törlésre került!")
        } else {
            toast.error((await result.json()).message)
        }
    }

    return (
        <form style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onSubmit={editUserAction} action="">
            <div style={{ display: "flex", flexDirection: "row-reverse" }} >
                <img onClick={() => { pfpInputRef.current ? pfpInputRef.current.click() : null }} src={`/api/getProfilePicture/${user.id}?v=${pfpVersion}`} alt="Profile picture" className="profilePictureSelector profilePicture" />
                <button onClick={removeProfilePicture} style={{ position: "absolute", alignSelf: "flex-start" }}><FontAwesomeIcon icon={faTrash} className="actionButton dangerButton" /></button>
            </div>
            <input type="file" ref={pfpInputRef} hidden accept="image/*" onChange={uploadProfilePicture} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                Felhasználónév:<input type="text" name="username" placeholder="Felhasználónév" defaultValue={user.username} />
            </div>
            {adminPanel &&
                <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        Adminisztrátor:<input type="checkbox" name="admin" defaultChecked={user.admin} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                        Elfogadva: <input type="checkbox" name="accepted" defaultChecked={user.accepted} />
                    </div>
                </>
            }
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px", flexDirection: "column" }}>
                {chPw ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", backgroundColor: "var(--bg-dark)", border: "2px solid var(--border)", borderRadius: "10px" }} >
                        <p>Change password</p>
                        <input type="password" placeholder="Jelszó" name="password" />
                        <input type="password" placeholder="Jelszó" name="password-again" />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                            <input type="button" className="dangerButton" value="Jelszó mentése" onClick={changeUserPassword} />
                            <input type="button" onClick={() => { setChPw(false) }} value="Mégse" />
                        </div>
                    </div>
                ) : (
                    <button type="button" className="actionButton" onClick={() => setChPw(true)}>Jelszó megváltoztatása</button>
                )}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "5px" }}>
                <input type="submit" value="Mentés" style={{ width: "100%", margin: "3px" }} />
                <input type="button" className="dangerButton" style={{ width: "100%", margin: "3px" }} onClick={() => {
                    setModalOpened(false)
                    setModal({ title: "", elements: <></> })
                }} value="Mégse" />
            </div>
        </form>
    )
}

function AdminUserCard({ user, setModalOpened, setModal, reload, variations }: UserProps) {
    async function deleteUserAction() {
        const result = await fetch("/api/deleteSpecifiedUser/" + user.id, { method: "DELETE" })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success("Felhasználó sikeresen törlésre került!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }

    function deleteUserModal() {
        setModal({
            title: user.username + " törlésének megerősítése",
            elements:
                <div>
                    <button className="actionButton dangerButton" onClick={deleteUserAction}>Törlés</button>
                    <button className="actionButton" onClick={() => {
                        setModalOpened(false)
                        setModal({ title: "", elements: <></> })
                    }}>Mégse</button>
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
            body: JSON.stringify({ id: user.id, username: user.username, accepted: true, admin: user.admin })
        })
        if (result.ok) {
            reload()
            setModalOpened(false)
            toast.success(user.username + " elfogadva!")
            setModal({ title: "", elements: <></> })
        } else {
            toast.error((await result.json()).message)
        }
    }


    async function editUserModal() {
        setModal({
            title: `"${user.username}" szerkesztése`,
            elements:
                <EditUserForm user={user} setModal={setModal} setModalOpened={setModalOpened} reload={reload} adminPanel />
        })
        setModalOpened(true)
    }

    return (
        <SectionCard title={user.username} collapseable={true} titleChildren={
            <img src={`/api/getProfilePicture/${user.id}?v=${Date.now()}`} className="profilePicture" alt="Profile Picture" />
        }
            headerChildren={
                <>
                    {!user.accepted && <button className="actionButton dangerButton" style={{ borderColor: "var(--success)" }} onClick={acceptUser}>Elfogadás<FontAwesomeIcon icon={faCheckDouble} /></button>}
                    <button className="actionButton" onClick={editUserModal}>Szerkesztés <FontAwesomeIcon icon={faPenToSquare} /></button>
                    <button className="actionButton dangerButton" onClick={deleteUserModal}>Törlés <FontAwesomeIcon icon={faTrash} /></button>
                </>
            }>
            <hr />
            {user.transactions.length > 0 ? user.transactions.map((transaction) => (
                <AdminTransactionCard transaction={transaction} setModalOpened={setModalOpened} setModal={setModal} reload={reload} variations={variations || []} pool={false} />
            )) : <p style={{ textAlign: "center", fontWeight: 200, color: "var(--text-muted)", margin: "15px" }}>Még nincsenek tranzakciók!</p>}
        </SectionCard>
    )
}