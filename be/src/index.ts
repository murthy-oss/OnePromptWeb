require("dotenv").config();
import express from "express";
import axios from "axios";  // Added axios to make HTTP requests to Gemini API
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

// Set up express app
const app = express();
app.use(cors());
app.use(express.json());

// Gemini API base URL (adjust with actual URL if needed)
const GEMINI_API_URL = process.env.GEMINI_API_URL || "https://gemini-api.example.com";  // Replace with actual Gemini API URL
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure your API key is available in .env file

// Template Endpoint
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;

    try {
        // Send a request to Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyC9hcgOz2sTXfW0v2XgYtxjYFB9i7Bt_v0`, // Replace with the actual Gemini endpoint
            {
                contents: [
                  {
                    role: "user",
                    parts: [
                      { text: prompt+"Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra" }
                    ]
                  }
                ]
              },
       
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const generatedText = response.data.candidates[0].content.parts[0].text; 
        console.log(generatedText);
        // Assuming the response structure from Gemini looks like this
        const answer =generatedText; // Adjust according to Gemini's API response structure

        if (answer.trim() === "react") {
            res.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                ],
                uiPrompts: [reactBasePrompt]
            });
        } else if (answer.trim()  === "node") {
            res.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                ],
                uiPrompts: [nodeBasePrompt]
            });
        } else {
            res.status(403).json({ message: "You can't access this" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interacting with the Gemini API" });
    }
});

// Chat Endpoint
app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
console.log("messages:"+messages);
    try {
        // Send the messages to Gemini API for response
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyC9hcgOz2sTXfW0v2XgYtxjYFB9i7Bt_v0', // Replace with the actual Gemini endpoint
            {
                contents: [
                  {
                    role: "user",
                    parts: [
                      { text: messages+ getSystemPrompt()}
                    ]
                  }
                ]
              },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const generatedText = response.data.candidates[0].content.parts[0].text; 
        console.log(generatedText);

        // Assuming Gemini response structure has a `text` field
        res.json({
            response: generatedText || "No response received from Gemini"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interacting with the Gemini API" });
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
