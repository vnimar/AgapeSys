-- =============================================================================
-- 001 — Perfis, servos (inativação/retorno), pastas, missões e frequência
-- Rodar no SQL Editor do Supabase. Tudo roda numa transação: se algo falhar,
-- nada é aplicado.
-- =============================================================================
BEGIN;

-- -----------------------------------------------------------------------------
-- 1. PERFIS (usuario)
-- -----------------------------------------------------------------------------
--  servo                           → vê calendário, a própria frequência, a própria pasta e o foguinho
--  coordenador_formacao_vivencia   → faz a chamada de servos; não vê cursistas
--  coordenador_comunidade_cursista → vê cursistas e faz a chamada deles; nada de servos
--  coordenador_geral               → quase administrador (o que é "capado" fica no backend)
--  administrador                   → tudo
ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS senha_hash   varchar,
    ADD COLUMN IF NOT EXISTS ativo        boolean     NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS id_servo     int         NULL,
    ADD COLUMN IF NOT EXISTS criado_em    timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS ultimo_login timestamptz NULL;

ALTER TABLE usuario
    ADD CONSTRAINT usuario_perfil_check CHECK (perfil IN (
        'servo',
        'coordenador_formacao_vivencia',
        'coordenador_comunidade_cursista',
        'coordenador_geral',
        'administrador'
    )),
    -- Login ligado ao cadastro do servo (o coordenador também é servo).
    -- Um servo tem no máximo um login.
    ADD CONSTRAINT fk_usuario_servo FOREIGN KEY (id_servo) REFERENCES servo (id_servo),
    ADD CONSTRAINT uq_usuario_servo UNIQUE (id_servo);

-- -----------------------------------------------------------------------------
-- 2. SERVOS
-- -----------------------------------------------------------------------------
-- Ninguém é excluído: quem sai fica 'Inativo' e pode voltar em até 2 anos.
-- Enquanto estiver inativo, não acessa o sistema (o login checa o status).
UPDATE servo SET status = 'Ativo' WHERE status IS NULL;

ALTER TABLE servo
    ALTER COLUMN status SET DEFAULT 'Ativo',
    ALTER COLUMN status SET NOT NULL,
    ADD CONSTRAINT servo_status_check CHECK (status IN ('Ativo', 'Inativo')),
    ADD COLUMN IF NOT EXISTS foto_url  varchar     NULL,  -- arquivo no Supabase Storage
    ADD COLUMN IF NOT EXISTS criado_em timestamptz NOT NULL DEFAULT now();

-- Histórico de saídas e retornos (substitui a antiga aprovacao_exclusao).
CREATE TABLE IF NOT EXISTS servo_afastamento (
    id_afastamento int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_servo       int  NOT NULL REFERENCES servo (id_servo),
    data_saida     date NOT NULL,
    data_retorno   date NULL,                    -- preenchida quando o servo volta
    motivo         text NULL,
    registrado_por int  NULL REFERENCES usuario (id_usuario),
    criado_em      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT afastamento_datas_check CHECK (data_retorno IS NULL OR data_retorno >= data_saida),
    -- Regra dos 2 anos: o retorno precisa acontecer até 2 anos depois da saída.
    CONSTRAINT afastamento_prazo_retorno_check
        CHECK (data_retorno IS NULL OR data_retorno <= data_saida + INTERVAL '2 years')
);
CREATE INDEX IF NOT EXISTS ix_afastamento_servo ON servo_afastamento (id_servo);
-- Só um afastamento em aberto por servo.
CREATE UNIQUE INDEX IF NOT EXISTS uq_afastamento_aberto
    ON servo_afastamento (id_servo) WHERE data_retorno IS NULL;
ALTER TABLE servo_afastamento ENABLE ROW LEVEL SECURITY;

-- aprovacao_exclusao: está vazia e nenhum código usa. Só é removida se continuar vazia.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM aprovacao_exclusao) THEN
        RAISE EXCEPTION 'aprovacao_exclusao tem registros — revise antes de remover.';
    END IF;
END $$;
DROP TABLE IF EXISTS aprovacao_exclusao;

-- -----------------------------------------------------------------------------
-- 3. PASTAS — regra de repetição
-- -----------------------------------------------------------------------------
-- "excecao_repeticao = true" significava "é exceção à regra, pode repetir".
-- O nome novo deixa isso explícito. Os valores atuais são mantidos: revise pasta por
-- pasta depois (ex.: Música = true, Ornamentação = false).
ALTER TABLE pasta RENAME COLUMN excecao_repeticao TO pode_repetir;

-- Bloqueia: servo na mesma pasta em anos seguidos, se a pasta não puder repetir.
CREATE OR REPLACE FUNCTION fn_valida_repeticao_pasta()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM servo_pasta sp
        JOIN pasta p ON p.id_pasta = sp.id_pasta
        WHERE sp.id_servo = NEW.id_servo
          AND sp.id_pasta = NEW.id_pasta
          AND sp.ano = NEW.ano - 1
          AND p.pode_repetir = false
    ) THEN
        RAISE EXCEPTION 'Esta pasta não pode ser repetida no ano seguinte (servo %, pasta %, ano %).',
            NEW.id_servo, NEW.id_pasta, NEW.ano;
    END IF;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_valida_repeticao_pasta ON servo_pasta;
CREATE TRIGGER trg_valida_repeticao_pasta
    BEFORE INSERT OR UPDATE OF id_servo, id_pasta, ano ON servo_pasta
    FOR EACH ROW EXECUTE FUNCTION fn_valida_repeticao_pasta();

CREATE INDEX IF NOT EXISTS ix_servo_pasta_ano ON servo_pasta (ano, id_servo);

-- -----------------------------------------------------------------------------
-- 4. MISSÕES — calendários separados
-- -----------------------------------------------------------------------------
ALTER TABLE missao
    ADD COLUMN IF NOT EXISTS publico          varchar NOT NULL DEFAULT 'servos',
    ADD COLUMN IF NOT EXISTS horario          time    NULL,  -- hoje está fixo no código (MISSAO_INFO)
    ADD COLUMN IF NOT EXISTS local            varchar NULL,  -- idem
    ADD COLUMN IF NOT EXISTS conta_frequencia boolean NOT NULL DEFAULT true;

ALTER TABLE missao
    ADD CONSTRAINT missao_publico_check CHECK (publico IN ('servos', 'cursistas', 'ambos'));

CREATE INDEX IF NOT EXISTS ix_missao_data ON missao (data);

-- -----------------------------------------------------------------------------
-- 5. FREQUÊNCIA — quem fez / alterou a chamada
-- -----------------------------------------------------------------------------
ALTER TABLE frequencia
    ADD COLUMN IF NOT EXISTS registrado_por int         NULL REFERENCES usuario (id_usuario),
    ADD COLUMN IF NOT EXISTS atualizado_por int         NULL REFERENCES usuario (id_usuario),
    ADD COLUMN IF NOT EXISTS atualizado_em  timestamptz NULL;

CREATE INDEX IF NOT EXISTS ix_frequencia_missao ON frequencia (id_missao);

CREATE OR REPLACE FUNCTION fn_frequencia_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.atualizado_em := now();
    END IF;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_frequencia_atualizado_em ON frequencia;
CREATE TRIGGER trg_frequencia_atualizado_em
    BEFORE UPDATE ON frequencia
    FOR EACH ROW EXECUTE FUNCTION fn_frequencia_atualizado_em();

COMMIT;
