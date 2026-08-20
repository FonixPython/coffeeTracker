import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from './Pages/Login/Login';
import { HomePage } from './Pages/Home/Home';
import { AdminPage } from './Pages/Admin/Admin';

export function App() {
    return (
        <Router>
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/admin' element={<AdminPage />} />
                </Route>
                <Route path='/login' element={<LoginPage />} />
            </Routes>
        </Router>
    )
}
