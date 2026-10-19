-- =============================================================================
-- 005 — Local e horário de cada missão passam a ficar no banco
-- Antes vinham de MISSAO_INFO (backend/config/missao_config.py), pela descrição:
-- não dava para mudar uma missão só (ex.: remarcar por causa de eleição).
-- =============================================================================
BEGIN;

ALTER TABLE missao
    ADD COLUMN IF NOT EXISTS observacao    text        NULL,  -- ex.: "Remarcada por causa da eleição"
    ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NULL;

-- Copia os valores que estavam no código para as missões que ainda não têm.
-- "Formação de Cursistas" estava no singular no código e por isso nunca recebia local/horário.
UPDATE missao m
SET horario = COALESCE(m.horario, v.horario::time),
    local   = COALESCE(m.local, v.local)
FROM (VALUES
    ('Formação de Cursistas',                 'Paróquia São Miguel',                   '16:00'),
    ('Ação social',                           'A Definir',                             '15:30'),
    ('Formação de Servos',                    'Paróquia São Miguel',                   '17:00'),
    ('Missa Mensal do Ágape',                 'Capela NSS das Graças',                 '19:30'),
    ('Missa em Ação de Graças do Ágape',      'Paróquia São Miguel',                   '19:30'),
    ('Encontro Querigmático',                 'Paróquia São Miguel',                   '07:00'),
    ('Confraternização do Ágape de Jovens',   'A Definir',                             '14:30'),
    ('Entrega de Pastas',                     'Paróquia São Miguel',                   '19:30'),
    ('Noite de Louvor',                       'Paróquia São Miguel',                   '19:30'),
    ('Retiro de Servos',                      'A Definir',                             '13:00'),
    ('Pós-Querigma',                          'Paróquia São Miguel',                   '16:00'),
    ('Intercessão Mensal do Ágape',           'Paróquia São Miguel',                   '17:00'),
    ('Intercessão Pré-Encontro Querigmático', 'Paróquia São Miguel',                   '17:00')
) AS v (descricao, local, horario)
WHERE m.descricao = v.descricao;

CREATE OR REPLACE FUNCTION fn_missao_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.atualizado_em := now();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_missao_atualizado_em ON missao;
CREATE TRIGGER trg_missao_atualizado_em
    BEFORE UPDATE ON missao
    FOR EACH ROW EXECUTE FUNCTION fn_missao_atualizado_em();

COMMIT;
