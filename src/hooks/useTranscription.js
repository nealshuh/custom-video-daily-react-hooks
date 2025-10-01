import { useState, useCallback } from 'react';
import { useDailyEvent, useDaily, useParticipants } from '@daily-co/daily-react';

export default function useTranscription() {
  const [transcriptionMessages, setTranscriptionMessages] = useState([]);
  const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const daily = useDaily();
  const participants = useParticipants();

  // Listen for transcription events
  useDailyEvent(
    'transcription-message',
    useCallback((ev) => {
      if (ev?.transcription) {
        // Get participant name from participants list
        const participant = participants[ev.session_id];
        const participantName = participant?.user_name || participant?.user_id || 'Unknown';
        
        const message = {
          id: `${ev.session_id}-${Date.now()}`,
          sessionId: ev.session_id,
          participantName,
          text: ev.transcription.text,
          final: ev.transcription.is_final,
          timestamp: new Date(),
        };

        setTranscriptionMessages((prev) => {
          // If this is a final message, replace any non-final message from same session
          if (message.final) {
            const filtered = prev.filter(
              (msg) => !(msg.sessionId === message.sessionId && !msg.final)
            );
            return [...filtered, message];
          }
          
          // If non-final, replace any existing non-final message from same session
          const filtered = prev.filter(
            (msg) => !(msg.sessionId === message.sessionId && !msg.final)
          );
          return [...filtered, message];
        });
      }
    }, [participants])
  );

  // Listen for transcription started event
  useDailyEvent(
    'transcription-started',
    useCallback(() => {
      setIsTranscriptionActive(true);
      setIsStarting(false);
    }, [])
  );

  // Listen for transcription stopped event
  useDailyEvent(
    'transcription-stopped',
    useCallback(() => {
      setIsTranscriptionActive(false);
      setIsStarting(false);
    }, [])
  );

  // Listen for transcription error event
  useDailyEvent(
    'transcription-error',
    useCallback((ev) => {
      console.error('Transcription error:', ev);
      setIsTranscriptionActive(false);
      setIsStarting(false);
    }, [])
  );

  const startTranscription = useCallback(async () => {
    if (!daily || isTranscriptionActive || isStarting) return;
    
    try {
      setIsStarting(true);
      await daily.startTranscription();
    } catch (error) {
      console.error('Failed to start transcription:', error);
      setIsStarting(false);
    }
  }, [daily, isTranscriptionActive, isStarting]);

  const stopTranscription = useCallback(async () => {
    if (!daily || !isTranscriptionActive) return;
    
    try {
      await daily.stopTranscription();
    } catch (error) {
      console.error('Failed to stop transcription:', error);
    }
  }, [daily, isTranscriptionActive]);

  const toggleTranscription = useCallback(() => {
    if (isTranscriptionActive) {
      stopTranscription();
    } else {
      startTranscription();
    }
  }, [isTranscriptionActive, startTranscription, stopTranscription]);

  const clearTranscription = useCallback(() => {
    setTranscriptionMessages([]);
  }, []);

  return {
    transcriptionMessages,
    isTranscriptionActive,
    isStarting,
    startTranscription,
    stopTranscription,
    toggleTranscription,
    clearTranscription,
  };
}