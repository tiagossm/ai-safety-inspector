-- Corrigir questões com tipo de resposta incorreto
UPDATE checklist_itens 
SET tipo_resposta = 'time' 
WHERE id = 'ec8d7b50-2972-4998-b737-e86c4f30b75e' 
AND pergunta = 'Hora' 
AND tipo_resposta = 'yes_no';

-- Corrigir outras questões que deveriam ser texto/dropdown ao invés de time
UPDATE checklist_itens 
SET tipo_resposta = 'text' 
WHERE id = '7ea72f81-781f-407b-a30e-b9ba6dfd4fd6' 
AND pergunta = 'Setor de trabalho' 
AND tipo_resposta = 'time';

UPDATE checklist_itens 
SET tipo_resposta = 'numeric' 
WHERE id = 'c4f49ee0-1976-4c59-b0a4-00cffaea433d' 
AND pergunta = 'Duração da exposição (horas)' 
AND tipo_resposta = 'time';

UPDATE checklist_itens 
SET tipo_resposta = 'yes_no' 
WHERE id = 'bb8f302a-55bf-49ea-ae30-4a6b160a884d' 
AND pergunta = 'Controle administrativo do ruído no local?' 
AND tipo_resposta = 'time';