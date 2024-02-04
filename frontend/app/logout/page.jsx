"use client";
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
    const router = useRouter()
    useEffect(() => {
        localStorage.clear()
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        window.localStorage.clear()
        setTimeout(() => {
            router.push('/login')
        }, 500);
        //eslint-disable-next-line
    }, [])

    return (
        <></>
    )
}

export default Page