require('dotenv').config();
const {createClient} = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: SUPABASE_URL ou SUPABASE_KEY não configurados no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase cliente inicializado com sucesso');

async function criarPedido(detalhes, plano, preco, status, prazoEntrega) {
    try {
        const {data, error} = await supabase
            .from('pedidos')
            .insert([
                {
                    id: Date.now().toString(),
                    detalhes,
                    plano,
                    preco,
                    status,
                    prazo_entrega: prazoEntrega,
                },
            ])
            .select();
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        throw error;
    }
}

async function listarPedidos() {
    try {
        const {data, error} = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', {ascending: true});
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao listar pedidos:', error.message);
        throw error;
    }
}

async function buscarPedidoPorId(id) {
    try {
        const {data, error} = await supabase
            .from('pedidos')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error.message);
        throw error;
    }
}

async function atualizarPedido(id, detalhes, preco, status, prazoEntrega) {
    try {
        const {data, error} = await supabase
            .from('pedidos')
            .update({
                detalhes,
                preco,
                status,
                prazo_entrega: prazoEntrega,
            })
            .eq('id', id)
            .select();
        if (error) throw error;
        if (!data.length) throw new Error('Pedido não encontrado');
        return data[0];
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error.message);
        throw error;
    }
}

async function excluirPedido(id) {
    try {
        const {error} = await supabase
            .from('pedidos')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return {message: 'Pedido excluído com sucesso'};
    } catch (error) {
        console.error('Erro ao excluir pedido:', error.message);
        throw error;
    }
}

async function listarPedidosConcluidos() {
    try {
        const {data, error} = await supabase
            .from('pedidos')
            .select('*')
            .eq('status', 'CONCLUIDA')
            .order('created_at', {ascending: false});
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao listar pedidos concluídos:', error.message);
        throw error;
    }
}

module.exports = {
    criarPedido,
    listarPedidos,
    buscarPedidoPorId,
    atualizarPedido,
    excluirPedido,
    listarPedidosConcluidos,
};