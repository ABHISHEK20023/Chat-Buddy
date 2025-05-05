import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { use } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState();
    const [user, setUser] = useState();
    const [notification, setNotification] = useState([]);
    const [chats, setChats] = useState([]);
    const [videoCallChat, setVideoCallChat] = useState("");
    const [remoteStream,
        setRemoteStream]=useState(null);
    const [isCallPicked, setIsCallPicked] = useState(true);
    const [isCaller, setIsCaller] = useState(false);
    const [calleStream, setCalleStream] = useState(null)
    const [offer, setOffer] = useState();
    const [Peer, setPeer] = useState();
    const Navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if (!userInfo) Navigate('/');
    }, [Navigate]);

    return (
        <ChatContext.Provider
            value={{
                selectedChat,
                setSelectedChat,
                user,
                setUser,
                notification,
                setNotification,
                chats,
                setChats,
                videoCallChat,
                setVideoCallChat,
                isCallPicked,
                setIsCallPicked,
                offer,
                setOffer,
                Peer,
                setPeer,
                isCaller,
                setIsCaller,
                calleStream,
                setCalleStream,
                remoteStream,
                setRemoteStream
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;