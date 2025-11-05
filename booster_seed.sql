-- ============================================
-- SCRIPT DE SEED - Dados de Exemplo
-- Database: Booster CarAI
-- ============================================

-- Limpar dados existentes (comentar se não quiser limpar)
-- TRUNCATE TABLE agendamento, estoque, pedido_item, pedido, servico, tipo_servico, produto, fabricante, categoria, cliente RESTART IDENTITY CASCADE;

-- ============================================
-- 1. CATEGORIAS DE PRODUTOS
-- ============================================

INSERT INTO categoria (nome) VALUES
    ('MOTORES'),
    ('FREIOS'),
    ('SUSPENSAO'),
    ('ELETRICA'),
    ('TRANSMISSAO'),
    ('ACESSORIOS')
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- 2. FABRICANTES
-- ============================================

INSERT INTO fabricante (cnpj, nome) VALUES
    ('12345678000190', 'Bosch'),
    ('23456789000191', 'NGK'),
    ('34567890000192', 'Mann Filter'),
    ('45678900000193', 'Brembo'),
    ('56789000000194', 'Monroe'),
    ('67890000000195', 'Denso'),
    ('78900000000196', 'Valeo'),
    ('89000000000197', 'Continental'),
    ('90000000000198', 'Mahle'),
    ('01234567000199', 'Visteon')
ON CONFLICT (cnpj) DO NOTHING;

-- ============================================
-- 3. PRODUTOS
-- ============================================

INSERT INTO produto (nome, descricao, preco_unitario, id_categoria, id_fabricante) VALUES
    -- MOTORES
    ('Vela de Ignição NGK', 'Vela de ignição padrão para motores a gasolina', 25.90, 1, 2),
    ('Filtro de Óleo Bosch', 'Filtro de óleo original Bosch', 45.00, 1, 1),
    ('Filtro de Ar Mann', 'Filtro de ar de alta eficiência', 65.00, 1, 3),
    ('Correia Dentada Gates', 'Correia dentada com kit tensor', 280.00, 1, 8),
    ('Vela Aquecedora Bosch', 'Vela aquecedora para motores diesel', 85.00, 1, 1),

    -- FREIOS
    ('Pastilha de Freio Brembo', 'Pastilha de freio dianteira cerâmica', 180.00, 2, 4),
    ('Disco de Freio Brembo', 'Disco de freio ventilado 280mm', 220.00, 2, 4),
    ('Fluido de Freio DOT 4', 'Fluido de freio DOT 4 500ml', 28.00, 2, 1),
    ('Cilindro Mestre de Freio', 'Cilindro mestre do freio', 350.00, 2, 8),

    -- SUSPENSÃO
    ('Amortecedor Monroe', 'Amortecedor dianteiro original', 280.00, 3, 5),
    ('Kit de Suspensão', 'Kit completo suspensão dianteira', 850.00, 3, 5),
    ('Barra Estabilizadora', 'Barra estabilizadora traseira', 320.00, 3, 8),

    -- ELÉTRICA
    ('Bateria 60Ah Moura', 'Bateria automotiva 60Ah', 450.00, 4, 1),
    ('Alternador Bosch', 'Alternador 90A remanufaturado', 650.00, 4, 1),
    ('Motor de Arranque Denso', 'Motor de partida 12V', 580.00, 4, 6),
    ('Sensor de Oxigênio', 'Sonda lambda universal', 280.00, 4, 1),

    -- TRANSMISSÃO
    ('Embreagem LUK', 'Kit embreagem completo', 680.00, 5, 8),
    ('Óleo de Câmbio', 'Óleo sintético para transmissão', 120.00, 5, 9),
    ('Cabo de Embreagem', 'Cabo de acionamento da embreagem', 85.00, 5, 8),

    -- ACESSÓRIOS
    ('Jogo de Tapetes', 'Tapetes automotivos em borracha', 120.00, 6, 10),
    ('Capa de Banco', 'Capa de banco em couro sintético', 280.00, 6, 10),
    ('Alarme Automotivo', 'Alarme com controle remoto', 350.00, 6, 10);

-- ============================================
-- 4. ESTOQUE DOS PRODUTOS
-- ============================================

INSERT INTO estoque (id_produto, quantidade) VALUES
    (1, 50), (2, 30), (3, 25), (4, 15), (5, 20),
    (6, 18), (7, 12), (8, 40), (9, 8),
    (10, 22), (11, 10), (12, 15),
    (13, 25), (14, 8), (15, 10), (16, 12),
    (17, 14), (18, 30), (19, 20),
    (20, 35), (21, 28), (22, 18);

-- ============================================
-- 5. TIPOS DE SERVIÇO
-- ============================================

INSERT INTO tipo_servico (nome, descricao) VALUES
    ('Manutenção Preventiva', 'Serviços de manutenção periódica e preventiva'),
    ('Manutenção Corretiva', 'Reparos e correções de problemas mecânicos'),
    ('Diagnóstico', 'Análise e diagnóstico de problemas'),
    ('Estética Automotiva', 'Serviços de limpeza e estética'),
    ('Instalação', 'Instalação de acessórios e componentes');

-- ============================================
-- 6. SERVIÇOS
-- ============================================

INSERT INTO servico (nome, descricao, preco, duracao_estimada, id_tipo_servico, ativo) VALUES
    -- Manutenção Preventiva
    ('Troca de Óleo', 'Troca de óleo do motor com filtro, verificação de níveis e inspeção visual completa', 150.00, 45, 1, true),
    ('Alinhamento e Balanceamento', 'Alinhamento computadorizado das rodas e balanceamento completo dos pneus', 120.00, 60, 1, true),
    ('Revisão de Freios', 'Inspeção completa do sistema de freios, pastilhas, discos e fluido', 200.00, 90, 1, true),
    ('Limpeza de Injetores', 'Limpeza profunda dos bicos injetores de combustível', 180.00, 90, 1, true),
    ('Higienização de Ar-Condicionado', 'Limpeza completa do sistema de ar-condicionado com produtos especializados', 120.00, 60, 1, true),
    ('Troca de Filtros', 'Substituição de filtro de ar, óleo e combustível', 100.00, 30, 1, true),

    -- Manutenção Corretiva
    ('Troca de Pastilhas de Freio', 'Substituição das pastilhas de freio dianteiras ou traseiras', 280.00, 120, 2, true),
    ('Troca de Correia Dentada', 'Substituição da correia dentada do motor com verificação de tensionadores', 450.00, 180, 2, true),
    ('Troca de Bateria', 'Substituição da bateria com teste do sistema elétrico', 350.00, 30, 2, true),
    ('Troca de Amortecedores', 'Substituição dos amortecedores dianteiros ou traseiros', 600.00, 180, 2, true),
    ('Reparo de Suspensão', 'Reparo completo do sistema de suspensão', 800.00, 240, 2, true),
    ('Troca de Embreagem', 'Substituição do kit completo de embreagem', 1200.00, 360, 2, true),

    -- Diagnóstico
    ('Diagnóstico Computadorizado', 'Análise completa do sistema eletrônico do veículo com scanner automotivo', 80.00, 30, 3, true),
    ('Diagnóstico de Motor', 'Análise técnica completa do motor', 150.00, 60, 3, true),
    ('Teste de Bateria e Alternador', 'Teste completo do sistema de carga', 50.00, 20, 3, true),

    -- Estética Automotiva
    ('Polimento e Cristalização', 'Polimento completo da pintura com aplicação de cristalizador', 400.00, 240, 4, true),
    ('Lavagem Completa', 'Lavagem externa e interna completa', 80.00, 60, 4, true),
    ('Higienização Interna', 'Limpeza profunda do interior do veículo', 150.00, 90, 4, true),

    -- Instalação
    ('Instalação de Som Automotivo', 'Instalação completa de sistema de som com chicotes e conectores', 150.00, 120, 5, true),
    ('Instalação de Alarme', 'Instalação e configuração de alarme automotivo', 200.00, 90, 5, true),
    ('Instalação de Sensor de Ré', 'Instalação de sensor de estacionamento', 120.00, 60, 5, true);

-- ============================================
-- 7. CLIENTES DE EXEMPLO
-- ============================================

INSERT INTO cliente (documento, tipo_cliente, nome) VALUES
    ('12345678901', 'PF', 'João Silva Santos'),
    ('98765432100', 'PF', 'Maria Oliveira Costa'),
    ('11122233344', 'PF', 'Pedro Henrique Souza'),
    ('12345678000190', 'PJ', 'Transportadora Rápida Ltda'),
    ('98765432000199', 'PJ', 'Distribuidora Auto Peças SA'),
    ('55566677788', 'PF', 'Ana Carolina Ferreira'),
    ('44455566677', 'PF', 'Carlos Eduardo Lima'),
    ('33344455566', 'PF', 'Juliana Martins Rocha')
ON CONFLICT (documento) DO NOTHING;

-- ============================================
-- 8. PEDIDOS DE EXEMPLO
-- ============================================

-- Pedido 1: Cliente compra apenas produtos
INSERT INTO pedido (id_cliente, valor_total, status) VALUES
    (1, 160.90, 'CONFIRMADO');

INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario) VALUES
    (1, 1, 4, 25.90),  -- 4x Velas de Ignição
    (1, 2, 1, 45.00),  -- 1x Filtro de Óleo
    (1, 3, 1, 65.00);  -- 1x Filtro de Ar

-- Pedido 2: Cliente compra produto + contrata serviço (PEDIDO MISTO)
INSERT INTO pedido (id_cliente, valor_total, status) VALUES
    (2, 325.00, 'CONFIRMADO');

INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario) VALUES
    (2, 2, 1, 45.00);  -- 1x Filtro de Óleo

INSERT INTO pedido_item (id_pedido, id_servico, quantidade, preco_unitario) VALUES
    (2, 1, 1, 150.00),  -- 1x Troca de Óleo (serviço)
    (2, 3, 1, 200.00);  -- 1x Revisão de Freios (serviço)

-- Pedido 3: Cliente contrata apenas serviços
INSERT INTO pedido (id_cliente, valor_total, status) VALUES
    (3, 520.00, 'PENDENTE');

INSERT INTO pedido_item (id_pedido, id_servico, quantidade, preco_unitario) VALUES
    (3, 2, 1, 120.00),  -- 1x Alinhamento
    (3, 16, 1, 400.00); -- 1x Polimento

-- Pedido 4: Empresa compra produtos em quantidade
INSERT INTO pedido (id_cliente, valor_total, status) VALUES
    (4, 1380.00, 'ENVIADO');

INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario) VALUES
    (4, 6, 5, 180.00),  -- 5x Pastilhas de Freio
    (4, 8, 10, 28.00),  -- 10x Fluido de Freio
    (4, 13, 1, 450.00); -- 1x Bateria

-- Pedido 5: Cliente PF - Compra mista complexa
INSERT INTO pedido (id_cliente, valor_total, status) VALUES
    (6, 1855.00, 'CONFIRMADO');

INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario) VALUES
    (6, 6, 1, 180.00),   -- Pastilha de Freio
    (6, 7, 2, 220.00);   -- 2x Disco de Freio

INSERT INTO pedido_item (id_pedido, id_servico, quantidade, preco_unitario) VALUES
    (6, 7, 1, 280.00),   -- Troca de Pastilhas
    (6, 8, 1, 450.00),   -- Troca de Correia
    (6, 1, 1, 150.00);   -- Troca de Óleo

-- ============================================
-- 9. AGENDAMENTOS DE SERVIÇOS
-- ============================================

INSERT INTO agendamento (id_cliente, id_servico, data_agendamento, hora_agendamento, status, observacoes) VALUES
    (1, 1, '2025-01-15', '09:00:00', 'CONFIRMADO', 'Cliente solicitou óleo sintético'),
    (2, 2, '2025-01-15', '10:30:00', 'CONFIRMADO', NULL),
    (3, 8, '2025-01-16', '08:00:00', 'PENDENTE', 'Verificar se tem kit completo em estoque'),
    (6, 16, '2025-01-17', '14:00:00', 'CONFIRMADO', 'Cliente quer cera especial'),
    (7, 13, '2025-01-18', '09:00:00', 'PENDENTE', 'Diagnóstico completo solicitado'),
    (8, 19, '2025-01-18', '11:00:00', 'CONFIRMADO', 'Instalação de rádio novo'),
    (1, 3, '2025-01-20', '15:00:00', 'PENDENTE', 'Revisão completa de freios');

-- ============================================
-- RESUMO DOS DADOS INSERIDOS
-- ============================================

SELECT
    'Categorias' as tabela, COUNT(*) as registros FROM categoria
UNION ALL
SELECT 'Fabricantes', COUNT(*) FROM fabricante
UNION ALL
SELECT 'Produtos', COUNT(*) FROM produto
UNION ALL
SELECT 'Estoque', COUNT(*) FROM estoque
UNION ALL
SELECT 'Tipos de Serviço', COUNT(*) FROM tipo_servico
UNION ALL
SELECT 'Serviços', COUNT(*) FROM servico
UNION ALL
SELECT 'Clientes', COUNT(*) FROM cliente
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM pedido
UNION ALL
SELECT 'Itens de Pedido', COUNT(*) FROM pedido_item
UNION ALL
SELECT 'Agendamentos', COUNT(*) FROM agendamento;

-- ============================================
-- CONSULTAS DE EXEMPLO ÚTEIS
-- ============================================

-- Ver pedidos com produtos E serviços
SELECT
    p.id_pedido,
    c.nome as cliente,
    p.valor_total,
    p.status,
    COUNT(DISTINCT CASE WHEN pi.id_produto IS NOT NULL THEN pi.id_pedido_item END) as qtd_produtos,
    COUNT(DISTINCT CASE WHEN pi.id_servico IS NOT NULL THEN pi.id_pedido_item END) as qtd_servicos
FROM pedido p
JOIN cliente c ON p.id_cliente = c.id_cliente
JOIN pedido_item pi ON p.id_pedido = pi.id_pedido
GROUP BY p.id_pedido, c.nome, p.valor_total, p.status
ORDER BY p.id_pedido;

-- Ver detalhes completos de um pedido
/*
SELECT
    pi.id_pedido_item,
    COALESCE(prod.nome, serv.nome) as item_nome,
    CASE
        WHEN pi.id_produto IS NOT NULL THEN 'Produto'
        WHEN pi.id_servico IS NOT NULL THEN 'Serviço'
    END as tipo_item,
    pi.quantidade,
    pi.preco_unitario,
    (pi.quantidade * pi.preco_unitario) as subtotal
FROM pedido_item pi
LEFT JOIN produto prod ON pi.id_produto = prod.id_produto
LEFT JOIN servico serv ON pi.id_servico = serv.id_servico
WHERE pi.id_pedido = 2
ORDER BY pi.id_pedido_item;
*/
