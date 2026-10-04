import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner"
import "./Login.css"

interface LoginPageProps {
    permission: string
}

export function LoginPage({ permission }: LoginPageProps) {
    const navigate = useNavigate()
    const [mode, setMode] = useState("login")

    async function login(e: React.SubmitEvent) {
        e.preventDefault()
        const data = new FormData(e.target)
        const username = data.get("username")
        const password = data.get("password")
        if (mode == "login") {
            const result = await fetch("/api/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            switch (result.status) {
                case 200:
                    document.location.reload()
                    break
                case 403:
                    toast.error("A fiókod még nincs elfogadva! Szólj egy adminisztrátornak!")
                    break
                case 401:
                    toast.error("Hibás felhasználónév vagy jelszó!")
                    break
                default:
                    toast.error("Ismeretlen hiba!")
                    break
            }
        } else {
            const result = await fetch("/api/register", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            switch (result.status) {
                case 200:
                    toast.error("A fiókod még nincs elfogadva! Szólj egy adminisztrátornak!")
                    setMode("login")
                    break
                case 409:
                    setMode("login")
                    toast.error("Felhasználónév már létezik!")
                    break
                default:
                    toast.error("Ismeretlen hiba!")
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
                        <input type="username" name="username" placeholder="Felhasználónév" required={true} />
                        <input type="password" name="password" placeholder="Jelszó" required={true} />
                        <input type="submit" value={mode == "login" ? "Bejelentkezés" : "Regisztrálás"} />
                        or
                        <p className="modeSwitcher" onClick={() => (setMode(mode == "login" ? "register" : "login"))}>{mode == "login" ? "Regisztrálás" : "Bejelentkezés"}</p>
                    </form>
                </div>
            </main>
        </>
    )
}