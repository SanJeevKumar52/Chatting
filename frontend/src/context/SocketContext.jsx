import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuthContext();

    useEffect(() => {
        if (authUser) {
            // Establish a new socket connection
            const socketInstance = io("http://localhost:5000", {
                query: { userId: authUser._id },
            });

            // Set the socket instance in state
            setSocket(socketInstance);

            // Listen for 'getOnlineUsers' event from server
            socketInstance.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            // Clean up the socket connection on component unmount or when authUser changes
            return () => {
                socketInstance.close();
                setSocket(null);
            };
        } else {
            // Clean up the socket connection if authUser is null
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]); // Ensure authUser is in the dependency array

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
