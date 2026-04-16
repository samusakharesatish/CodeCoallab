import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;
let messageQueue = [];

export const getClient = () => stompClient;

export const connectSocket = (roomId, handlers) => {
  const token = localStorage.getItem("token"); // ✅ NEW

  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,

    connectHeaders: {
      Authorization: `Bearer ${token}`, // ✅ IMPORTANT
    },

    onConnect: () => {
      console.log("Connected ✅");
      isConnected = true;

      // ✅ CODE
      stompClient.subscribe(`/topic/code/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        handlers.onCode(data);
      });

      // ✅ TYPING
      stompClient.subscribe(`/topic/typing/${roomId}`, (message) => {
        handlers.onTyping(JSON.parse(message.body));
      });

      // ✅ CHAT
      stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        handlers.onChat(JSON.parse(message.body));
      });

      // ✅ LANGUAGE
      stompClient.subscribe(`/topic/language/${roomId}`, (message) => {
        handlers.onLanguage(JSON.parse(message.body));
      });

      // ✅ send queued messages
      messageQueue.forEach((msg) => stompClient.publish(msg));
      messageQueue = [];
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    },
  });

  stompClient.activate();
};

//
// ✅ SAFE PUBLISH HELPER
//
const publishSafe = (message) => {
  if (!isConnected) {
    messageQueue.push(message);
    return;
  }
  stompClient.publish(message);
};

//
// ✅ CODE (userId REMOVED 🔥)
//
export const sendCode = (code, roomId, cursorPosition) => {
  const payload = {
    roomId,
    cursorPosition,
    code: code ?? "",
  };

  publishSafe({
    destination: "/app/code",
    body: JSON.stringify(payload),
  });
};

//
// ✅ TYPING (userId REMOVED)
//
export const sendTyping = (roomId, isTyping) => {
  publishSafe({
    destination: "/app/typing",
    body: JSON.stringify({ roomId, isTyping }),
  });
};

//
// ✅ CHAT (userId REMOVED)
//
export const sendChat = (roomId, payload) => {
  const message = {
    destination: "/app/chat",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  };

  if (!isConnected) {
    messageQueue.push(message);
    return;
  }

  stompClient.publish({
    destination: message.destination,
    body: message.body,
  });
};
//
// ✅ LANGUAGE
//
export const sendLanguage = (roomId, language) => {
  publishSafe({
    destination: "/app/language",
    body: JSON.stringify({ roomId, language }),
  });
};