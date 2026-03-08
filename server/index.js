import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import multer from 'multer'; // Removed as it's not used in this file
const app = express();

// Inisialisasi Google AI dengan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gunakan model gemini-1.5-flash yang stabil (corrected model name)
const GEMINI_MODEL = "gemini-2.5-flash-lite";

const PORT = process.env.PORT || 3000; // Define PORT consistently

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory, which is one level above the 'server' directory.
// This will automatically serve your index.html when you visit the root URL.
app.use(express.static(path.join(__dirname, '..', 'public')));

// 2. Rute POST untuk Chat
app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
  
  try {
    if (!Array.isArray(conversation)) {
        return res.status(400).json({ error: 'Conversation must be an array!' });
    }

    // Ambil model dengan instruksi sistem
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: "Kamu adalah asisten Psikologi Konsultan. Jawab hanya menggunakan bahasa Indonesia dengan gaya bahasa profesional dan teknis.",
    });

    // Format data untuk Gemini SDK terbaru
    const contents = conversation.map(({ role, text }) => ({
      role: role === 'user' ? 'user' : 'model', // SDK Gemini menggunakan 'model' bukan 'assistant'
      parts: [{ text }],
    }));

    // Generate konten
    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        temperature: 0.9,
      },
    });

    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ result: text });

  } catch (e) {
    console.error("Error detail:", e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Cek di browser: http://localhost:${PORT}`);
});