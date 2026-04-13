import { useUser } from "@clerk/clerk-react"
import { SignOutButton } from "@clerk/clerk-react"

const Home = () => {
  const {user} = useUser()

  return (
    <div>
        <p>
            welcome {user?.fullName}
        </p>
        <SignOutButton/>
    </div>
  )
}

export default Home