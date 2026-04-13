import { User, Store, Bike } from "lucide-react"

export const BACKEND_BASE_URL = "http://localhost:3333/api/v1"

 export const roleConfigs = [
        {
            id: "customer",
            title: "Customer",
            description: "Discover and order from the best restaurants in town.",
            icon: User,
            color: "amber"
        },
        {
            id: "restaurant_owner",
            title: "Restaurant Partner",
            description: "Scale your business and manage orders with ease.",
            icon: Store,
            color: "orange"
        },
        {
            id: "delivery_rider",
            title: "Delivery Rider",
            description: "Flexible earning opportunities on your own schedule.",
            icon: Bike,
            color: "orange"
        }
 ]
 
    