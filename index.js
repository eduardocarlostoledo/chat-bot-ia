import express from 'express';
import twilio from 'twilio';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

// Endpoint para recibir mensajes de WhatsApp
app.post('/webhook', async (req, res) => {
    const { Body, From } = req.body;
    
    try {
        // Generar respuesta con OpenAI
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: "Responde sobre Landing pages, funnels de venta, automatizaciones y apps web a medida." },
                        { role: "user", content: Body }],
        });

        const responseMessage = aiResponse.choices[0]?.message?.content || "Lo siento, no tengo una respuesta en este momento.";

        // Enviar respuesta por WhatsApp
        await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: From,
            body: responseMessage,
        });

        res.status(200).send('Mensaje enviado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en la respuesta de IA');
    }
});

app.listen(port, () => {
    console.log(`API funcionando en http://localhost:${port}`);
});
