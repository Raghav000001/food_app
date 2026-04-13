import { Route , createBrowserRouter, createRoutesFromChildren, RouterProvider } from "react-router-dom"
import SignUpPage from "./pages/SignUp"
import Home from "./pages/Home"
import SelectRole from "./pages/SelectRole"
import PublicRoutes from "./components/PublicRoutes"
import PrivateRoutes from "./components/PrivateRoutes"

const App = () => {
   const router = createBrowserRouter(
        createRoutesFromChildren(
            <Route>
               {/* public routes */}
               <Route element={<PublicRoutes/>}>
                  <Route path="/sign-up" element={<SignUpPage/>} />
               </Route>

              {/* private routes */}
               <Route element={<PrivateRoutes/>}>
                  <Route path="/" element={<Home/>} />
                  <Route path="/select-role" element={<SelectRole/>} />
               </Route>
            </Route>
        )
   )

  return (
   <RouterProvider router={router}/>
  )
}

export default App