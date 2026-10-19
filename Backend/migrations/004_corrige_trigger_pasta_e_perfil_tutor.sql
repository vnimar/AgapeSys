-- =============================================================================
-- 004 — Corrige o trigger antigo de pastas e adiciona o perfil do tutor
-- =============================================================================
BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Trigger antigo de repetição de pasta
-- -----------------------------------------------------------------------------
-- validar_repeticao_pasta() lia pasta.excecao_repeticao, que a 001 renomeou para
-- pode_repetir: depois disso todo INSERT em servo_pasta falha. A regra continua
-- valendo pelo trg_valida_repeticao_pasta (criado na 001), que também considera
-- servos com mais de uma pasta no ano anterior.
DROP TRIGGER IF EXISTS trg_validar_repeticao_pasta ON servo_pasta;
DROP FUNCTION IF EXISTS validar_repeticao_pasta();

-- -----------------------------------------------------------------------------
-- 2. Perfil do tutor de comunidade de cursistas
-- -----------------------------------------------------------------------------
--  coordenador_comunidade_cursista → faz parte do conselho; vê e faz a chamada
--                                    só da própria comunidade
--  tutor_comunidade_cursista       → auxilia o coordenador: faz a chamada da
--                                    própria comunidade, sem as funções do conselho
-- A comunidade de cada um vem de vw_responsaveis_comunidade
-- (usuario.id_servo → servo_pasta do ano → pasta.id_comunidade).
ALTER TABLE usuario DROP CONSTRAINT usuario_perfil_check;
ALTER TABLE usuario
    ADD CONSTRAINT usuario_perfil_check CHECK (perfil IN (
        'servo',
        'coordenador_formacao_vivencia',
        'coordenador_comunidade_cursista',
        'tutor_comunidade_cursista',
        'coordenador_geral',
        'administrador'
    ));

COMMIT;
