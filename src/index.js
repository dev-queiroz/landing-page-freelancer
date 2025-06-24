const express = require('express');
const cors = require('cors');
const pedidosRoutes = require('./routes/pedidos');
const cron = require('node-cron');
const {listarPedidos, excluirPedido} = require('./services/supabaseService');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Configurar CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://landing-page-form-next.vercel.app'], // Adicione a URL do seu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/pedidos', pedidosRoutes);

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Cron: 1º dia do mês, 00:00
cron.schedule('0 0 1 * *', async () => {
    try {
        const pedidos = await listarPedidos();
        const concluidos = pedidos.filter(p => p.status === 'CONCLUIDA');
        if (concluidos.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'Relatório Mensal de Pedidos Concluídos',
                text: `Total de pedidos concluídos: ${concluidos.length}\n${concluidos.map(p => `ID: ${p.id}, Preço: R$${p.preco}`).join('\n')}`,
            };
            await transporter.sendMail(mailOptions);
            for (const pedido of concluidos) {
                await excluirPedido(pedido.id);
            }
        }
    } catch (error) {
        console.error('Erro no cron:', error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));