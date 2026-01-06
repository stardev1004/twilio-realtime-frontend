"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/top-bar";
import SessionConfigurationPanel from "@/components/session-configuration-panel";
import Transcript from "@/components/transcript";
import FunctionCallsPanel from "@/components/function-calls-panel";
import { Item } from "@/components/types";
import handleRealtimeEvent from "@/lib/handle-realtime-event";
import PhoneNumberChecklist from "@/components/phone-number-checklist";

const CallInterface = () => {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [callStatus, setCallStatus] = useState("disconnected");
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Auto-connect to WebSocket on component mount
  useEffect(() => {
    // Use ws:// for non-SSL or wss:// for SSL connection
    // Change to ws:// if your VPS doesn't have SSL configured
    const wsUrl = "ws://209.159.159.206:8082/logs";
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log("Connected to logs websocket");
      setCallStatus("connected");
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received logs event:", data);
      handleRealtimeEvent(data, setItems);
    };

    newWs.onclose = () => {
      console.log("Logs websocket disconnected");
      setCallStatus("disconnected");
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
      setCallStatus("error");
    };

    setWs(newWs);

    // Cleanup on unmount
    return () => {
      if (newWs.readyState === WebSocket.OPEN || newWs.readyState === WebSocket.CONNECTING) {
        newWs.close();
      }
    };
  }, []); // Empty dependency array - only run on mount

  return (
    <div className="h-screen bg-white flex flex-col">
      <TopBar />
      <div className="flex-grow p-4 h-full overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column */}
          <div className="col-span-3 flex flex-col h-full overflow-hidden">
            <SessionConfigurationPanel
              callStatus={callStatus}
              onSave={(config) => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                  const updateEvent = {
                    type: "session.update",
                    session: {
                      ...config,
                    },
                  };
                  console.log("Sending update event:", updateEvent);
                  ws.send(JSON.stringify(updateEvent));
                }
              }}
            />
          </div>

          {/* Middle Column: Transcript */}
          <div className="col-span-6 flex flex-col gap-4 h-full overflow-hidden">
            <PhoneNumberChecklist
              selectedPhoneNumber={selectedPhoneNumber}
            />
            <Transcript items={items} />
          </div>

          {/* Right Column: Function Calls */}
          <div className="col-span-3 flex flex-col h-full overflow-hidden">
            <FunctionCallsPanel items={items} ws={ws} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
