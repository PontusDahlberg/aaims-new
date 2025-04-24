"use client";

import { useState, useEffect } from 'react';
import { botConfig } from '@/config/bot-config';

export default function MeetBot({ meetingId, isActive, voiceEnabled }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [meetingContext, setMeetingContext] = useState({});

  useEffect(() => {
    if (!isActive) return;

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = botConfig.language;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      if (shouldBotRespond(transcript)) {
        handleBotResponse(transcript);
      }
    };

    setIsListening(true);
    recognition.start();

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  }, [isActive]);

  const shouldBotRespond = (text) => {
    return botConfig.triggers.nameCall.some(trigger => 
      text.toLowerCase().includes(trigger)
    );
  };

  const handleBotResponse = async (text) => {
    try {
      const response = await fetch('/api/bot-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: text,
          meetingContext,
          meetingId 
        })
      });

      const data = await response.json();
      
      if (data.raiseHand) {
        raiseHand();
      }

      if (data.reply) {
        if (voiceEnabled) {
          speakResponse(data.reply);
        } else {
          sendChatMessage(data.reply);
        }
      }
    } catch (error) {
      console.error('Bot response error:', error);
    }
  };

  // ... Implementera raiseHand, speakResponse, sendChatMessage ...

  return null; // Bot körs i bakgrunden
}
