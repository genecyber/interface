import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Container, TextField, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AudioRecorder from './components/AudioRecorder';
import { Buffer } from "buffer";

  const generateRandomHash = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return result;
  };
function App() {
  const params = new URLSearchParams(window.location.search);
  const historyQueryParam = params.get('history');
  const storedSessionHashes = JSON.parse(localStorage.getItem('sessionHashes') || '[]');
  let importedHistory = []
  let hash = window.location.hash.substr(1);

  if (!hash) {
    hash = generateRandomHash();
    window.location.hash = hash;
    // Save the new hash to the session hashes array
    const updatedSessionHashes = [...storedSessionHashes, hash];
    localStorage.setItem('sessionHashes', JSON.stringify(updatedSessionHashes));
  }

  if (historyQueryParam) {
    try {
      importedHistory = JSON.parse(Buffer.from(historyQueryParam, 'base64').toString('utf-8'))      
      localStorage.setItem(hash, JSON.stringify(importedHistory));
      const newSessionHashes = [...storedSessionHashes.filter(item=>{return item != hash}), hash]
      localStorage.setItem('sessionHashes', JSON.stringify(newSessionHashes));
      window.location.href = `${window.location.origin}#${e.target.value}`
    } catch(err){
      console.log(err)
    }
  }
  
  const storedHistory = JSON.parse(localStorage.getItem(hash) || '[]');
  const [history, setHistory] = useState(storedHistory || []);

  const lastEntry = storedHistory.length > 0 ? storedHistory[storedHistory.length - 1] : null;
  const [input, setInput] = useState(lastEntry ? lastEntry.prompt : '');
  const [response, setResponse] = useState(lastEntry ? lastEntry.response : '');

  const handleHashChange = (e) => {
    window.location.href = `${window.location.origin}#${e.target.value}`
    setTimeout(()=>{window.location.reload()}, 500)
  }

  const handleExport = ()=>{
    try {
      const encodedHistory = Buffer.from(JSON.stringify(history)).toString('base64');
      params.set('history', encodedHistory);
      window.history.replaceState({}, '', `${window.location.pathname}?${params}#${hash}`);
      window.location.reload()
    } catch(err){console.log(err)}
  }

  const handleChange = (e) => {
    setInput(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const modifiedPrompt = input; 

    try {
      const result = await axios.post('/api/chatgpt', {
        prompt: modifiedPrompt,
        history: history
      });

      const newResponse = result.data.choices[0].message.content;
      setResponse(newResponse);

      // Update the conversation history
      const updatedHistory = [...history, { prompt: modifiedPrompt, response: newResponse }];
      setHistory(updatedHistory);

      // Save the updated history to localStorage
      localStorage.setItem(hash, JSON.stringify(updatedHistory));
      setInput('');

    } catch (error) {
      console.error('Error making the GPT API call:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" gutterBottom>
          ChatGPT Interface
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel id="hash-select-label">Select Hash</InputLabel>
          <Select
            labelId="hash-select-label"
            id="hash-select"
            value={hash}
            onChange={handleHashChange}
          >
            {storedSessionHashes.map((hashItem) => (
              <MenuItem key={hashItem} value={hashItem}>
                {hashItem}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <form onSubmit={handleSubmit}>
          <TextField
            id="input"
            label="Your Input"
            value={input}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<SendIcon />}
          >
            Submit
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleExport}
            color="primary"
            size="large"
          >
            Export
          </Button>
        </form>
        <Box
          sx={{
            marginTop: 3,
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: 1,
            padding: 2,
          }}
        >
          <Typography variant="h5">Response:</Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: response.replace(/\n/g, '<br>'),
            }}
          />
        </Box>
        <Box
        sx={{
          marginTop: 3,
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1,
          padding: 2,
          overflowY: 'auto',
          maxHeight: '50vh',
        }}
      >
        {history.reverse().map((entry, index) => (
          <Box key={index}>
            <Typography variant="h6">Question:</Typography>
            <Typography>{entry.prompt}</Typography>
            <Typography variant="h6">Response:</Typography>
            <Typography
            dangerouslySetInnerHTML={{
              __html: entry.response.replace(/\n/g, '<br>'),
            }}
          />
          </Box>
        ))}
      </Box>
      </Box>
      <AudioRecorder/>
    </Container>
  );
}

export default App;
