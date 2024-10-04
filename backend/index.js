const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { Pool } = require('pg');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API key from the .env file
});

app.use(cors());
app.use(express.json());

// PostgreSQL database connection setup
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Connected to the PostgreSQL database');
    release(); // Release the client if the connection was successful
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World');
});

app.get('/tasks', (req, res) => {
  pool.query('SELECT * FROM tasks', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error retrieving tasks');
    } else {
      res.json(result.rows); // Send the rows as JSON
    }
  });
});

// POST route to handle running bash scripts and validate output
app.post('/run-script', async (req, res) => {
  const { script, challenge } = req.body;

  // Check if the script is empty or invalid
  if (!script || script.trim() === '') {
    return res.status(400).json({
      error: 'No script provided. Please write a valid bash command.',
    });
  }

  // Execute the bash script
  exec(script, async (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error executing script: ${error || stderr}`);
      // If there is an error executing the script, do not query OpenAI
      return res.status(400).json({
        output: 'Command Failed. Error executing script. Please try again.',
      });
    }

    const userOutput = stdout.trim();

    // If the script is valid, query OpenAI for validation based on the challenge
    const prompt = `
    The user was given the following challenge: "${challenge}".
    They wrote the following bash script: "${script}".
    The output they received was: "${userOutput}".
    Does this bash script solve the challenge correctly?  If so, respond with "Yes, the command is correct."
    If the command does not solve the challenge, explain why the solution is incorrect and provide the correct command.

    IMPORTANT:
    - Do not provide unnecessary suggestions or corrections if the command is correct.
    - If the command is valid but is not the right command to solve the challenge, do not show its output, but explain why it is incorrect.
    - Only respond with feedback if there is an actual error.
    - Respond using clear text, and when providing the correct solution, enclose the code in single backticks for in-line code or triple backticks for block code.
    - Only show the command output if it solves the challenge.
    - If the command is correct, respond with exactly this: "Yes, the command is correct."
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in bash scripting validation.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.1,
      });

      const chatgptFeedback = response.choices[0].message.content.trim();

      // If the command does not solve the challenge, suppress output
      if (!chatgptFeedback.includes('Yes, the command is correct')) {
        return res.json({ output: '', feedback: chatgptFeedback });
      }

      // Otherwise, return both the output and the feedback
      return res.json({ output: userOutput, feedback: chatgptFeedback });
    } catch (apiError) {
      console.error('Error with OpenAI API:', apiError);
      return res.status(500).json({
        error: 'Error with OpenAI API. Please try again later.',
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
