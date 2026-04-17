-- Current Supabase seed for the NestJS backend.
-- Requires backend-booster/sql/supabase-schema-current.sql first.
-- This file intentionally does not use the legacy estoque table.

INSERT INTO public.categoria (nome) VALUES
  ('MOTORES'),
  ('FREIOS'),
  ('SUSPENSAO'),
  ('ELETRICA'),
  ('TRANSMISSAO'),
  ('ACESSORIOS')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO public.fabricante (cnpj, nome) VALUES
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

WITH seed_produtos (nome, descricao, preco_unitario, categoria_nome, fabricante_cnpj) AS (
  VALUES
    ('Vela de Ignicao NGK', 'Vela de ignicao padrao para motores a gasolina', 25.90, 'MOTORES', '23456789000191'),
    ('Filtro de Oleo Bosch', 'Filtro de oleo original Bosch', 45.00, 'MOTORES', '12345678000190'),
    ('Filtro de Ar Mann', 'Filtro de ar de alta eficiencia', 65.00, 'MOTORES', '34567890000192'),
    ('Correia Dentada Gates', 'Correia dentada com kit tensor', 280.00, 'MOTORES', '89000000000197'),
    ('Vela Aquecedora Bosch', 'Vela aquecedora para motores diesel', 85.00, 'MOTORES', '12345678000190'),
    ('Pastilha de Freio Brembo', 'Pastilha de freio dianteira ceramica', 180.00, 'FREIOS', '45678900000193'),
    ('Disco de Freio Brembo', 'Disco de freio ventilado 280mm', 220.00, 'FREIOS', '45678900000193'),
    ('Fluido de Freio DOT 4', 'Fluido de freio DOT 4 500ml', 28.00, 'FREIOS', '12345678000190'),
    ('Cilindro Mestre de Freio', 'Cilindro mestre do freio', 350.00, 'FREIOS', '89000000000197'),
    ('Amortecedor Monroe', 'Amortecedor dianteiro original', 280.00, 'SUSPENSAO', '56789000000194'),
    ('Kit de Suspensao', 'Kit completo suspensao dianteira', 850.00, 'SUSPENSAO', '56789000000194'),
    ('Barra Estabilizadora', 'Barra estabilizadora traseira', 320.00, 'SUSPENSAO', '89000000000197'),
    ('Bateria 60Ah Moura', 'Bateria automotiva 60Ah', 450.00, 'ELETRICA', '12345678000190'),
    ('Alternador Bosch', 'Alternador 90A remanufaturado', 650.00, 'ELETRICA', '12345678000190'),
    ('Motor de Arranque Denso', 'Motor de partida 12V', 580.00, 'ELETRICA', '67890000000195'),
    ('Sensor de Oxigenio', 'Sonda lambda universal', 280.00, 'ELETRICA', '12345678000190'),
    ('Embreagem LUK', 'Kit embreagem completo', 680.00, 'TRANSMISSAO', '89000000000197'),
    ('Oleo de Cambio', 'Oleo sintetico para transmissao', 120.00, 'TRANSMISSAO', '90000000000198'),
    ('Cabo de Embreagem', 'Cabo de acionamento da embreagem', 85.00, 'TRANSMISSAO', '89000000000197'),
    ('Jogo de Tapetes', 'Tapetes automotivos em borracha', 120.00, 'ACESSORIOS', '01234567000199'),
    ('Capa de Banco', 'Capa de banco em couro sintetico', 280.00, 'ACESSORIOS', '01234567000199'),
    ('Alarme Automotivo', 'Alarme com controle remoto', 350.00, 'ACESSORIOS', '01234567000199')
)
INSERT INTO public.produto (nome, descricao, preco_unitario, id_categoria, id_fabricante)
SELECT sp.nome, sp.descricao, sp.preco_unitario, c.id_categoria, f.id_fabricante
FROM seed_produtos sp
JOIN public.categoria c ON c.nome = sp.categoria_nome
JOIN public.fabricante f ON f.cnpj = sp.fabricante_cnpj
WHERE NOT EXISTS (
  SELECT 1 FROM public.produto p WHERE p.nome = sp.nome
);

INSERT INTO public.tipo_servico (nome, descricao)
SELECT seed.nome, seed.descricao
FROM (
  VALUES
    ('Manutencao Preventiva', 'Servicos de manutencao periodica e preventiva'),
    ('Manutencao Corretiva', 'Reparos e correcoes de problemas mecanicos'),
    ('Diagnostico', 'Analise e diagnostico de problemas'),
    ('Estetica Automotiva', 'Servicos de limpeza e estetica'),
    ('Instalacao', 'Instalacao de acessorios e componentes')
) AS seed(nome, descricao)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tipo_servico ts WHERE ts.nome = seed.nome
);

WITH seed_servicos (nome, descricao, preco, duracao_estimada, tipo_nome) AS (
  VALUES
    ('Troca de Oleo', 'Troca de oleo do motor com filtro, verificacao de niveis e inspecao visual completa', 150.00, 45, 'Manutencao Preventiva'),
    ('Alinhamento e Balanceamento', 'Alinhamento computadorizado das rodas e balanceamento completo dos pneus', 120.00, 60, 'Manutencao Preventiva'),
    ('Revisao de Freios', 'Inspecao completa do sistema de freios, pastilhas, discos e fluido', 200.00, 90, 'Manutencao Preventiva'),
    ('Limpeza de Injetores', 'Limpeza profunda dos bicos injetores de combustivel', 180.00, 90, 'Manutencao Preventiva'),
    ('Higienizacao de Ar-Condicionado', 'Limpeza completa do sistema de ar-condicionado com produtos especializados', 120.00, 60, 'Manutencao Preventiva'),
    ('Troca de Filtros', 'Substituicao de filtro de ar, oleo e combustivel', 100.00, 30, 'Manutencao Preventiva'),
    ('Troca de Pastilhas de Freio', 'Substituicao das pastilhas de freio dianteiras ou traseiras', 280.00, 120, 'Manutencao Corretiva'),
    ('Troca de Correia Dentada', 'Substituicao da correia dentada do motor com verificacao de tensionadores', 450.00, 180, 'Manutencao Corretiva'),
    ('Troca de Bateria', 'Substituicao da bateria com teste do sistema eletrico', 350.00, 30, 'Manutencao Corretiva'),
    ('Troca de Amortecedores', 'Substituicao dos amortecedores dianteiros ou traseiros', 600.00, 180, 'Manutencao Corretiva'),
    ('Reparo de Suspensao', 'Reparo completo do sistema de suspensao', 800.00, 240, 'Manutencao Corretiva'),
    ('Troca de Embreagem', 'Substituicao do kit completo de embreagem', 1200.00, 360, 'Manutencao Corretiva'),
    ('Diagnostico Computadorizado', 'Analise completa do sistema eletronico do veiculo com scanner automotivo', 80.00, 30, 'Diagnostico'),
    ('Diagnostico de Motor', 'Analise tecnica completa do motor', 150.00, 60, 'Diagnostico'),
    ('Teste de Bateria e Alternador', 'Teste completo do sistema de carga', 50.00, 20, 'Diagnostico'),
    ('Polimento e Cristalizacao', 'Polimento completo da pintura com aplicacao de cristalizador', 400.00, 240, 'Estetica Automotiva'),
    ('Lavagem Completa', 'Lavagem externa e interna completa', 80.00, 60, 'Estetica Automotiva'),
    ('Higienizacao Interna', 'Limpeza profunda do interior do veiculo', 150.00, 90, 'Estetica Automotiva'),
    ('Instalacao de Som Automotivo', 'Instalacao completa de sistema de som com chicotes e conectores', 150.00, 120, 'Instalacao'),
    ('Instalacao de Alarme', 'Instalacao e configuracao de alarme automotivo', 200.00, 90, 'Instalacao'),
    ('Instalacao de Sensor de Re', 'Instalacao de sensor de estacionamento', 120.00, 60, 'Instalacao')
)
INSERT INTO public.servico (nome, descricao, preco, duracao_estimada, id_tipo_servico, ativo)
SELECT ss.nome, ss.descricao, ss.preco, ss.duracao_estimada, ts.id_tipo_servico, TRUE
FROM seed_servicos ss
JOIN public.tipo_servico ts ON ts.nome = ss.tipo_nome
WHERE NOT EXISTS (
  SELECT 1 FROM public.servico s WHERE s.nome = ss.nome
);
