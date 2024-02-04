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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import Link from "next/link";
import axios from "axios";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";

const Page = () => {
  const [roles, setRoles] = useState(null);

  const getRoles = async () => {
    let rolesres = await axios.get("/api/interviewee/getroles");
    setRoles(rolesres.data.roles);
  };

  const addInterst = async ({ roleid }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };
    if (user) {
      let addinterest = await axios.post(
        "/api/candidate/addinterest",
        {
          roleid: roleid,
          number: user.waNumber,
        },
        {
          headers: headers,
        }
      );
      console.log(addinterest);
      if (addinterest.data.success) {
        toast.success("Interest Added Successfully");
      } else {
        toast.error("Error Adding Interest", error);
      }
    }
  };
  

  useEffect(() => {
    getRoles();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="h-full p-10">
      <div className="text-4xl font-cubano flex">Find Roles</div>
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
            {roles &&
              roles.map((role, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="">{role.type}</TableCell>
                    <TableCell className="font-medium">{role.role}</TableCell>
                    <TableCell>{role.technologies}</TableCell>
                    <TableCell className="text-right">
                      {role.roomId
                        ? false
                        : true && (
                            <Button
                              className=""
                              onClick={() => addInterst({ roleid: role._id })}
                            >
                              Interested
                            </Button>
                          )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className=" bg-foreground text-background rounded-lg ml-2 mt-2 lg:mt-0">
                            <Button
                              className=""
                              disabled={role.roomId ? false : true}
                            >
                              <Link href={`/candidate/${role.roomId}`}>
                                Join
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {role.roomId
                            ? false
                            : true && (
                                <TooltipContent>
                                  <p>No Interviewer Available</p>
                                </TooltipContent>
                              )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            {!roles &&
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
