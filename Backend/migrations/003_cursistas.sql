-- =============================================================================
-- 003 — Cursistas
-- Depende da 001 (missao.publico, usuario).
--
-- Fluxo:
--   1. inscrito         → preencheu o Forms
--   2. em_visitas       → coordenadores gerais fizeram a triagem e liberaram as visitas
--      nao_selecionado  → ficou de fora na triagem
--   3. confirmado       → depois das visitas, confirmou que quer ingressar
--   4. (coordenadores + coord. geral colocam o cursista numa comunidade)
--   5. ativo            → participou do encontro de 2 dias; agora entra no sistema
--                         (aparece na chamada de cursistas)
--   6. concluido        → terminou o ano como cursista
--      promovido        → virou servo (cursista.id_servo) — nem todos viram
--      desistente       → saiu em qualquer etapa
-- =============================================================================
BEGIN;

-- -----------------------------------------------------------------------------
-- 1. COMUNIDADES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunidade (
    id_comunidade int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          varchar NOT NULL UNIQUE,
    tipo          varchar NOT NULL DEFAULT 'cursistas' CHECK (tipo IN ('cursistas', 'servos'))
);
ALTER TABLE comunidade ENABLE ROW LEVEL SECURITY;

INSERT INTO comunidade (nome, tipo) VALUES
    ('Agnus Dei', 'cursistas'),
    ('Kairós',    'cursistas'),
    ('Kenosis',   'cursistas'),
    ('Kyrius',    'cursistas'),
    ('Maranata',  'cursistas')
ON CONFLICT (nome) DO NOTHING;

-- Liga as pastas de Coordenador e Tutor à comunidade. Com isso, quem cuida de cada
-- comunidade num ano sai de servo_pasta (servo → pasta → comunidade), sem cadastro extra.
ALTER TABLE pasta
    ADD COLUMN IF NOT EXISTS id_comunidade int NULL REFERENCES comunidade (id_comunidade);

UPDATE pasta p SET id_comunidade = c.id_comunidade
FROM comunidade c
WHERE (p.id_pasta, c.nome) IN (
    (4, 'Agnus Dei'), (37, 'Agnus Dei'),
    (5, 'Kairós'),    (38, 'Kairós'),
    (6, 'Kenosis'),   (39, 'Kenosis'),
    (7, 'Kyrius'),    (40, 'Kyrius'),
    (8, 'Maranata'),  (41, 'Maranata')
);

-- Padroniza a grafia dos nomes das pastas (estavam "Agnus", "Kairos", "Kenossis", "Maranatha").
UPDATE pasta SET nome = 'Coordenador de Comunidade de Cursistas: ' || c.nome
FROM comunidade c WHERE pasta.id_comunidade = c.id_comunidade AND pasta.id_pasta BETWEEN 4 AND 8;
UPDATE pasta SET nome = 'Tutor da Comunidade de Cursistas: ' || c.nome
FROM comunidade c WHERE pasta.id_comunidade = c.id_comunidade AND pasta.id_pasta BETWEEN 37 AND 41;

-- -----------------------------------------------------------------------------
-- 2. ENCONTRO (2 dias, um por ano)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS encontro (
    id_encontro int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ano         int  NOT NULL UNIQUE,
    data_inicio date NOT NULL,
    data_fim    date NOT NULL,
    local       varchar NULL,
    CONSTRAINT encontro_datas_check CHECK (data_fim >= data_inicio)
);
ALTER TABLE encontro ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. CURSISTA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursista (
    id_cursista      int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome             varchar NOT NULL,
    telefone         varchar NULL,
    email            varchar NULL,
    data_nascimento  date    NULL,
    ano              int     NOT NULL,                    -- ano em que é cursista
    status           varchar NOT NULL DEFAULT 'inscrito' CHECK (status IN (
                         'inscrito', 'em_visitas', 'nao_selecionado', 'confirmado',
                         'ativo', 'concluido', 'promovido', 'desistente')),

    -- Forms: guarda a resposta completa até os campos do formulário serem definidos.
    dados_formulario jsonb   NULL,
    inscrito_em      timestamptz NOT NULL DEFAULT now(),

    -- Triagem dos coordenadores gerais
    triado_por       int     NULL REFERENCES usuario (id_usuario),
    triado_em        timestamptz NULL,
    obs_triagem      text    NULL,

    -- Pós-visitas
    confirmou_em     date    NULL,

    -- Divisão nas comunidades e encontro
    id_comunidade    int     NULL REFERENCES comunidade (id_comunidade),
    id_encontro      int     NULL REFERENCES encontro (id_encontro),

    -- Só para quem virou servo
    id_servo         int     NULL UNIQUE REFERENCES servo (id_servo),

    -- Para estar ativo no sistema precisa ter comunidade e ter passado pelo encontro
    CONSTRAINT cursista_ativo_check CHECK (
        status NOT IN ('ativo', 'concluido', 'promovido')
        OR (id_comunidade IS NOT NULL AND id_encontro IS NOT NULL)
    ),
    CONSTRAINT cursista_promovido_check CHECK ((status = 'promovido') = (id_servo IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_cursista_ano_status  ON cursista (ano, status);
CREATE INDEX IF NOT EXISTS ix_cursista_comunidade  ON cursista (id_comunidade);
ALTER TABLE cursista ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. VISITAS (3 por cursista, feitas por coordenadores e tutores)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visita_cursista (
    id_visita   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cursista int      NOT NULL REFERENCES cursista (id_cursista),
    numero      smallint NOT NULL CHECK (numero BETWEEN 1 AND 3),
    data        date     NULL,
    realizada   boolean  NOT NULL DEFAULT false,
    observacao  text     NULL,
    CONSTRAINT uq_visita_cursista UNIQUE (id_cursista, numero)
);
ALTER TABLE visita_cursista ENABLE ROW LEVEL SECURITY;

-- Quem foi na visita (um ou mais servos: coordenador, tutor...)
CREATE TABLE IF NOT EXISTS visita_responsavel (
    id_visita int NOT NULL REFERENCES visita_cursista (id_visita) ON DELETE CASCADE,
    id_servo  int NOT NULL REFERENCES servo (id_servo),
    PRIMARY KEY (id_visita, id_servo)
);
ALTER TABLE visita_responsavel ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 5. CHAMADA DOS CURSISTAS (missões com publico 'cursistas' ou 'ambos')
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS frequencia_cursista (
    id_frequencia_cursista int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cursista    int     NOT NULL REFERENCES cursista (id_cursista),
    id_missao      int     NOT NULL REFERENCES missao (id_missao),
    status         varchar NOT NULL CHECK (status IN ('Presente', 'Falta', 'Justificada')),
    registrado_por int     NULL REFERENCES usuario (id_usuario),
    registrado_em  timestamptz NOT NULL DEFAULT now(),
    atualizado_por int     NULL REFERENCES usuario (id_usuario),
    atualizado_em  timestamptz NULL,
    CONSTRAINT uq_frequencia_cursista UNIQUE (id_cursista, id_missao)
);
CREATE INDEX IF NOT EXISTS ix_frequencia_cursista_missao ON frequencia_cursista (id_missao);
ALTER TABLE frequencia_cursista ENABLE ROW LEVEL SECURITY;

-- Só cursista ativo, em missão de cursistas
CREATE OR REPLACE FUNCTION fn_valida_frequencia_cursista()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM missao WHERE id_missao = NEW.id_missao
                   AND publico IN ('cursistas', 'ambos')) THEN
        RAISE EXCEPTION 'A missão % não é do calendário de cursistas.', NEW.id_missao;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM cursista WHERE id_cursista = NEW.id_cursista
                   AND status IN ('ativo', 'concluido', 'promovido')) THEN
        RAISE EXCEPTION 'O cursista % ainda não passou pelo encontro.', NEW.id_cursista;
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.atualizado_em := now();
    END IF;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_valida_frequencia_cursista ON frequencia_cursista;
CREATE TRIGGER trg_valida_frequencia_cursista
    BEFORE INSERT OR UPDATE ON frequencia_cursista
    FOR EACH ROW EXECUTE FUNCTION fn_valida_frequencia_cursista();

-- -----------------------------------------------------------------------------
-- 6. QUEM CUIDA DE CADA COMUNIDADE (no ano atual)
-- -----------------------------------------------------------------------------
-- O backend usa isto para o perfil coordenador_comunidade_cursista ver só a própria
-- comunidade (se for essa a regra).
CREATE OR REPLACE VIEW vw_responsaveis_comunidade
WITH (security_invoker = true)
AS
SELECT
    c.id_comunidade,
    c.nome AS comunidade,
    s.id_servo,
    s.nome AS servo,
    CASE WHEN p.nome ILIKE 'Tutor%' THEN 'tutor' ELSE 'coordenador' END AS funcao,
    sp.ano
FROM pasta p
JOIN comunidade c   ON c.id_comunidade = p.id_comunidade
JOIN servo_pasta sp ON sp.id_pasta = p.id_pasta
JOIN servo s        ON s.id_servo = sp.id_servo
WHERE sp.ano = EXTRACT(YEAR FROM CURRENT_DATE);

COMMIT;
