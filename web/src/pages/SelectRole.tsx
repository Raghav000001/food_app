import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { roleConfigs } from "../store/constants"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useAuth } from "@clerk/clerk-react"
import { useAppData } from "../context/AppContext"

const SelectRole = () => {
    const [role, setRole] = useState<string | null>(null)
    const {setUser} = useAppData()
    const navigate = useNavigate()
    const { getToken } = useAuth()
    

    async function handleRoleSelect(selectedRole: string | null) {
         const token = await getToken();
        if (!selectedRole) return;
        try {
              await axios.put(`http://localhost:3333/api/v1/auth/select-role`, {
                role: selectedRole
            },{
                headers:{
                   Authorization: `Bearer ${token}`
                }
            })

         setRole(selectedRole)
         setUser( prev=> ({...prev,role:selectedRole}))
         navigate("/")

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-orange-100">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-slate-300/40">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Visual Side Panel */}
                    <div className="md:w-1/3 bg-linear-to-br from-orange-500 to-amber-600 p-10 flex flex-col justify-between text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">Welcome to <span className="text-amber-200">Anti-Food</span></h2>
                            <p className="text-orange-50 font-medium leading-relaxed">Join our ecosystem and choose how you want to interact with us.</p>
                        </div>
                        <div className="mt-8 relative z-10">
                            <div className="w-12 h-1 bg-amber-300/40 rounded-full mb-4"></div>
                            <p className="text-xs uppercase tracking-widest font-semibold text-orange-200">Step 01 / 02</p>
                        </div>
                        
                        {/* Decorative Background Circles */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    {/* Selection Content */}
                    <div className="md:w-2/3 p-10 lg:p-14">
                        <div className="mb-10">
                            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Select your role</h1>
                            <p className="text-slate-500 text-lg font-medium">How will you be using the platform today?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-10">
                            {roleConfigs.map((config) => {
                                const isSelected = role === config.id;
                                const Icon = config.icon;
                                
                                return (
                                    <button
                                        key={config.id}
                                        onClick={() => setRole(config.id)}
                                        className={`group relative flex items-start gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-300 transform active:scale-[0.98] ${
                                            isSelected 
                                                ? "border-orange-500 bg-orange-50/30 ring-4 ring-orange-500/10" 
                                                : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
                                        }`}
                                    >
                                        <div className={`p-4 rounded-xl transition-colors duration-300 ${
                                            isSelected ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-600 group-hover:bg-slate-100 group-hover:text-slate-900"
                                        }`}>
                                            <Icon size={24} />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-lg font-bold tracking-wide transition-colors ${
                                                    isSelected ? "text-orange-900" : "text-slate-800"
                                                }`}>
                                                    {config.title}
                                                </span>
                                                {isSelected && <CheckCircle2 className="text-orange-500" size={20} />}
                                            </div>
                                            <p className={`text-sm leading-relaxed ${
                                                isSelected ? "text-orange-800/80" : "text-slate-500"
                                            }`}>
                                                {config.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handleRoleSelect(role)}
                            disabled={!role}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                                role 
                                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 shadow-lg shadow-slate-900/10" 
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                        >
                            Continue
                            <ArrowRight size={20} className={role ? "animate-pulse" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SelectRole