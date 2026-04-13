export interface User{
     _id:string
     name:string
     email:string
     image:string
     role: string | null
}

export interface locationData{
    latitude:number
    longitude:number
    formattedAddress:string
}

export interface AppContextType{
     user:User | null
     loading:boolean
     isUserAuthenticated:boolean
     setUser:React.Dispatch<React.SetStateAction<User | null>>
     setLoading:React.Dispatch<React.SetStateAction<boolean>>
     setIsUserAuthenticated:React.Dispatch<React.SetStateAction<boolean>>
}
