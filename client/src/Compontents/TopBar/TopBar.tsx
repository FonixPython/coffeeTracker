import "./TopBar.css"
import type { User } from "../AdminUsers/AdminUsers"
import { Link } from "react-router-dom"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons"

interface TopBarProps {
    user: User | null
}

export function TopBar({ user }: TopBarProps) {
    const [dropDown, setDropDown] = useState(false)
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
                        <Link to="/admin" style={{ textDecoration: "none" }}><button className="navButton">Admin</button></Link>
                    }
                    <br />
                    <button className="navButton">Edit profile</button>
                    <hr />
                    <button className="dangerButton navButton">Logout<FontAwesomeIcon icon={faRightFromBracket} /></button>
                </div>
            </div>
        }
    </>)
}