import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from './Pages/Login/Login';
import { HomePage } from './Pages/Home/Home';
import { AdminPage } from './Pages/Admin/Admin';
import { useEffect, useState } from 'react';

export function App() {
    const [permission, setPermission] = useState("none")
    const [checkingLogin, setCheckingLogin] = useState(true);
    async function checkLogin() {
        try {
            const result = await fetch("/api/verify")
            if (result.ok) {
                const jsonResult = await result.json()
                setPermission(jsonResult.user.permission)
            }
        } catch (e) {
            console.log(e)
        } finally {
            setCheckingLogin(false);
        }
    }
    useEffect(() => {
        checkLogin()
    }, [])

    if (checkingLogin) {
        return <></>;
    }

    return (
        <Router>
            <Routes>
                <Route element={<ProtectedRoute allow={permission == "user" || permission == "admin"} to="/login" />}>
                    <Route path='/' element={<HomePage />} />
                    <Route element={<ProtectedRoute allow={permission == "admin"} to="/" />}>
                        <Route path='/admin' element={<AdminPage />} />
                    </Route>
                </Route>
                <Route path='/login' element={<LoginPage permission={permission} />} />
            </Routes>
        </Router>
    )
}
