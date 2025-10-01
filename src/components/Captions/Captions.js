import React, { useEffect, useRef } from 'react';
import './Captions.css';

export default function Captions({ 
  transcriptionMessages, 
  isTranscriptionActive, 
  showCaptions, 
  toggleCaptions 
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptionMessages]);

  // Don't render if captions are hidden
  if (!showCaptions) return null;

  return (
    <div className="captions">
      <div className="captions-header">
        <h3>Live Captions</h3>
        <div className="captions-status">
          {isTranscriptionActive ? (
            <span className="status-active">● LIVE</span>
          ) : (
            <span className="status-inactive">○ OFF</span>
          )}
        </div>
        <button 
          onClick={toggleCaptions} 
          className="close-captions" 
          type="button"
          aria-label="Close captions"
        >
          ×
        </button>
      </div>
      
      <div className="captions-messages">
        {transcriptionMessages.length === 0 ? (
          <div className="captions-placeholder">
            {isTranscriptionActive 
              ? "Listening for speech..." 
              : "Start transcription to see live captions"
            }
          </div>
        ) : (
          transcriptionMessages
            .filter(msg => msg.final) // Only show final transcriptions
            .slice(-20) // Show last 20 messages to prevent overflow
            .map((message) => (
              <div 
                key={message.id} 
                className={`caption-message ${!message.final ? 'interim' : ''}`}
              >
                <span className="caption-speaker">{message.participantName}:</span>
                <span className="caption-text">{message.text}</span>
                <span className="caption-timestamp">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}