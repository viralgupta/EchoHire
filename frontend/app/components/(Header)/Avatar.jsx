"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AvatarMain = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null)
  const router = useRouter()
  useEffect(() => {
    const userlocal = localStorage.getItem("user");
    let token = localStorage.getItem("token");
    if(userlocal !== undefined && token) {
      const user = JSON.parse(userlocal);
      setUser(user)
    }
    setIsLoading(false)
  }, []);

  return (
    <div className="flex gap-2">
      {!isLoading && !!user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-2">
            <div className="hidden items-center justify-center whitespace-nowrap rounded-md bg-primary p-2.5 px-4 text-sm font-medium text-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:inline-flex">
              Dashboard
            </div>
            <Avatar className="hover:cursor-pointer md:hover:cursor-default">
              <AvatarImage
                src={user.picture}
                alt={`${user.name} Profile Picture`}
              />
              <AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="text-foregroun bg-background text-left">
            <DropdownMenuLabel className="">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-center px-10">
              <div
                onClick={() => {
                  router.push('/logout')
                }}
              >
                Logout
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!isLoading && !user && (
        <Button className="p-1 md:p-3" onClick={() => router.push('/login')}>
          Sign In/Up
        </Button>
      )}
      {isLoading && (
        <div className="flex gap-2">
          <div className="hidden flex-col items-start space-y-2 md:flex">
            <p></p>
            <Skeleton className="h-[10px] w-[100px] rounded-md" />
            <Skeleton className="h-[10px] w-[100px] rounded-md" />
          </div>
          <Skeleton className="aspect-square h-10 rounded-full" />
        </div>
      )}
    </div>
  );
};
export default AvatarMain;
