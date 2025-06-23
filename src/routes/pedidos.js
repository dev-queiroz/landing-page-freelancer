const express = require('express');
const {
    criarPedido,
    listarPedidos,
    buscarPedidoPorId,
    atualizarPedido,
    excluirPedido,
} = require('../services/supabaseService');

const router = express.Router();

function calcularPreco(plano, detalhes) {
    const precos = {Essencial: 120, Profissional: 200, Premium: 300};
    let preco = precos[plano] || 120;
    if (plano === 'Premium') {
        if (detalhes.ilustracaoComplexa) preco += 50;
        if (detalhes.animacoesAvancadas) preco += 30;
    }
    return preco;
}

function calcularPrazoEntrega(plano) {
    const diasUteis = plano === 'Essencial' ? 5 : plano === 'Profissional' ? 7 : 10;
    const data = new Date();
    let diasAdicionados = 0;
    while (diasAdicionados < diasUteis) {
        data.setDate(data.getDate() + 1);
        if (data.getDay() !== 0 && data.getDay() !== 6) {
            diasAdicionados++;
        }
    }
    return data.toISOString().split('T')[0];
}

function gerarPrompt(detalhes, plano) {
    const defaultValues = {
        cores: 'padrão',
        estilo: 'moderno',
        publicoAlvo: 'geral',
        redesSociais: 'nenhum',
        emailIntegracao: 'nenhum',
        mensagemWhatsApp: 'Fale comigo!',
        breveDescricao: 'nenhum',
        beneficios: 'nenhum',
        ilustracao: 'nenhum',
        ilustracaoComplexa: false,
        animacoesAvancadas: false,
        textoSEO: 'nenhum',
        listaServicos: 'nenhum',
        preferenciasAnimacao: 'padrão',
        depoimentos: 'Ajustar com cliente',
    };

    const dados = {...defaultValues, ...detalhes};

    const templates = {
        Essencial: `Crie uma landing page de 1 página (Home) com:
- Estrutura: Apresentação, CTA, formulário simples.
- Conteúdo: Nome: {nome}, Objetivo: {objetivo}, CTA: {callToAction}.
- Design: Cores: {cores}, Estilo: {estilo}, Público-alvo: {publicoAlvo}.
- Integrações: Redes sociais: {redesSociais}.
- Prazo: 5 dias úteis.`,
        Profissional: `Crie uma landing page de 3 páginas (Home, Sobre, Contato) com:
- Home: Apresentação, CTA, formulário conectado a {emailIntegracao}.
- Sobre: Descrição: {breveDescricao}, Benefícios: {beneficios}.
- Contato: Formulário, link WhatsApp com mensagem: {mensagemWhatsApp}.
- Conteúdo: Nome: {nome}, Objetivo: {objetivo}, CTA: {callToAction}.
- Design: Cores: {cores}, Estilo: {estilo}, Público-alvo: {publicoAlvo}.
- Integrações: Redes sociais: {redesSociais}.
- Prazo: 7 dias úteis.`,
        Premium: `Crie uma landing page de 5 páginas (Home, Sobre, Portfólio/Serviços, Depoimentos, Contato) com:
- Home: Apresentação, CTA, formulário conectado a {emailIntegracao}.
- Sobre: Descrição: {breveDescricao}, Benefícios: {beneficios}.
- Portfólio/Serviços: Galeria com {listaServicos}, ilustrações: {ilustracao}, complexa: {ilustracaoComplexa}.
- Depoimentos: {depoimentos}.
- Contato: Formulário, link WhatsApp com mensagem: {mensagemWhatsApp}, SEO com: {textoSEO}.
- Conteúdo: Nome: {nome}, Objetivo: {objetivo}, CTA: {callToAction}.
- Design: Cores: {cores}, Estilo: {estilo}, Público-alvo: {publicoAlvo}.
- Animações: {preferenciasAnimacao}, avançadas: {animacoesAvancadas}.
- Integrações: Redes sociais: {redesSociais}.
- Prazo: 10 dias úteis.`,
    };

    let prompt = templates[plano] || templates.Essencial;
    Object.keys(dados).forEach((key) => {
        const value = String(dados[key]);
        prompt = prompt.replace(`{${key}}`, value);
    });

    return prompt.trim();
}

function gerarMensagemWhatsApp(detalhes, plano, preco, prazo) {
    const mensagem = `Olá, ${detalhes.nome}! Pedido de landing page (${plano}) recebido! Preço: R$${preco}. Detalhes: Layout ${detalhes.estilo || 'moderno'}, cores ${detalhes.cores || 'padrão'}, objetivo ${detalhes.objetivo}. Prazo: ${prazo}. Confirme ou ajuste!`;
    return encodeURI(mensagem);
}

function validarWhatsApp(whatsapp) {
    return /^\+\d{1,3}\d{8,15}$/.test(whatsapp);
}

router.post('/', async (req, res) => {
    try {
        const {plano, detalhes} = req.body;
        if (!['Essencial', 'Profissional', 'Premium'].includes(plano)) {
            return res.status(400).json({erro: 'Plano inválido'});
        }
        if (!detalhes.nome || !validarWhatsApp(detalhes.whatsapp) || !detalhes.objetivo || !detalhes.callToAction) {
            return res.status(400).json({erro: 'Campos obrigatórios faltando'});
        }

        const preco = calcularPreco(plano, detalhes);
        const prazoEntrega = calcularPrazoEntrega(plano);
        const pedido = await criarPedido(detalhes, plano, preco, 'PENDENTE', prazoEntrega);
        const mensagem = gerarMensagemWhatsApp(detalhes, plano, preco, prazoEntrega);
        const linkWhatsApp = `https://wa.me/${detalhes.whatsapp}?text=${mensagem}`;

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({pedido, linkWhatsApp});
    } catch (error) {
        res.status(500).json({erro: 'Erro ao criar pedido', detalhes: error.message});
    }
});

router.get('/', async (req, res) => {
    try {
        const pedidos = await listarPedidos();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({erro: 'Erro ao listar pedidos', detalhes: error.message});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pedido = await buscarPedidoPorId(req.params.id);
        if (!pedido) {
            return res.status(404).json({erro: 'Pedido não encontrado'});
        }
        const prompt = gerarPrompt(pedido.detalhes, pedido.plano);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({pedido, prompt});
    } catch (error) {
        res.status(500).json({erro: 'Erro ao buscar pedido', detalhes: error.message});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {detalhes, preco, status, prazoEntrega} = req.body;
        if (!['PENDENTE', 'EM ANDAMENTO', 'CONCLUIDA'].includes(status)) {
            return res.status(400).json({erro: 'Status inválido'});
        }
        if (!detalhes || !preco || !prazoEntrega) {
            return res.status(400).json({erro: 'Campos obrigatórios faltando'});
        }

        const pedido = await atualizarPedido(req.params.id, detalhes, preco, status, prazoEntrega);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(pedido);
    } catch (error) {
        res.status(500).json({erro: 'Erro ao atualizar pedido', detalhes: error.message});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const resultado = await excluirPedido(req.params.id);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(resultado);
    } catch (error) {
        res.status(500).json({erro: 'Erro ao excluir pedido', detalhes: error.message});
    }
});

module.exports = router;