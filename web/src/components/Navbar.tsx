import { useEffect, useState } from "react"
import { useAppData } from "../context/AppContext"
import { useLocation, useSearchParams, Link } from "react-router-dom"
import { UserButton } from "@clerk/clerk-react"
import { Search, ShoppingBag, UtensilsCrossed } from "lucide-react"

const Navbar = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState<string>(searchParams.get("search") || "")
    const { isUserAuthenticated } = useAppData()

    const currentLocation = useLocation()
    const isHomePage = currentLocation.pathname === "/"

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim()) {
                setSearchParams({ search: search.trim() })
            } else {
                setSearchParams({})
            }
        }, 400);

        return () => {
            clearTimeout(timer)
        }
    }, [search, setSearchParams])

    return (
        <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
                    
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 group shrink-0"
                    >
                        <div className="p-2 bg-orange-500 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                            <UtensilsCrossed className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight hidden sm:block">
                            Anti-Food
                        </span>
                    </Link>

                    {isHomePage ? (
                        <div className="flex-1 max-w-2xl relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for dishes, restaurants..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all duration-300"
                            />
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    <div className="flex items-center gap-3 sm:gap-6">
                        <button className="relative p-3 text-slate-600 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all duration-300 transform active:scale-95">
                            <ShoppingBag size={24} />
                            <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                                 0
                            </span>
                        </button>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

                        {/* Auth / Profile */}
                        <div className="flex items-center">
                            {isUserAuthenticated ? (
                                <div className="p-1 rounded-full border-2 border-slate-100 hover:border-orange-200 transition-colors">
                                    <UserButton 
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: "w-8 h-8 rounded-full"
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <Link 
                                    to="/sign-up" 
                                    className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all duration-200 text-sm whitespace-nowrap"
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar