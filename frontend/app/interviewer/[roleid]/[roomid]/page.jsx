"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/app/components/ui/resizable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { abcdefInit } from "@uiw/codemirror-theme-abcdef";
import { tags as t } from "@lezer/highlight";
import { Button } from "@/app/components/ui/button";
import ReactCanvasPaint from "react-canvas-paint";
import "react-canvas-paint/dist/index.css";
import ReactPlayer from "react-player";
import { Skeleton } from "@/app/components/ui/skeleton";
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
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Rating } from "react-simple-star-rating";
import { useSocket } from "@/app/context/SocketProvider";
import { toast } from "sonner";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
import { useRouter } from "next/navigation";
// import { useAudioRecorder } from "react-audio-voice-recorder";

const Page = ({ params }) => {
  // const {
  //   startRecording,
  //   stopRecording,
  //   togglePauseResume,
  //   recordingBlob,
  //   isRecording,
  //   // isPaused,
  //   // recordingTime,
  //   // mediaRecorder
  // } = useAudioRecorder();
  const router = useRouter()
  const { roleid, roomid } = params;
  const [topics, setTopics] = useState(null);
  const [code, setCode] = useState(``);
  const [output, setOutput] = useState("");
  const [draw, setDraw] = useState(undefined);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [ableToEnd, setAbleToEnd] = useState(false);
  const [ableToReview, setAbleToReview] = useState(false);
  const [candidateId, setCandidateId] = useState(null);
  const [mystream, setMystream] = useState(null);
  const [topicsCovered, setTopicsCovered] = useState(false);
  const [roleName, setRoleName] = useState("")
  const socket = useSocket();
  let mystream2;
  let candidateId2 = null;
  let localrecorder = null;
  let hasRecordingStoped = true;

  const handleCodeChange = ({ code }) => {
    setCode(code);
  };

  const handleOutputChange = ({ output }) => {
    setOutput(output);
  };

  const handleDrawChange = ({ draw }) => {
    console.log("draw changing", draw);
    setDraw(draw);
  };

  const startRecording = () => {
    hasRecordingStoped = false;
    var recognition = new webkitSpeechRecognition();
    localrecorder = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    toast.info("Recording Started");
    recognition.onerror = function (event) {
      // console.log("error", event);
    };

    recognition.onend = function () {
      if (hasRecordingStoped) {
        localrecorder = null;
        toast.info("Recording Stopped");
      } else {
        recognition.start();
      }
    };

    recognition.onresult = function (event) {
      if (event.error == "no-speech") {
        recognition.start();
      }
      if (typeof event.results == "undefined") {
        recognition.onend = null;
        recognition.stop();
        return;
      }
      try {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (
            event.results[i].isFinal &&
            event.results[i][0] !== undefined &&
            event.results[i][0].transcript !== ""
          ) {
            let sestran = sessionStorage.getItem("transcript")
            sessionStorage.setItem("transcript", sestran !== null ? sestran + " " + event.results[i][0].transcript : "")
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    recognition.start();
  };

  const stopRecording = () => {
    toast.info("Recording stopped!");
    hasRecordingStoped = true;
    if (localrecorder) {
      localrecorder.stop();
    }
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
      handleOutputChange({ output: capturedOutput });
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
    setMystream(stream);
  };

  const verifyPerson = async () => {
    const track = mystream2.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    try {
      const photoBlob = await imageCapture.takePhoto();

      const formData = new FormData();
      formData.append("fileContent", photoBlob, "filename.png");
      formData.append("userid", candidateId ? candidateId : candidateId2);

      const token = localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      };

      const response = await axios.post(
        "/api/interviewee/confirmuser",
        formData,
        {
          headers: headers,
        }
      );

      if (!response.data.success) {
        toast.error("Candidate Face Does Not Match");
      }
      // Now you can use formData for your further processing
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const verifyNoOfPeople = async () => {
    let detector;
    try {
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        maxFaces: 2,
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
      };
      detector = await faceDetection.createDetector(model, detectorConfig);
      const track = mystream2.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      try {
        const photo = await imageCapture.grabFrame();
        const faces = await detector.estimateFaces(photo, {
          flipHorizontal: false,
        });
        console.log(faces.length);
        if (faces.length < 1) {
          toast.info("Candidate Not In Frame!!!");
        } else if (faces.length > 1) {
          toast.error("More Than One Face Detected!!!");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error estimation faces!");
      }
    } catch (error) {
      toast.error("Error Initializing Face Detector!");
    }
  };

  const calculateTopicCovered = async () => {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, 10000)
    );
    const localtranscript = sessionStorage.getItem("transcript")
    let topicsCoveredx;
    topicsCoveredx = topicsCovered.map((t) => {
      return {
        title: t.title,
        covered: localtranscript ? localtranscript.toLowerCase().includes(t.title.toLowerCase()) : false
      };
    });
    setTopicsCovered(topicsCoveredx);
  };

  const startValidating = () => {
    setInterval(() => {
      // verifyNoOfPeople();
    }, 3000);
    setInterval(() => {
      // verifyPerson();
    }, 10000);
  };

  const handleBeforeUnload = () => {
    if (mystream2) {
      console.log("stoping tracks");
      const tracks = mystream2.getTracks();
      tracks.forEach(async (track) => await track.stop());
    }
    if (mystream) {
      console.log("stoping tracks");
      const tracks = mystream.getTracks();
      tracks.forEach(async (track) => await track.stop());
    }
    setRemoteStream(null);
    removeAvailablity();
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };
    const response = await axios.post(
      "/api/interviewee/submitreview",
      {
        candidateId: candidateId2 ? candidateId2 : candidateId,
        interviewerid: JSON.parse(localStorage.getItem("user"))._id,
        topics: topics.map((t) => {
          return {
            topicName: t.title,
            topicRating: t.rating,
          };
        }),
        roleName: roleName
      },
      {
        headers: headers,
      }
    );
    sessionStorage.clear()
    socket.emit("room:end", { room: roomid, interviewid: response.data.interview })
    setAbleToEnd(true);
  };

  const endInterview = async () => {
    console.log("ending interview");
    handleBeforeUnload()
    await calculateTopicCovered();
    // router.push("/interviewer");
  };

  const getRole = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };
    const response = await axios.post(
      "/api/interviewee/getrole",
      {
        roleid: roleid,
      },
      {
        headers: headers,
      }
    );
    setRoleName(response.data.role.role)
    const topics = response.data.role.topics;
    const updatedTopics = topics.map((t) => {
      return {
        ...t,
        rating: 0,
      };
    });
    setTopics(updatedTopics);
    const topicsCoveredx = topics.map((t) => {
      return {
        title: t.title,
        covered: null,
      };
    });
    setTopicsCovered(topicsCoveredx);
  };

  const addAvailablity = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };
    await axios.post(
      "/api/interviewee/addAvailability",
      {
        roleid: roleid,
        roomId: roomid,
      },
      {
        headers: headers,
      }
    );
  };

  const removeAvailablity = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    };
    const response = await axios.post(
      "/api/interviewee/removeAvailability",
      {
        roleid: roleid,
      },
      {
        headers: headers,
      }
    );
  };

  const joinRoom = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    socket.emit("room:join", { room: roomid, userid: user._id });
  };

  const handleUserJoined = useCallback(async (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const { userid, from } = data;
    socket.emit("inter:details", {
      to: from,
      userid: user._id,
    });
    setCandidateId(userid);
    candidateId2 = userid;
    setRemoteStream(mystream2);
    startRecording();
    startValidating();
    removeAvailablity();
    // create offer and emit socket event
  }, []);

  const handleUserLeftWindow = () => {
    toast.error("Candidate Switched Window");
  };

  const handleUserCameBack = () => {
    toast.info("Candidate Switched Back");
  };

  // const sendStreams = useCallback(async () => {
  //   console.log("sending tracks")
  //   for (const track of await mystream2.getTracks()) {
  //     peer1.peer.addTrack(track, mystream2);
  //   }
  // }, [mystream2]);

  // const handleAcceptedCall = useCallback(
  //   async (data) => {
  //     console.log("setting local description")
  //     const { ans } = data;
  //     await peer1.setLocalDescription(ans);
  //     sendStreams();
  //   },
  //   [sendStreams]
  // );

  // const handleincommingcall = useCallback(async (data) => {
  //   console.log("incomming call")
  //   const { offer, from } = data;
  //   const ans = await peer2.getAnswer(offer);
  //   socket.emit("call:accepted", { to: from, ans });
  // }, []);

  // const handleNegoNeeded = useCallback(async () => {
  //   console.log("negotiation needed")
  //   const newoffer = await peer1.getOffer();
  //   socket.emit("peer:nego:needed", {
  //     room: params.roomid,
  //     offer: newoffer,
  //   });
  // }, []);

  // const handleNegoFinal = useCallback(async ({ from, ans }) => {
  //   console.log("negotiation done", ans);
  //   await peer1.setLocalDescription(ans);
  // }, []);

  // const handleincomingtracks = (ev) => {
  //   const remoteStream = ev.streams;
  //   console.log("setting remote stream", remoteStream);
  //   setRemoteStream(remoteStream[0]);
  // };

  // const handlenegotiationneeded = useCallback(async (data) => {
  //   console.log("nego needed, creating ans")
  //   const { offer, from } = data;
  //   const ans = await peer2.getAnswer(offer);
  //   socket.emit("peer:nego:done", { to: from, ans });
  // }, []);

  // useEffect(() => {
  //   peer2.peer.addEventListener("track", handleincomingtracks);
  //   return () => {
  //     peer2.peer.removeEventListener("track", handleincomingtracks);
  //   }
  // }, []);

  // useEffect(() => {
  //   peer1.peer.addEventListener("negotiationneeded", handleNegoNeeded);
  //   return () => {
  //     peer1.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  //   };
  // }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("code:changed", handleCodeChange);
    socket.on("output:changed", handleOutputChange);
    socket.on("draw:changed", handleDrawChange);
    socket.on("user:leftwindow", handleUserLeftWindow);
    socket.on("user:joinedwindow", handleUserCameBack);
    // socket.on("incomming:call", handleincommingcall);
    // socket.on("accepted:call", handleAcceptedCall);
    // socket.on("peer:nego:needed", handlenegotiationneeded);
    // socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("code:changed", handleCodeChange);
      socket.off("user:joined", handleUserJoined);
      socket.off("output:changed", handleOutputChange);
      socket.off("draw:changed", handleDrawChange);
      socket.off("user:leftwindow", handleUserLeftWindow);
      socket.off("user:joinedwindow", handleUserCameBack);
      // socket.off("incomming:call", handleincommingcall);
      // socket.off("accepted:call", handleAcceptedCall);
      // socket.off("peer:nego:needed", handlenegotiationneeded);
      // socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [socket]);

  useEffect(() => {
    joinRoom();
    addAvailablity();
    getRole();
    setRoomId(roomId);
    getmyStream();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (topics) {
      const hasZeroRating = topics.filter((topic) => topic.rating <= 0);
      if (!hasZeroRating || hasZeroRating.length === 0) {
        setAbleToReview(true);
      }
    }
  }, [topics]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="h-screen p-2 bg-background text-foreground overflow-x-hidden overflow-y-scroll hidescroll text-center">
          <div className="border-2 rounded-lg overflow-hidden border-foreground px-0 font-cubano text-center bg-foreground text-background">
            {mystream && (
              <ReactPlayer
                height={"20%"}
                playing
                muted
                width={"100%"}
                url={mystream}
              />
            )}
            {!mystream && (
              <Skeleton className="w-[100%] h-[250px] rounded-lg" />
            )}
            Your Stream
          </div>
          <div className="border-2 rounded-lg overflow-hidden border-foreground px-0 font-cubano text-center mt-2 bg-foreground text-background">
            {remoteStream && (
              <ReactPlayer
                height={"20%"}
                playing
                muted
                width={"100%"}
                url={remoteStream}
              />
            )}
            {!remoteStream && (
              <Skeleton className="w-[100%] h-[250px] rounded-lg" />
            )}
            Candidate Stream
          </div>
          <AlertDialog>
            <AlertDialogTrigger className="py-2 px-3 bg-foreground text-background rounded-lg">
              Topics
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Some Heads Up!</AlertDialogTitle>
                <AlertDialogDescription>
                  You have to complete the following topics in the interview
                  <Accordion type="multiple" collapsible className="">
                    {!!topics &&
                      topics.length > 0 &&
                      topics.map((t) => {
                        return (
                          <AccordionItem value={t._id} className="">
                            <AccordionTrigger className="text-xl font-cubano">
                              {t.title}
                            </AccordionTrigger>
                            <AccordionContent>{t.description}</AccordionContent>
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant={"default"} onClick={stopRecording} className="m-2">
            {!hasRecordingStoped ? "Mute" : "Unmute"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              onClick={endInterview}
              className="py-2 px-3 bg-red-500 text-background rounded-lg"
            >
              End Interview
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Review this Interview</AlertDialogTitle>
                <AlertDialogDescription className="w-full">
                  <Tabs defaultValue="rate-candidate" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="rate-candidate" className="w-1/2">
                        Rate Candidate
                      </TabsTrigger>
                      <TabsTrigger value="topics-covered" className="w-1/2">
                        Topics Covered
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="rate-candidate">
                      {topics &&
                        topics.map((t) => {
                          return (
                            <div className="flex flex-col items-start mb-2">
                              <div className="font-cubano">{t.title}</div>
                              <Rating
                                SVGstyle={{
                                  display: "inline",
                                  height: "2rem",
                                  width: "2rem",
                                }}
                                onClick={(e) =>
                                  setTopics((prevTopics) =>
                                    prevTopics.map((topic) =>
                                      topic._id === t._id
                                        ? { ...topic, rating: e }
                                        : topic
                                    )
                                  )
                                }
                                className="inline"
                                transition
                                allowFraction={false}
                              />
                            </div>
                          );
                        })}
                      <Button onClick={submitReview} disabled={!ableToReview}>
                        Review
                      </Button>
                    </TabsContent>
                    <TabsContent value="topics-covered">
                      <div className="p-5 flex flex-col gap-2">
                        {topicsCovered &&
                          topicsCovered.map((topic) => {
                            return (
                              <div className="flex justify-between rounded-md items-center align-middle font-cubano">
                                <div className="text-xl">{topic.title}</div>
                                {topic.covered === null ? (
                                  <div>
                                    <svg
                                      class="w-7 aspect-square text-background animate-spin fill-primary"
                                      viewBox="0 0 100 101"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                      />
                                      <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                      />
                                    </svg>
                                  </div>
                                ) : topic.covered === true ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    x="0px"
                                    y="0px"
                                    className="w-7 aspect-square"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      fill="#c8e6c9"
                                      d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                                    ></path>
                                    <path
                                      fill="#4caf50"
                                      d="M34.586,14.586l-13.57,13.586l-5.602-5.586l-2.828,2.828l8.434,8.414l16.395-16.414L34.586,14.586z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    x="0px"
                                    y="0px"
                                    className="w-7 aspect-square"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      className="fill-red-300"
                                      d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                                    ></path>
                                    <path
                                      className="fill-background"
                                      d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"
                                    ></path>
                                    <path
                                      className="fill-background"
                                      d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"
                                    ></path>
                                  </svg>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>
                  </Tabs>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button disabled={!ableToEnd} onClick={()=>router.push('/')}>
                  <AlertDialogAction className="p-0">
                    Continue
                  </AlertDialogAction>
                </Button>
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
                      value={code}
                      readOnly={true}
                      theme={abcdefInit({
                        settings: {
                          caret: "#c6c6c6",
                          fontFamily: "monospace",
                        },
                        styles: [{ tag: t.comment, color: "#6272a4" }],
                      })}
                      extensions={[javascript({ jsx: true })]}
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
                  data={draw}
                  viewOnly={true}
                  height={620}
                  width={1000}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Page;
