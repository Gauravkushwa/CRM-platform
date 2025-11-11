import { io } from 'socket.io-client'


let socket
export const initSocket = (url) => {
socket = io(url, { autoConnect: false })
return socket
}


export const getSocket = () => socket