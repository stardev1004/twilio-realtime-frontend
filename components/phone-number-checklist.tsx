// PhoneNumberChecklist.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type PhoneNumberChecklistProps = {
  selectedPhoneNumber: string;
};

const PhoneNumberChecklist: React.FC<PhoneNumberChecklistProps> = ({
  selectedPhoneNumber,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState(selectedPhoneNumber);

  // Update phone number when prop changes
  useEffect(() => {
    setPhoneNumber(selectedPhoneNumber);
  }, [selectedPhoneNumber]);

  // Try to fetch phone number from API if not provided
  useEffect(() => {
    if (!phoneNumber) {
      fetch("/api/twilio/numbers")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPhoneNumber(data[0].friendlyName || "");
          }
        })
        .catch((err) => console.error("Error fetching phone numbers:", err));
    }
  }, [phoneNumber]);

  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Twilio Phone Number</span>
        <div className="flex items-center">
          <span className="font-medium w-36">
            {isVisible ? phoneNumber || "None" : "••••••••••"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(!isVisible)}
            className="h-8 w-8"
          >
            {isVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PhoneNumberChecklist;
