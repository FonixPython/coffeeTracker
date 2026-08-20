import "./Login.css"

export function LoginPage() {
    async function login(e) {
        e.preventDefault()
    }
    return (
        <main className="loginPage">
            <div className="loginBox">
                <p>coffeeTracker</p>
                <form onSubmit={login}>
                    <input type="username" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <input type="submit" value="Login" />
                </form>
            </div>
        </main>
    )
}