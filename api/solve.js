// This is the updated and corrected file: api/solve.js

// We will import node-fetch in a way that is compatible with modern Node.js versions on Vercel
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    // 1. Check if the request method is POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Error: Only POST requests are allowed.' });
    }

    try {
        // 2. Securely get the API Key from Environment Variables
        const apiKey = process.env.GEMINI_API_KEY;

        // If the API key is not found, return an error
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in Vercel Environment Variables.");
            return res.status(500).json({ error: 'Server configuration error: API key is missing.' });
        }
        
        // 3. Get the data sent from the website (index.html)
        const requestBody = req.body;

        // If the body is empty, return an error
        if (!requestBody || !requestBody.contents) {
             return res.status(400).json({ error: 'Bad Request: Missing "contents" in the request body.' });
        }

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        // 4. Send the request to the Google API
        const googleResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await googleResponse.json();

        // If Google returns an error, send that error back to the user
        if (!googleResponse.ok) {
            console.error('Google API Error:', data);
            return res.status(googleResponse.status).json({error: "Failed to get a response from the AI. " + (data.error?.message || "")});
        }

        // 5. If everything is successful, send the response back to the website
        res.status(200).json(data);

    } catch (error) {
        // If any other unexpected error happens on the server
        console.error('Unexpected server-side error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};
