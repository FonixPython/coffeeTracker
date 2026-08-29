import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
    allow: boolean;
    to: string
}

export const ProtectedRoute = ({ allow, to }: ProtectedRouteProps) => {
    return (
        allow ? <Outlet /> : <Navigate to={to} />
    )
}