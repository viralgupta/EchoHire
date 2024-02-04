"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/app/components/ui/sheet";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "../components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

const Page = () => {
  const [userlocalstorage, setuserlocalstorage] = useState(null)
  const router = useRouter();
  const [addrole, setAddrole] = useState({
    type: null,
    role: null,
    technologies: null,
    topics: [
      {
        title: null,
        description: null,
      },
      {
        title: null,
        description: null,
      },
      {
        title: null,
        description: null,
      },
      {
        title: null,
        description: null,
      },
      {
        title: null,
        description: null,
      },
      {
        title: null,
        description: null,
      },
    ],
  });
  const [noofroles, Setnoofroles] = useState(1);
  const [roles, setRoles] = useState([]);

  const handleAddRole = async () => {
    const token = localStorage.getItem("token");

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };

    const response = await axios.post("/api/interviewee/addrole", addrole, {
      headers: headers,
    });
    if (response.status === 200 && response.data.success === true) {
      toast.success("Role Registered Successfully!");
      getRoles();
      setAddrole({
        type: null,
        role: null,
        technologies: null,
        topics: [
          {
            title: null,
            description: null,
          },
          {
            title: null,
            description: null,
          },
          {
            title: null,
            description: null,
          },
          {
            title: null,
            description: null,
          },
          {
            title: null,
            description: null,
          },
          {
            title: null,
            description: null,
          },
        ],
      });
    } else if (response.status === 200 && response.data.success === false) {
      toast.error(response.data.message);
    } else {
      toast.error("Registeration failed. Please try again later.");
    }
  };

  const getRoles = async () => {
    let rolesres = await axios.get("/api/interviewee/getroles");
    setRoles(rolesres.data.roles);
  };

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user"));
    setuserlocalstorage(user)
    let token = localStorage.getItem("token");
    if (!user || !token) {
      router.push("/login");
    }
    else if (!user.hasUserId) {
      router.push("/registerface");
    }
    getRoles();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="h-full p-10">
      <div className="text-4xl font-cubano flex justify-between items-center align-middle">
        <div>Find Roles</div>
        <Sheet>
          <SheetTrigger className="text-sm px-3 py-2 text-background bg-foreground rounded-lg">
            Add Role
          </SheetTrigger>
          <SheetContent className="overflow-y-scroll hidescroll">
            <SheetHeader>
              <SheetTitle>Add Role</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-start gap-4 py-4">
              <div className="flex flex-col items-start gap-1 w-full">
                <Label htmlFor="type" className="">
                  Type
                </Label>
                <Input
                  id="type"
                  value={addrole.type || ""}
                  className=""
                  onChange={(e) => {
                    setAddrole((prevRole) => ({
                      ...prevRole,
                      type: e.target.value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col items-start gap-1 w-full">
                <Label htmlFor="role" className="">
                  Role
                </Label>
                <Input
                  id="role"
                  value={addrole.role || ""}
                  className=""
                  onChange={(e) => {
                    setAddrole((prevRole) => ({
                      ...prevRole,
                      role: e.target.value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col items-start gap-1 w-full">
                <Label htmlFor="technologies" className="">
                  Technologies
                </Label>
                <Textarea
                  id="technologies"
                  value={addrole.technologies || ""}
                  className=""
                  onChange={(e) => {
                    setAddrole((prevRole) => ({
                      ...prevRole,
                      technologies: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <Label className="mb-2">Topics</Label>
            <div className="px-4 py-2">
              {Array.from({ length: noofroles }).map((_, index) => {
                return (
                  <div key={index}>
                    <div className="flex flex-col items-start gap-1 w-full mb-2">
                      <Label id={`title-${index + 1}`} className="">
                        Title {index + 1}
                      </Label>
                      <Input
                        id={`title-${index + 1}`}
                        value={addrole.topics[index]?.title || ""}
                        className=""
                        onChange={(e) => {
                          setAddrole((prevRole) => ({
                            ...prevRole,
                            topics: prevRole.topics.map((topic, i) =>
                              i === index
                                ? { ...topic, title: e.target.value }
                                : topic
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1 w-full mb-2">
                      <Label id={`desc-${index + 1}`} className="">
                        Description {index + 1}
                      </Label>
                      <Textarea
                        id={`desc-${index + 1}`}
                        value={addrole.topics[index]?.description || ""}
                        className=""
                        onChange={(e) => {
                          setAddrole((prevRole) => ({
                            ...prevRole,
                            topics: prevRole.topics.map((topic, i) =>
                              i === index
                                ? { ...topic, description: e.target.value }
                                : topic
                            ),
                          }));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => Setnoofroles((n) => n + 1)}
                className="border p-1 rounded-md"
              >
                Add topic +
              </button>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={handleAddRole}>Add Role</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>{" "}
      <div className="p-10 overflow-x-hidden overflow-y-scroll hidescroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Technologies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role, index) => {
              return (
                <TableRow key={index}>
                  <TableCell className="">{role.type}</TableCell>
                  <TableCell className="font-medium">{role.role}</TableCell>
                  <TableCell>{role.technologies}</TableCell>
                  <TableCell className="text-right">
                    {userlocalstorage && <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className=" bg-foreground text-background rounded-lg">
                          <Button
                            disabled={userlocalstorage.eligibleRoles.includes(role._id) ? false : true}
                            className="disabled:cusor-not-allowed"
                          >
                            <Link href={`/interviewer/${role._id}/${uuidv4()}`}>
                              Interview
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        {userlocalstorage.eligibleRoles.includes(role._id) ? false : true && (
                              <TooltipContent>
                                <p>Not Eligible For This Role</p>
                              </TooltipContent>
                            )}
                      </Tooltip>
                    </TooltipProvider>}
                  </TableCell>
                </TableRow>
              );
            })}
            {roles.length == 0 &&
              Array.from({ length: 5 }).map((_, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="">
                      <Skeleton className="w-[100%] h-[50px] rounded-lg" />
                    </TableCell>
                    <TableCell className="">
                      <Skeleton className="w-[100%] h-[50px] rounded-lg" />
                    </TableCell>
                    <TableCell className="">
                      <Skeleton className="w-[100%] h-[50px] rounded-lg" />
                    </TableCell>
                    <TableCell className="">
                      <Skeleton className="w-[100%] h-[50px] rounded-lg" />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
