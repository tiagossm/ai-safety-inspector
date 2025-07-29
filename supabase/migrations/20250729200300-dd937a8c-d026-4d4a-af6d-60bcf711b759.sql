-- Corrigir tipos de resposta inconsistentes no banco de dados
-- Atualizar perguntas relacionadas a tempo que estão marcadas como 'texto' para 'time'
UPDATE checklist_itens 
SET tipo_resposta = 'time'
WHERE tipo_resposta = 'texto' 
AND (
  LOWER(pergunta) LIKE '%hora%' OR
  LOWER(pergunta) LIKE '%horário%' OR
  LOWER(pergunta) LIKE '%horario%' OR
  LOWER(pergunta) LIKE '%tempo%' OR
  LOWER(pergunta) LIKE '%time%' OR
  LOWER(pergunta) LIKE '%relógio%' OR
  LOWER(pergunta) LIKE '%relogio%' OR
  pergunta LIKE '%h%' OR
  pergunta LIKE '%min%'
);

-- Atualizar perguntas relacionadas a data que estão marcadas como 'texto' para 'date'
UPDATE checklist_itens 
SET tipo_resposta = 'date'
WHERE tipo_resposta = 'texto' 
AND (
  LOWER(pergunta) LIKE '%data%' OR
  LOWER(pergunta) LIKE '%date%' OR
  LOWER(pergunta) LIKE '%dia%' OR
  LOWER(pergunta) LIKE '%mês%' OR
  LOWER(pergunta) LIKE '%mes%' OR
  LOWER(pergunta) LIKE '%ano%' OR
  LOWER(pergunta) LIKE '%year%' OR
  LOWER(pergunta) LIKE '%calendario%' OR
  LOWER(pergunta) LIKE '%calendar%'
);

-- Atualizar perguntas relacionadas a data e hora que estão marcadas como 'texto' para 'datetime'
UPDATE checklist_itens 
SET tipo_resposta = 'datetime'
WHERE tipo_resposta = 'texto' 
AND (
  (LOWER(pergunta) LIKE '%data%' AND LOWER(pergunta) LIKE '%hora%') OR
  (LOWER(pergunta) LIKE '%date%' AND LOWER(pergunta) LIKE '%time%') OR
  LOWER(pergunta) LIKE '%timestamp%' OR
  LOWER(pergunta) LIKE '%datetime%'
);

-- Normalizar tipos de resposta para garantir consistência
UPDATE checklist_itens 
SET tipo_resposta = 'yes_no'
WHERE tipo_resposta IN ('sim/não', 'sim/nao', 'boolean', 'Sim / Não');

UPDATE checklist_itens 
SET tipo_resposta = 'multiple_choice'
WHERE tipo_resposta IN ('seleção múltipla', 'selecao multipla', 'Seleção Múltipla', 'Lista Suspensa');

UPDATE checklist_itens 
SET tipo_resposta = 'multiple_select'
WHERE tipo_resposta IN ('caixas de seleção', 'caixas de selecao', 'Seleção Múltipla (Caixas)');

UPDATE checklist_itens 
SET tipo_resposta = 'text'
WHERE tipo_resposta = 'texto';

UPDATE checklist_itens 
SET tipo_resposta = 'numeric'
WHERE tipo_resposta IN ('numérico', 'numerico', 'Numérico');

UPDATE checklist_itens 
SET tipo_resposta = 'paragraph'
WHERE tipo_resposta IN ('parágrafo', 'paragrafo', 'Parágrafo');