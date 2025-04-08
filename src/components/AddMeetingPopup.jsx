"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function AddMeetingPopup({ onClose, darkMode }) {
  const [meetingType, setMeetingType] = useState("digital");
  const [address, setAddress] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMeetingTypeChange = (type) => {
    setMeetingType(type);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleContactSelect = (contact) => {
    setContacts([...contacts, contact]);
  };

  const handleSubmit = async () => {
    // Implement submit logic here
    console.log("Submitting meeting:", { meetingType, address, contacts });
    // onClose();
  };

  const handleMouseDown = (e) => {
    if (cardRef.current) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      document.body.classList.add("grabbing");
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !cardRef.current) return;
    e.preventDefault();
    setPosition((prevPosition) => ({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.classList.remove("grabbing");
  };

  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseup", handleMouseUp);
      card.addEventListener("mouseleave", handleMouseUp);

      return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseup", handleMouseUp);
        card.removeEventListener("mouseleave", handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
      style={{ cursor: "grab" }}
    >
      <Card
        ref={cardRef}
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-white" style={{ cursor: "grab" }}>
          Lägg till nytt möte
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2 text-white">Mötestyp:</label>
          <div className="flex">
            <button
              className={`mr-2 px-4 py-2 rounded ${
                meetingType === "digital" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              onClick={() => handleMeetingTypeChange("digital")}
            >
              Digitalt
            </button>
            <button
              className={`mr-2 px-4 py-2 rounded ${
                meetingType === "physical" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              onClick={() => handleMeetingTypeChange("physical")}
            >
              Fysiskt
            </button>
            <button
              className={`px-4 py-2 rounded ${
                meetingType === "hybrid" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              onClick={() => handleMeetingTypeChange("hybrid")}
            >
              Hybrid
            </button>
          </div>
        </div>

        {meetingType !== "digital" && (
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white">Adress:</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={address}
              onChange={handleAddressChange}
            />
            {address && (
              <div className="mt-2">
                {/* Placeholder for Google Maps preview */}
                Karta här
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2 text-white">Kontakter:</label>
          {/* Implement contact selection here */}
          Välj kontakter
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Skapa möte</Button>
          <Button className="ml-2 bg-red-500 hover:bg-red-700" onClick={onClose}>
            Stäng
          </Button>
        </div>
      </Card>
    </div>
  );
}
