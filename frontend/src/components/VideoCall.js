
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    IconButton,
    Flex,
    Text,
    Button,
    HStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { MdCall } from "react-icons/md";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull } from "../config/ChatLogics";
function VideoCall({ socket }) {
    const toast = useToast(); 
    const MotionIcon = motion(MdCall);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [myStream, setMyStream] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const { selectedChat, setSelectedChat, user, notification, setNotification, videoCallChat, setVideoCallChat, isCallPicked,
        setIsCallPicked, offer, setOffer, Peer, setPeer, isCaller,
        setIsCaller, calleStream, remoteStream,
        setRemoteStream } =
        ChatState();
    const toggleMute = () => setIsMuted(!isMuted);
    const toggleCamera = () => setIsCameraOn(!isCameraOn);
    const endCall = (e) => {
        if(e)
        socket.emit("end call", getSenderFull(user, selectedChat?.users)._id, user._id);
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop()); // Stop all tracks
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        setPeer(null);
        setMyStream(null);
        setRemoteStream(null);
        setIsCallPicked(true);
        setVideoCallChat(null);
        setIsCaller(false);
        
        // alert("Call Ended")
    };
    const handleCallUser = useCallback(async () => {
        try {
           
            if(isCaller){
                const stream = await Peer.medidStream()
                setMyStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                const offer = await Peer.getOffer();
                console.log("video call initiated ", " here is offer : ", offer)
                socket.emit("video-call", selectedChat, getSenderFull(user, selectedChat?.users)._id, user._id, offer);
                console.log("local caller stream : ", stream);

            }else{
                setMyStream(calleStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = calleStream;
                }
                console.log("local calle stream : ", calleStream);

            }
            

            // Add tracks to peer connection if it exists
            
        } catch (error) {
            console.error("Error getting user media:", error);
            toast({
                title: "Media Error",
                description: "Could not access camera/microphone",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [Peer,toast]);

    async function handlePickCall() {
        console.log("call picked");
        setIsCallPicked(true);
        const ans = await Peer.getAnswer(offer);
        console.log("ans created : ",ans)
        socket.emit("call accepted", user._id, getSenderFull(user, videoCallChat?.users)._id, ans);
    }

    useEffect(() => {
        handleCallUser();
        socket.on("call accepted", async (ans) => {
            try {
                console.log("ans received : ",ans)
                await Peer.setRemoteDescription(ans);
            } catch (error) {
                console.error("Error handling call acceptance:", error);
            }
        });

        socket.on("end call",()=>{
            console.log("end call")
            endCall();
        })

        return () => {
            socket.off("call accepted");
            socket.off("end call")
        }
    }, [handleCallUser, Peer, socket]);


    // useEffect(() => {
    //     return () => {
    //         if (myStream) {
    //             myStream.getTracks().forEach(track => track.stop());
    //         }
    //     };
    // }, [myStream]);

    useEffect(() => {
        console.log("something here   : ",remoteStream)
        if (remoteStream && remoteVideoRef.current) {
            console.log("Forcing stream reassignment...");

            // Force reset and reassign the stream
            remoteVideoRef.current.srcObject = null;
            remoteVideoRef.current.srcObject = remoteStream;

            // Try to play the video
            remoteVideoRef.current.play().catch(error => {
                console.error("Autoplay error:", error);
            });
        }
    }, [remoteStream]);

    useEffect(() => {
        if (myStream) {
            myStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
        }
    }, [isMuted]);

    useEffect(() => {
        if (myStream) {
            myStream.getVideoTracks().forEach(track => {
                track.enabled = isCameraOn;
            });
        }
    }, [isCameraOn]);
   

    useEffect(()=>{
        Peer.peer.addEventListener('connectionstatechange', event => {
            if (Peer.peer.connectionState === 'connected') {
                console.log("webRTC connected")
            }
        });

        Peer.peer.oniceconnectionstatechange = () => {
            if (Peer.peer.iceConnectionState === "disconnected") {
                endCall();
                toast({ title: "Call Disconnected", status: "info" });
            }
        };
    },[])

    useEffect(() => {
        return () => {
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
            setVideoCallChat(null);
            setPeer(null);
        };
    }, []);

    // const remoteVideoTrack = remoteStream?.getVideoTracks()?.[0];

    // const isRemoteCameraOff =
    //     !remoteVideoTrack || !remoteVideoTrack.enabled || !remoteVideoTrack?.readyState || remoteVideoTrack.readyState !== "live";
   
    return (

        <Flex height="100%" w="100%" direction="column" bg="gray.900" color="white">
            {/* Header */}
            <Flex justify="space-between" align="center" p={4} bg="gray.800">
                <Text fontSize="xl" fontWeight="bold">Video Call</Text>
                <Button size="sm" colorScheme="red" onClick={endCall}>End Call</Button>
            </Flex>

            {/* Video Container */}
            <Flex flex="1" direction={{ base: "column", md: "row" }} p={4}>
                <Box flex="1" bg="black" borderRadius="md" overflow="hidden" m={2}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted={isMuted}
                        style={{ width: "100%", height: "100%" }}
                    />
                    {!isCameraOn && (
                        <Flex
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            align="center"
                            justify="center"
                            direction="column"
                            bg="transparent"
                            zIndex="10"
                            pointerEvents="none"
                        >
                            <Box
                                w="20"
                                h="20"
                                borderRadius="full"
                                bg="gray.700"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="2xl"
                                fontWeight="bold"
                                color="white"
                            >
                                {user?.name?.[0]?.toUpperCase() || "U"}
                            </Box>
                            <Text mt="2" fontSize="md" color="whiteAlpha.900">
                                {user?.name || "Camera Off"}
                            </Text>
                        </Flex>
                    )}
                </Box>

                <Box flex="1" bg="black" borderRadius="md" overflow="hidden" m={2}>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        style={{ width: "100%", height: "100%" }}
                    />
                    {/* {isRemoteCameraOff && (
                        <Flex
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            align="center"
                            justify="center"
                            direction="column"
                            bg="blackAlpha.800"
                            zIndex="10"
                            pointerEvents="none"
                        >
                            <Box
                                w="20"
                                h="20"
                                borderRadius="full"
                                bg="gray.700"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="2xl"
                                fontWeight="bold"
                                color="white"
                            >
                                {getSenderFull(user, selectedChat?.users)?.name?.[0]?.toUpperCase() || "U"}
                            </Box>
                            <Text mt="2" fontSize="md" color="whiteAlpha.900">
                                {getSenderFull(user, selectedChat?.users)?.name || "Camera Off"}
                            </Text>
                        </Flex>
                    )} */}

                </Box>
            </Flex>

            {/* Controls */}
            {isCallPicked ?
                (<HStack spacing={6} justify="center" p={4} bg="gray.800">
                    <IconButton
                        aria-label="Toggle Mute"
                        icon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        colorScheme={isMuted ? "red" : "green"}
                        onClick={toggleMute}
                    />
                    <IconButton
                        aria-label="Toggle Camera"
                        icon={isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        colorScheme={isCameraOn ? "blue" : "red"}
                        onClick={toggleCamera}
                    />
                    <IconButton
                        aria-label="End Call"
                        icon={<FaPhoneSlash />}
                        colorScheme="red"
                        onClick={endCall}
                    />
                </HStack>) :
                <Button
                    onClick={handlePickCall}
                    size="lg"
                    px="8"
                    py="6"
                    fontSize="18px"
                    color="white"
                    bgGradient="linear(to-r, green.400, teal.500)"
                    _hover={{ bgGradient: "linear(to-r, teal.500, green.400)" }}
                    _active={{ bgGradient: "linear(to-r, green.500, teal.600)" }}
                    boxShadow="0 8px 15px rgba(0, 0, 0, 0.1)"
                    //   borderRadius="full"
                    display="flex"
                    alignItems="center"
                    gap="3"
                >
                    <Box>
                        <MotionIcon
                            style={{ fontSize: "24px" }}
                            animate={{ x: [0, -5, 5, -5, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity, repeatType: "loop" }}
                        />
                    </Box>
                    <Text>Pick Call</Text>
                </Button>

            }
        </Flex>
    )
}

export default VideoCall