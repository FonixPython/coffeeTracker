import "./TopBar.css"
import { EditUserForm, type User } from "../AdminUsers/AdminUsers"
import { Link } from "react-router-dom"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"

interface TopBarProps {
    user: User | null,
    setModal: Function,
    setModalOpened: Function,
    reload: Function
}

export function TopBar({ user, setModal, setModalOpened, reload }: TopBarProps) {
    const [dropDown, setDropDown] = useState(false)
    async function logout() {
        const result = await fetch("/api/logout")
        if (result.ok) {
            toast.success("Successfully logged out!")
            document.location.reload()
        } else {
            toast.error("Failed to logout of session!")
        }
    }

    async function editUserModal() {
        if (user) {
            setModal({
                title: "",
                elements:
                    <EditUserForm user={user} setModal={setModal} setModalOpened={setModalOpened} reload={reload} />
            })
            setModalOpened(true)
        }
    }

    return (<>
        <div className="topBar">
            <Link style={{ textDecoration: "none" }} to="/"><h1><span style={{ color: "var(--secondary)" }}>coffee</span>Tracker</h1></Link>
            <div className="rightSide">
                {user && <button className="userButton" onClick={() => { setDropDown(!dropDown) }}>
                    <p>{user.username}</p>
                    <img className="profilePicture" src={`/api/getProfilePicture/${user.id}?v=${Date.now()}`} alt="Profile Picture" />
                </button>}
            </div>
        </div>
        {(dropDown && user) &&
            <div className="screenCover" style={{ backgroundColor: "transparent" }} onClick={(e) => { if (e.target === e.currentTarget) { setDropDown(false) } }}>
                <div className="dropDownMenu">
                    {user.permission == "admin" &&
                        <>
                            <Link to="/admin" style={{ textDecoration: "none" }}><button className="navButton">Admin</button></Link>
                            <br />
                        </>
                    }
                    <button className="navButton" onClick={editUserModal}>Edit profile</button>
                    <hr />
                    <button className="dangerButton navButton" onClick={logout}>Logout<FontAwesomeIcon icon={faRightFromBracket} /></button>
                </div>
            </div>
        }
    </>)
}