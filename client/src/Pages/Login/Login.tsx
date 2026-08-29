import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner"
import "./Login.css"

interface LoginPageProps {
    permission: string
}

export function LoginPage({ permission }: LoginPageProps) {
    const navigate = useNavigate()
    const [mode, setMode] = useState("login")
    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    })
    const handleChange = (e) => {
        const { name, value } = e.target
        setCredentials(prev => ({ ...prev, [name]: value }))
    }
    async function login(e) {
        e.preventDefault()
        if (mode == "login") {
            const result = await fetch("/api/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })
            switch (result.status) {
                case 200:
                    navigate("/")
                    break
                case 403:
                    toast.error("Your account is not approved! Please wait for approval from an administrator!")
                    break
                case 401:
                    toast.error("Unauthorized! Incorrect username or password!")
                    break
                default:
                    toast.error("Unknown error!")
                    break
            }
        } else {
            const result = await fetch("/api/register", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })
            switch (result.status) {
                case 200:
                    toast.error("Your account is not approved! Please wait for approval from an administrator!")
                    setMode("login")
                    break
                case 409:
                    setMode("login")
                    toast.error("User already exists!")
                    break
                default:
                    toast.error("Unknown error!")
                    break
            }
        }
    }

    useEffect(() => {
        if (permission != "none") {
            navigate("/")
        }
    }, [permission, navigate])

    return (
        <>
            <Toaster theme="system" />
            <main className="loginPage">
                <div className={`loginBox ${mode}`}>
                    <p>coffeeTracker</p>
                    <form onSubmit={login}>
                        <input type="username" name="username" placeholder="Username" onChange={handleChange} required={true} />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required={true} />
                        <input type="submit" value={mode == "login" ? "Login" : "Register"} />
                        or
                        <p className="modeSwitcher" onClick={() => (setMode(mode == "login" ? "register" : "login"))}>{mode == "login" ? "Register" : "Login"}</p>
                    </form>
                </div>
            </main>
        </>
    )
}