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

      // 🔥 JOIN (PRODUCTION FIX)
      if (handlers?.userId && handlers?.sessionId) {
        stompClient.publish({
          destination: "/app/join",
          body: JSON.stringify({
            roomId,
            userId: handlers.userId, // real user
            sessionId: handlers.sessionId, // unique tab
          }),
        });
      }

      // ✅ CODE
      stompClient.subscribe(`/topic/code/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        if (!handlers?.onCode) return;
        handlers.onCode(data);
      });

      // ✅ TYPING
      stompClient.subscribe(`/topic/typing/${roomId}`, (message) => {
        if (!handlers?.onTyping) return;
        handlers.onTyping(JSON.parse(message.body));
      });

      // ✅ USERS
      stompClient.subscribe(`/topic/users/${roomId}`, (message) => {
        if (!handlers?.onUsers) return;
        handlers.onUsers(JSON.parse(message.body));
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

      // ✅ DRAW (ADD THIS)
      stompClient.subscribe(`/topic/draw`, (message) => {
        if (!handlers?.onDraw) return;
        handlers.onDraw(JSON.parse(message.body));
      });

      // ✅ VIEW SYNC
      stompClient.subscribe(`/topic/view`, (message) => {
        if (!handlers?.onView) return;
        handlers.onView(JSON.parse(message.body));
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
    body: JSON.stringify({ roomId, code, userId }),
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
    body: JSON.stringify({ roomId, ...payload }),
  });
};

// ✅ SEND LANGUAGE
export const sendLanguage = (roomId, payload) => {
  publishSafe({
    destination: "/app/language",
    body: JSON.stringify({ roomId, ...payload }),
  });
};

// ✅ SEND RUN
export const sendRun = (roomId, payload) => {
  publishSafe({
    destination: "/app/run",
    body: JSON.stringify({ roomId, ...payload }),
  });
};

// 🔥 DRAW EVENTS (STOMP VERSION)

// send draw
export const sendDraw = (roomId, data) => {
  publishSafe({
    destination: "/app/draw",
    body: JSON.stringify({ roomId, ...data }),
  });
};

export const sendView = (roomId, data) => {
  publishSafe({
    destination: "/app/view",
    body: JSON.stringify({ roomId, ...data }),
  });
};

// listen draw
export const onDraw = (roomId, callback) => {
  if (!stompClient) return;

  stompClient.subscribe(`/topic/draw/${roomId}`, (message) => {
    callback(JSON.parse(message.body));
  });
};
