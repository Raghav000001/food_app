import { useUser } from "@clerk/clerk-react"

const Home = () => {
  const {user} = useUser()

  return (
    <div>
        <p>
            welcome {user?.fullName}
        </p>
    </div>
  )
}

export default Home