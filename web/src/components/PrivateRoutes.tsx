import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppData } from "../context/AppContext"

const PrivateRoutes = () => {
    const {isUserAuthenticated,loading,user} = useAppData()
    const location = useLocation()

    if (loading) return null

    if (!isUserAuthenticated) {
      return <Navigate to={"/"} replace state={{from:location}}/>
    }

    if (user?.role === null && location.pathname !== "/select-role") {
        return <Navigate to={"/select-role"} replace/>
    }

    if (user?.role !== null && location.pathname === "/select-role") {
        return <Navigate to={"/"} replace/>
    }

    return <Outlet/>
}

export default PrivateRoutes