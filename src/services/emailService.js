const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function enviarRelatorioMensal(pedidos) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const relatorio = `
Relatório Mensal - ${new Date().toLocaleString('pt-BR', {month: 'long', year: 'numeric'})}
Pedidos concluídos: ${pedidos.length}
${pedidos.map((p, i) => `
Pedido ${i + 1}
- ID: ${p.id}
- Cliente: ${p.detalhes.nome}
- Plano: ${p.plano}
- Preço: R$${p.preco}
- Data: ${new Date(p.created_at).toLocaleDateString('pt-BR')}
`).join('\n')}
      `;

        await transporter.sendMail({
            from: '"Landing Page Freelancer" <${process.env.EMAIL_USER}>',
            to: 'dev.queiroz05@gmail.com, devmary122@gmail.com',
            subject: `Relatório Mensal - ${new Date().toLocaleString('pt-BR', {month: 'long', year: 'numeric'})}`,
            text: relatorio,
        });

        console.log('Relatório mensal enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar relatório:', error.message);
        throw error;
    }
}

module.exports = {enviarRelatorioMensal};