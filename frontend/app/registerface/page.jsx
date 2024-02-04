"use client";
import React, { useEffect, useRef, useState } from 'react';
import '@mediapipe/face_detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';
import { toast } from "sonner"
import axios from 'axios'
import { useRouter } from 'next/navigation'

const Page = () => {
    const router = useRouter()
    const videoRef = useRef(null);
    const photoref = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(false);
    const [isphotoverified, setIsphotoverified] = useState(false)
    const [booked, setBooked] = useState(false)

    const getVideo = () => {
        if (navigator.mediaDevices) {
            navigator.mediaDevices
                .getUserMedia({
                    video: { facingMode: 'user', width: 720, height: 720 },
                    audio: false
                })
                .then((stream) => {
                    let video = videoRef.current;
                    video.srcObject = stream;
                    video.onloadedmetadata = () => {
                        video.play();
                    };
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            toast.error('getUserMedia is not supported in this browser.');
        }
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const photo = photoref.current;

        let ctx = photo.getContext('2d');
        const aspectRatio = video.videoWidth / video.videoHeight;

        const canvasWidth = 720;
        const canvasHeight = canvasWidth / aspectRatio;

        photo.width = canvasWidth;
        photo.height = canvasHeight;

        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

        setHasPhoto(true);
    };

    const clearCanvas = () => {
        setBooked(false)
        setIsphotoverified(false)
        const photo = photoref.current;
        let ctx = photo.getContext('2d');
        ctx.clearRect(0, 0, photo.width, photo.height);
        setHasPhoto(false);
        getVideo();
    };

    const verifyPhoto = async () => {
        let detector;
        try {
            const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
            const detectorConfig = {
                maxFaces: 2,
                runtime: 'mediapipe',
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
            };
            detector = await faceDetection.createDetector(model, detectorConfig);
            try {
                const photo = photoref.current;
                const estimationConfig = { flipHorizontal: false };
                const faces = await detector.estimateFaces(photo, estimationConfig);
                if (faces.length < 1) {
                    toast.error("No Face Detected!");
                    clearCanvas();
                }
                else if (faces.length > 1) {
                    toast.error("Too Many Face Detected!");
                    clearCanvas();
                }
                else {
                    toast.success("Face Verified!");
                    setIsphotoverified(true)
                }
            } catch (error) {
                toast.error("Error estimation faces!");
                clearCanvas();
            }
        } catch (error) {
            toast.error("Error Initializing Face Detector!");
            clearCanvas();
        }
    }

    const bookevent = async () => {
        if (!isphotoverified) {
            toast.error("Please verify your face first.");
            return;
        }
        if (booked) {
            toast.error("Please wait...");
            return;
        }
        toast.info("Face is being registered...");

        try {
            setBooked(true)
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const photoCanvas = photoref.current;
            const formData = new FormData();
            formData.append("fileContent", dataURLtoFile(photoCanvas.toDataURL()));
            formData.append("id", user._id);

            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "69420"
            };

            const response = await axios.post("/api/candidate/registerface", formData, {
                headers: headers,
            });
            if (response.status === 200 && response.data.success === true) {
                localStorage.setItem("user", JSON.stringify(response.data.user))
                toast.success("Face Registered!");
                setTimeout(() => {
                    router.push("/")
                }, 500);
            }
            else if (response.status === 200 && response.data.success === false) {
                toast.error(response.data.message);
                clearCanvas()
            } 
            else {
                toast.error("Registeration failed. Please try again later.");
                clearCanvas()
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while registering. Please try again later.");
            clearCanvas()
        }
    };

    function dataURLtoFile(dataURL) {
        const arr = dataURL.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], "userPhoto.png", { type: mime });
    }

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('user'));
        let token = localStorage.getItem('token');
        if (!user || !token) {
            window.location = "/login"
        }
        if(user.hasUserId){
            window.location = "/"
        }
        clearCanvas();
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <div className="bg-background h-screen w-full">
                <div className="font-extrabold font-cubano text-3xl text-center p-5 md:mb-16">Register Face</div>
                <div className="md:flex md:justify-center">
                    <div className="border-8 border-border rounded-md">
                        <div className="aspect-square md:h-96 overflow-hidden">
                            {!hasPhoto && (
                                <>
                                    <video ref={videoRef}></video>
                                    <button className="p-2 -translate-y-12 text-white z-10 bg-gray-500 rounded-md mx-2" onClick={takePhoto}>
                                        Snap!
                                    </button>
                                </>
                            )}
                            <canvas ref={photoref} className="w-full h-auto"></canvas>
                            <div className='flex -translate-y-12'>
                                <button disabled={isphotoverified} onClick={verifyPhoto} className='bg-gray-500 p-2 rounded-md mx-2 disabled:bg-gray-200 text-white'>Confirm</button>
                                <button onClick={clearCanvas} className='bg-gray-500 p-2 rounded-md text-white'>Retake</button>
                            </div>
                        </div>
                    </div>
                    <div className="sm:w-2/3 sm:pl-8 sm:py-8 md:ml-5 mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                        <p className="leading-relaxed text-lg mb-4 text-foreground p-2">Please take photo of your face in proper lighting, This photo will be matched during interview!</p>
                        <div className=''>
                            <button disabled={!isphotoverified} onClick={bookevent} className="inline-flex text-white bg-indigo-600 disabled:bg-indigo-100 items-center border border-indigo-800 p-2 rounded-md ">Confirm Face
                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className='hidden md:block'>
                    <br />
                    <br />
                    <br />
                    <br />
                </div>
            </div>
        </>
    );
};

export default Page;
