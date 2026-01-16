-- Criar tabela tipo_servico
CREATE TABLE IF NOT EXISTS tipo_servico (
  id_tipo_servico SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela servico
CREATE TABLE IF NOT EXISTS servico (
  id_servico SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  duracao_estimada INT NOT NULL,
  id_tipo_servico INT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_servico_tipo FOREIGN KEY (id_tipo_servico) REFERENCES tipo_servico(id_tipo_servico) ON DELETE RESTRICT
);

-- Criar tabela agendamento
CREATE TABLE IF NOT EXISTS agendamento (
  id_agendamento SERIAL PRIMARY KEY,
  id_servico INT NOT NULL,
  id_usuario INT,
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  nome_cliente VARCHAR(200) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  veiculo VARCHAR(200) NOT NULL,
  observacoes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_agendamento_servico FOREIGN KEY (id_servico) REFERENCES servico(id_servico) ON DELETE RESTRICT,
  CONSTRAINT fk_agendamento_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL
);

-- Inserir tipos de serviço padrão
INSERT INTO tipo_servico (nome, descricao) VALUES
('Manutenção Preventiva', 'Serviços de manutenção regular e preventiva do veículo'),
('Manutenção Corretiva', 'Reparos e correções de problemas do veículo'),
('Diagnóstico', 'Análise e diagnóstico de problemas'),
('Estética Automotiva', 'Serviços de limpeza, polimento e estética'),
('Instalação', 'Instalação de acessórios e componentes')
ON CONFLICT DO NOTHING;

-- Inserir serviços padrão
INSERT INTO servico (nome, descricao, preco, duracao_estimada, id_tipo_servico) VALUES
('Troca de Óleo', 'Troca de óleo do motor com filtro, verificação de níveis e inspeção visual completa', 150.00, 45, 1),
('Alinhamento e Balanceamento', 'Alinhamento computadorizado das rodas e balanceamento completo dos pneus', 120.00, 60, 1),
('Revisão de Freios', 'Inspeção completa do sistema de freios, pastilhas, discos e fluido', 200.00, 90, 1),
('Troca de Pastilhas de Freio', 'Substituição das pastilhas de freio dianteiras ou traseiras', 280.00, 120, 2),
('Troca de Correia Dentada', 'Substituição da correia dentada do motor com verificação de tensionadores', 450.00, 180, 2),
('Diagnóstico Computadorizado', 'Análise completa do sistema eletrônico do veículo com scanner automotivo', 80.00, 30, 3),
('Troca de Bateria', 'Substituição da bateria com teste do sistema elétrico', 350.00, 30, 2),
('Limpeza de Injetores', 'Limpeza profunda dos bicos injetores de combustível', 180.00, 90, 1),
('Polimento e Cristalização', 'Polimento completo da pintura com aplicação de cristalizador', 400.00, 240, 4),
('Instalação de Som Automotivo', 'Instalação completa de sistema de som com chicotes e conectores', 150.00, 120, 5),
('Higienização de Ar-Condicionado', 'Limpeza completa do sistema de ar-condicionado com produtos especializados', 120.00, 60, 1),
('Troca de Amortecedores', 'Substituição dos amortecedores dianteiros ou traseiros', 600.00, 180, 2)
ON CONFLICT DO NOTHING;
