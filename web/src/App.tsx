import { Route , createBrowserRouter, createRoutesFromChildren, RouterProvider } from "react-router-dom"
import SignUpPage from "./pages/SignUp"
import Home from "./pages/Home"

const App = () => {
   const router = createBrowserRouter(
        createRoutesFromChildren(
            <Route>
               <Route path="/sign-up" element={<SignUpPage/>} />
               <Route path="/" element={<Home/>} />
            </Route>
        )
   )

  return (
   <RouterProvider router={router}/>
  )
}

export default App