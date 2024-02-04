"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/app/components/ui/resizable";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { abcdefInit } from "@uiw/codemirror-theme-abcdef";
import { tags as t } from "@lezer/highlight";
import { Button } from "@/app/components/ui/button";
import ReactCanvasPaint from "react-canvas-paint";
import "react-canvas-paint/dist/index.css";
import ReactPlayer from "react-player";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useSocket } from "@/app/context/SocketProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Rating } from "react-simple-star-rating";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Page = ({ params }) => {
  const router = useRouter()
  const socket = useSocket();
  const [code, setCode] = useState(``);
  const [output, setOutput] = useState("");
  const [draw, setDraw] = useState(undefined);
  const [myStream, setMyStream] = useState(null);
  const [remoteStreamready, setRemoteStreamready] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [rating, setRating] = useState({
    friendly: 0,
    knowledge: 0,
  });
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [interviewerId, setInterviewerId] = useState(null);
  const [interviewid, setInterviewid] = useState(null)
  let mystream2;
  let interviewid2 = "";

  const clearDrawingSheet = () => {};

  const handleDrawChange = (e) => {
    setDraw(e);
  };

  const handleRunCode = () => {
    let capturedOutput = "";
    const originalConsoleLog = console.log;
    // Override console.log temporarily to capture the output
    console.log = (message) => {
      capturedOutput += message + "\n";
    };
    try {
      eval(code);
      setOutput(capturedOutput);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      console.log = originalConsoleLog;
    }
  };

  const getmyStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    mystream2 = stream;
    setMyStream(stream);
  };

  const joinRoom = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const roomid = params.id;
    socket.emit("room:join", { room: roomid, userid: user._id });
  };

  const handleRoomEnded = ({ interviewid: iid }) => {
    interviewid2 = iid;
    setInterviewid(iid)
    setAlertOpen(true);
  };

  const handleinterjoined = useCallback(async (data) => {
    const { userid: interid, from } = data;
    setRemoteSocketId(from);
    setInterviewerId(interid);
    setRemoteStreamready(true);
    // const offer = await peer2.getOffer();
    // socket.emit("user:call", {
    //   to: socketid,
    //   offer,
    // });
  }, []);

  const submitReview = async () => {
    if (interviewid || interviewid2) {
      if(rating.friendly === 0 || rating.knowledge === 0){
        toast.error("Please Rate The Interviewer");
        return;
      }
      toast.info("Generating Pdf, Please Wait");

      const token = localStorage.getItem('token');

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420"
    };
      const response = await axios.post("/api/candidate/submitreview", {
        interviewid: interviewid,
        friendlyrating: rating.friendly,
        knowlegerating: rating.knowledge,
      },{ responseType: 'blob', headers: headers});

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      router.push("/")
    }
    else{
      toast.error("InterviewId Not Found", interviewerId || interviewid2)
    }
  };

  useEffect(() => {
    socket.emit("code:change", { code, roomid: params.id });
  }, [code]);

  useEffect(() => {
    socket.emit("output:change", { output, roomid: params.id });
  }, [output]);

  // useEffect(()=>{
  //   if(draw){
  //     let serializedData = Array.from(draw.data);
  //     console.log("draw change", serializedData.toString())
  //     socket.emit("draw:change", {draw: serializedData, roomid: params.id})
  //   }
  // }, [draw])

  // const sendStreams = useCallback(async () => {
  //   for (const track of await mystream2.getTracks()) {
  //     peer.peer.addTrack(track, mystream2);
  //   }
  // }, [mystream2]);

  // const handleincommingcall = useCallback(async (data) => {
  //   console.log("incomming call")
  //   const { offer, from } = data;
  //   const ans = await peer1.getAnswer(offer);
  //   socket.emit("call:accepted", { to: from, ans });
  // }, []);

  // const handlenegotiationneeded = useCallback(async (data) => {
  //   console.log("nego needed, creating ans")
  //   const { offer, from } = data;
  //   const ans = await peer1.getAnswer(offer);
  //   socket.emit("peer:nego:done", { to: from, ans });
  // }, []);

  // const handleNegoNeeded = useCallback(async () => {
  //   console.log("handling negotiation needed")
  //   const newoffer = await peer2.getOffer();
  //   socket.emit("peer:nego:needed", {
  //     room: params.roomid,
  //     offer: newoffer,
  //   });
  // }, []);

  // const handleAcceptedCall = useCallback(
  //   async (data) => {
  //     console.log("accepted call");
  //     const { ans } = data;
  //     peer2.setLocalDescription(ans);
  //     sendStreams();
  //   },
  //   [sendStreams]
  // );

  // const handleincomingtracks = (ev) => {
  //   const remoteStream = ev.streams;
  //   console.log("setting remote stream", remoteStream);
  //   setRemoteStream(remoteStream[0]);
  // };

  // const handleNegoFinal = useCallback(async ({ from, ans }) => {
  //   console.log("negotiation done", ans);
  //   await peer2.setLocalDescription(ans);
  // }, []);

  // useEffect(() => {
  //   peer1.peer.addEventListener("track", handleincomingtracks);
  //   return () => {
  //     peer1.peer.removeEventListener("track", handleincomingtracks);
  //   }
  // }, []);

  // useEffect(() => {
  //   peer2.peer.addEventListener("negotiationneeded", handleNegoNeeded);
  //   return () => {
  //     peer2.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  //   };
  // }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        socket.emit("user:leavewindow", { room: params.id });
      } else {
        socket.emit("user:joinwindow", { room: params.id });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    socket.on("inter:joined", handleinterjoined);
    socket.on("room:ended", handleRoomEnded);
    // socket.on("incomming:call", handleincommingcall);
    // socket.on("accepted:call", handleAcceptedCall);
    // socket.on("peer:nego:needed", handlenegotiationneeded);
    // socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("inter:joined", handleinterjoined);
      socket.off("room:ended", handleRoomEnded);
      // socket.off("incomming:call", handleincommingcall);
      // socket.off("accepted:call", handleAcceptedCall);
      // socket.off("peer:nego:needed", handlenegotiationneeded);
      // socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [socket]);

  useEffect(() => {
    joinRoom();
    getmyStream();
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="h-screen p-2 bg-background text-foreground overflow-x-hidden overflow-y-scroll hidescroll text-center">
          <div className="border-2 rounded-lg overflow-hidden border-foreground px-0 font-cubano text-center bg-foreground text-background">
            {myStream && (
              <ReactPlayer
                height={"20%"}
                playing
                muted
                width={"100%"}
                url={myStream}
              />
            )}
            {!myStream && (
              <Skeleton className="w-[100%] h-[250px] rounded-lg" />
            )}
            Your Stream
          </div>
          <div className="border-2 rounded-lg overflow-hidden border-foreground px-0 font-cubano text-center mt-2 bg-foreground text-background">
            {remoteStreamready && (
              <ReactPlayer
                height={"20%"}
                playing
                muted
                width={"100%"}
                url={myStream}
              />
            )}
            {!remoteStreamready && (
              <Skeleton className="w-[100%] h-[250px] rounded-lg" />
            )}
            Interviewer Stream
          </div>
          <Button variant={"default"} className="m-2">
            Mute
          </Button>
          <AlertDialog open={alertOpen}>
            <AlertDialogTrigger className="cursor-not-allowed bg-red-500 p-2 text-background rounded-lg">
              End Interview
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Interview Ended</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex flex-col item-start w-full my-2">
                    <div>Friendlyness Of Interviewer</div>
                    <div>
                      <Rating
                        SVGstyle={{
                          display: "inline",
                          height: "2rem",
                          width: "2rem",
                        }}
                        onClick={(e) =>
                          setRating({
                            friendly: e,
                          })
                        }
                        className="inline"
                        transition
                        allowFraction={false}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col item-start w-full mb-2">
                    <div>Knowledge Of Interviewer</div>
                    <div>
                      <Rating
                        SVGstyle={{
                          display: "inline",
                          height: "2rem",
                          width: "2rem",
                        }}
                        onClick={(e) =>
                          setRating({
                            knowledge: e,
                          })
                        }
                        className="inline"
                        transition
                        allowFraction={false}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={submitReview}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <div className="p-2 h-full w-full overflow-scroll overflow-x-hidden hidescroll">
                  <div className="text-2xl font-cubano">Coding&nbsp;Ground</div>
                  <div className="w-full pb-2">
                    <CodeMirror
                      theme={abcdefInit({
                        settings: {
                          caret: "#c6c6c6",
                          fontFamily: "monospace",
                        },
                        styles: [{ tag: t.comment, color: "#6272a4" }],
                      })}
                      extensions={[javascript({ jsx: true })]}
                      onChange={(e) => setCode(e)}
                    />
                    <Button className="m-2" onClick={handleRunCode}>
                      Run Code
                    </Button>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30}>
                <div className="p-2 w-full h-full overflow-x-hidden overflow-y-scroll hidescroll">
                  <div className="text-2xl font-cubano">Output</div>
                  <div className="w-full h-full border p-2">{output}</div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="p-2 ">
              <div className="absolute text-2xl font-cubano">
                Drawing&nbsp;Sheet
              </div>
              <div className="w-full h-full z-50">
                <ReactCanvasPaint
                  onDraw={handleDrawChange}
                  height={620}
                  width={1000}
                />
                <Button className="m-2" onClick={clearDrawingSheet}>
                  Clear Canvas
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Page;
