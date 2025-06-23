require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const pedidosRoutes = require('./routes/pedidos');
const {listarPedidosConcluidos, excluirPedido} = require('./services/supabaseService');
const {enviarRelatorioMensal} = require('./services/emailService');

const app = express();
app.use(express.json({type: 'application/json; charset=utf-8'}));
app.use(express.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
app.use('/pedidos', pedidosRoutes);

// Cron: 1º dia do mês às 00:00
cron.schedule('0 0 1 * *', async () => {
    try {
        console.log('Gerando relatório mensal...');
        const pedidos = await listarPedidosConcluidos();
        await enviarRelatorioMensal(pedidos);
        for (const pedido of pedidos) {
            await excluirPedido(pedido.id);
        }
        console.log('Relatório enviado e pedidos concluídos excluídos.');
    } catch (error) {
        console.error('Erro no cron:', error.message);
    }
});

const PORT = process.env.PORT || 3000;
try {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
} catch (error) {
    console.error('Erro ao iniciar o servidor:', error.message);
    process.exit(1);
}

process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error.message);
    process.exit(1);
});