-- =============================================================================
-- 002 — Foguinho (sequência de frequência dos servos)
-- Depende da 001 (missao.conta_frequencia).
--
-- Regra adotada (ajuste se for outra):
--   Presente    → acende / soma +1 na sequência
--   Justificada → mantém a chama acesa, mas não soma
--   Falta       → apaga (sequência volta a 0)
-- Só entram missões que já aconteceram e que contam frequência.
-- =============================================================================
BEGIN;

CREATE OR REPLACE VIEW vw_sequencia_servo
WITH (security_invoker = true)
AS
WITH registros AS (
    SELECT
        f.id_servo,
        f.status,
        -- Cada Falta abre um novo "bloco"; a sequência é contada dentro de cada bloco.
        SUM(CASE WHEN f.status = 'Falta' THEN 1 ELSE 0 END)
            OVER (PARTITION BY f.id_servo ORDER BY m.data, m.id_missao) AS bloco
    FROM frequencia f
    JOIN missao m ON m.id_missao = f.id_missao
    WHERE m.conta_frequencia
      AND m.data <= CURRENT_DATE
),
por_bloco AS (
    SELECT
        id_servo,
        bloco,
        COUNT(*) FILTER (WHERE status = 'Presente') AS presencas
    FROM registros
    GROUP BY id_servo, bloco
),
resumo AS (
    SELECT
        id_servo,
        MAX(bloco)     AS bloco_atual,
        MAX(presencas) AS recorde
    FROM por_bloco
    GROUP BY id_servo
)
SELECT
    s.id_servo,
    s.nome,
    COALESCE(pb.presencas, 0)     AS sequencia_atual,
    COALESCE(pb.presencas, 0) > 0 AS chama_acesa,
    COALESCE(r.recorde, 0)        AS recorde
FROM servo s
LEFT JOIN resumo r     ON r.id_servo = s.id_servo
LEFT JOIN por_bloco pb ON pb.id_servo = s.id_servo AND pb.bloco = r.bloco_atual;

COMMIT;
