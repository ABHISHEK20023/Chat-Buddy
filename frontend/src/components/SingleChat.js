import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { IoIosVideocam } from "react-icons/io";
import { FcVideoCall } from "react-icons/fc";
import { FcNoVideo } from "react-icons/fc";
import io from "socket.io-client";
import peer from "../config/peer";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import VideoCall from "./VideoCall";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const msgref = useRef(null)
    const toast = useToast();
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    const { selectedChat, setSelectedChat, user, notification, setNotification, videoCallChat, setVideoCallChat, setIsCallPicked, offer,
        setOffer, Peer,
        setPeer, isCaller,
        setIsCaller, calleStream, setCalleStream, remoteStream,
        setRemoteStream } =
        ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    async function handleVideoCall() {
        setIsCaller(true);
        if (!Peer) {
            setPeer(peer);
        }
        setVideoCallChat(selectedChat)
    }

    const handleTrackEvent = (event) => {
        console.log("Received remote stream:", event.streams[0]);

        if (event.streams) {
            const [remoteStreams] = event.streams;
            setRemoteStream(remoteStreams);
        }
    };
    
    useEffect(() => {
        if (!peer) return;

        const handleIceCandidate = (event) => {
            if (event.candidate) {
                // console.log("Sending ICE candidate:", event.candidate);
                socket.emit("new-ice-candidate",
                    event.candidate, // Convert to plain object
                    getSenderFull(user, videoCallChat?.users)._id
                );
            } else {
                console.log("No more ICE candidates");
            }
        };

        peer.peer.onicecandidate = handleIceCandidate;
    }, [socket, videoCallChat, user, Peer]);

    useEffect(() => {
        socket = io.connect('http://localhost:5000');
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        peer.peer.addEventListener('track', handleTrackEvent);

        socket.on("user-calling", async (videCallingChat,offer) => {
            if(!Peer){
                setPeer(peer);
            }
            setIsCallPicked(false);
            setOffer(offer);
            console.log("offer received : ",offer)
            const stream = await peer.medidStream();
            setCalleStream(stream);
            await peer.peer.setRemoteDescription(new RTCSessionDescription(offer));
            setSelectedChat(videCallingChat);
            setVideoCallChat(videCallingChat);
        })

        

        socket.on("new-ice-candidate", async (candidate) => {
            try {
                if (candidate) {
                    await peer.addIceCandidate(candidate);
                }
            } catch (error) {
                console.error("Error adding ICE candidate 2 :", error);
            }
        });

        return ()=>{
            socket.off("connected", () => setSocketConnected(true));
            socket.off("typing", () => setIsTyping(true));
            socket.off("stop typing", () => setIsTyping(false));

            socket.off("user-calling");
            socket.off("call accepted");
            socket.off("new-ice-candidate");
        }
        // eslint-disable-next-line
    }, [socket]);



    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
        return ()=>{
            socket.off("message recieved")
        }
    },[]);

    useEffect(() => {
        // Scroll to the bottom whenever messages change
        if (msgref.current) {
            msgref.current.scrollTop = msgref.current.scrollHeight;
        }
    }, [messages]);

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {messages &&
                            (!selectedChat.isGroupChat ? (
                                <>
                                    {/* {getSender(user, selectedChat.users)} */}
                                    <ProfileModal
                                        user={getSenderFull(user, selectedChat.users)}
                                    />
                                    <IconButton aria-label="Video Call">
                                        {videoCallChat && videoCallChat?._id === selectedChat?._id ? (
                                            <FcVideoCall />
                                        ) : (
                                            videoCallChat ? (
                                                <FcNoVideo />
                                            ) : (
                                                <IoIosVideocam onClick={handleVideoCall} />
                                            )
                                        )}

                                    </IconButton>
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </>
                            ))}
                    </Text>
                    {videoCallChat && videoCallChat?._id === selectedChat?._id ? (<VideoCall socket={socket} />) : (<Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <div className="messages" ref={msgref}>
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <FormControl
                            onKeyDown={sendMessage}
                            id="first-name"
                            isRequired
                            mt={3}
                        >
                            {istyping ? (
                                <div>
                                    <Lottie
                                        options={defaultOptions}
                                        // height={50}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box >)}
                </>
            ) : (
                // to get socket.io on same page
                <Box display="flex" alignItems="center" justifyContent="center" h="100%" >
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>
                </Box >
            )}
        </>
    );
};

export default SingleChat;