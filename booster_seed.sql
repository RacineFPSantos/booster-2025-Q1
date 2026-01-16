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
