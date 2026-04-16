import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;
let messageQueue = [];

export const getClient = () => stompClient;

export const connectSocket = (roomId, handlers) => {
  const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`);

  stompClient = new Client({
    webSocketFactory: () => socket,

    onConnect: () => {
      console.log("Connected ✅");
      isConnected = true;

      // ✅ CODE
      stompClient.subscribe(`/topic/code/${roomId}`, (message) => {
        handlers.onCode(JSON.parse(message.body));
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

      // 🔥 NEW: RUN OUTPUT
      stompClient.subscribe(`/topic/run/${roomId}`, (message) => {
        handlers.onRun(JSON.parse(message.body));
      });

      // ✅ flush queue
      messageQueue.forEach((msg) => stompClient.publish(msg));
      messageQueue = [];
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },
  });

  stompClient.activate();
};

// ✅ SAFE PUBLISH
const publishSafe = (message) => {
  if (!isConnected) {
    messageQueue.push(message);
    return;
  }
  stompClient.publish(message);
};

// ✅ CODE
export const sendCode = (code, roomId, cursorPosition) => {
  publishSafe({
    destination: "/app/code",
    body: JSON.stringify({
      roomId,
      code,
      cursorPosition,
    }),
  });
};

// ✅ TYPING
export const sendTyping = (roomId, userId, isTyping) => {
  publishSafe({
    destination: "/app/typing",
    body: JSON.stringify({ roomId, userId, isTyping }),
  });
};

// ✅ CHAT
export const sendChat = (roomId, payload) => {
  publishSafe({
    destination: "/app/chat",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  });
};

// ✅ LANGUAGE
export const sendLanguage = (roomId, payload) => {
  publishSafe({
    destination: "/app/language",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  });
};

// 🔥 NEW: RUN
export const sendRun = (roomId, payload) => {
  publishSafe({
    destination: "/app/run",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  });
};