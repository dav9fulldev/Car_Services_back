require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedNumber = req.body.whatsapp.replace(/(\d{2})(?=\d)/g, '$1 ').trim();

    await transporter.sendMail({
        from: email,
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

    res.status(200).json({ message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l’envoi du message' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${process.env.PORT}`);
});
