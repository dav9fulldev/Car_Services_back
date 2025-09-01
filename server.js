require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ✅ Logger toutes les requêtes
app.use(morgan('combined'));

// ✅ Autoriser uniquement ton frontend
app.use(cors({
  origin: "https://car-services-chi.vercel.app"
}));

app.use(express.json());

// ✅ Limiter les requêtes pour protéger contre le spam
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requêtes par IP
  message: { message: 'Trop de demandes envoyées, veuillez réessayer plus tard.' }
});

app.use('/api/contact', contactLimiter);

app.post('/api/contact', async (req, res) => {
  const { name, email, message, whatsapp } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password Gmail
      },
    });

    const formattedNumber = whatsapp
      ? whatsapp.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
      : 'Non renseigné';

    await transporter.sendMail({
      from: `"Car Service" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `Message de ${name} via formulaire Car Service`,
      html: `
        <h3>Nom : ${name}</h3>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>WhatsApp :</strong> +225 ${formattedNumber}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ message: 'Message envoyé avec succès ✅' });
  } catch (err) {
    console.error("❌ Erreur lors de l’envoi :", err);
    res.status(500).json({ message: 'Erreur lors de l’envoi du message' });
  }
});

// ✅ Port dynamique
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
