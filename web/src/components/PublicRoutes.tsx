import { Navigate, Outlet } from "react-router-dom"
import { useAppData } from "../context/AppContext"

const PublicRoutes = () => {
    const {isUserAuthenticated} = useAppData()
    if (!isUserAuthenticated) {
        return <Outlet/>
    }
    return <Navigate to={"/"} replace/>
}

export default PublicRoutes
