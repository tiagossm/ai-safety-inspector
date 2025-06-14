
-- Atualizar perguntas de múltipla escolha com opções vazias ou nulas
UPDATE checklist_itens 
SET opcoes = '["Opção 1", "Opção 2", "Opção 3"]'::jsonb
WHERE tipo_resposta IN ('seleção múltipla', 'multiple_choice', 'dropdown', 'checkboxes', 'caixas de seleção', 'lista suspensa')
AND (opcoes IS NULL OR opcoes = '[]'::jsonb OR jsonb_array_length(opcoes) = 0);

-- Verificar se há perguntas que ainda precisam de correção
SELECT 
    id, 
    pergunta, 
    tipo_resposta, 
    opcoes,
    CASE 
        WHEN opcoes IS NULL THEN 'NULL'
        WHEN opcoes = '[]'::jsonb THEN 'EMPTY_ARRAY'
        WHEN jsonb_array_length(opcoes) = 0 THEN 'ZERO_LENGTH'
        ELSE 'HAS_OPTIONS'
    END as status_opcoes
FROM checklist_itens 
WHERE tipo_resposta IN ('seleção múltipla', 'multiple_choice', 'dropdown', 'checkboxes', 'caixas de seleção', 'lista suspensa')
ORDER BY created_at DESC;
