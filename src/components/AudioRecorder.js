import React, { useState, useEffect } from 'react';

function AudioCapture() {
  const [audioStream, setAudioStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
      download();
    }
  };

  const download = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'recording.webm';
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(audioUrl);
    setAudioChunks([]);
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setAudioChunks(prevChunks => [...prevChunks, event.data]);
    }
  };

  useEffect(() => {
    if (audioStream) {
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.start();
      return () => {
        mediaRecorder.removeEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.stop();
      };
    }
  }, [audioStream]);

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
    </div>
  );
}

export default AudioCapture;
