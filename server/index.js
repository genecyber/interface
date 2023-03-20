const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the React app
app.use(express.static(path.join(__dirname, '../build')));

app.post('/api/chatgpt', async (req, res) => {
  const { prompt, history } = req.body;

  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_APIKEY || ''
    });

    const openai = new OpenAIApi(configuration);
    let modified = prompt
    const fullPrompt = history.reduce(
        (acc, item) => acc + item.prompt + item.response,
        ''
      ) + modified;

    try {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: fullPrompt}],
    });
    let returnVal = JSON.parse(JSON.stringify(response.data))
    return res.json(returnVal);
    } catch(err){
        console.log(err)
    }    
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
