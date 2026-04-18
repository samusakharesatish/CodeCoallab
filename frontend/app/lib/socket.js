"use client";

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
      // lib/socket.js - Inside connectSocket
stompClient.subscribe(`/topic/code/${roomId}`, (message) => {
  const data = JSON.parse(message.body);
  if (!handlers?.onCode) return;
  // Pass the whole data object so we can check the userId
  handlers.onCode(data); 
});

      // ✅ TYPING
      stompClient.subscribe(`/topic/typing/${roomId}`, (message) => {
        if (!handlers?.onTyping) return;
        handlers.onTyping(JSON.parse(message.body));
      });

      // ✅ CHAT
      stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        if (!handlers?.onChat) return;
        handlers.onChat(JSON.parse(message.body));
      });

      // ✅ LANGUAGE
      stompClient.subscribe(`/topic/language/${roomId}`, (message) => {
        if (!handlers?.onLanguage) return;
        handlers.onLanguage(JSON.parse(message.body));
      });

      // ✅ RUN OUTPUT
      stompClient.subscribe(`/topic/run/${roomId}`, (message) => {
        if (!handlers?.onRun) return;
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

const publishSafe = (message) => {
  if (!isConnected || !stompClient) {
    messageQueue.push(message);
    return;
  }
  stompClient.publish(message);
};

// ✅ SEND CODE
export const sendCode = (code, roomId, userId) => {
  publishSafe({
    destination: "/app/code",
    body: JSON.stringify({
      roomId,
      code,
      userId,
    }),
  });
};

// ✅ SEND TYPING
export const sendTyping = (roomId, userId, isTyping) => {
  publishSafe({
    destination: "/app/typing",
    body: JSON.stringify({ roomId, userId, isTyping }),
  });
};

// ✅ SEND CHAT
export const sendChat = (roomId, payload) => {
  publishSafe({
    destination: "/app/chat",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  });
};

// ✅ SEND LANGUAGE
export const sendLanguage = (roomId, payload) => {
  publishSafe({
    destination: "/app/language",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  });
};

// ✅ SEND RUN
export const sendRun = (roomId, payload) => {
  publishSafe({
    destination: "/app/run",
    body: JSON.stringify({
      roomId,
      ...payload,
    }),
  });
};