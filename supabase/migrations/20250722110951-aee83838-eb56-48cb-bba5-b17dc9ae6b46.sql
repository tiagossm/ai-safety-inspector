
-- 1. Modificar a tabela inspection_responses para incluir todas as informações necessárias
ALTER TABLE inspection_responses
ADD COLUMN IF NOT EXISTS question_id uuid REFERENCES checklist_itens(id),
ADD COLUMN IF NOT EXISTS question_text text,
ADD COLUMN IF NOT EXISTS question_type varchar(50),
ADD COLUMN IF NOT EXISTS question_options jsonb,
ADD COLUMN IF NOT EXISTS question_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS question_order integer,
ADD COLUMN IF NOT EXISTS question_weight integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS question_group_id uuid,
ADD COLUMN IF NOT EXISTS question_group_name text,
ADD COLUMN IF NOT EXISTS allows_photo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allows_video boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allows_audio boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allows_files boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hint text,
ADD COLUMN IF NOT EXISTS parent_question_id uuid,
ADD COLUMN IF NOT EXISTS condition_value text,
ADD COLUMN IF NOT EXISTS has_subchecklist boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subchecklist_id uuid;

-- 2. Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_inspection_responses_inspection_id ON inspection_responses(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_responses_question_id ON inspection_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_inspection_responses_created_at ON inspection_responses(created_at);

-- 3. Adicionar constraint de unicidade para evitar respostas duplicadas
ALTER TABLE inspection_responses 
ADD CONSTRAINT IF NOT EXISTS unique_inspection_question 
UNIQUE (inspection_id, question_id);

-- 4. Criar tabela para snapshots de checklists (para preservar estrutura no momento da inspeção)
CREATE TABLE IF NOT EXISTS inspection_checklist_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  checklist_id uuid NOT NULL,
  checklist_title text NOT NULL,
  checklist_description text,
  snapshot_data jsonb NOT NULL, -- Estrutura completa do checklist
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(inspection_id, checklist_id)
);

-- 5. Habilitar RLS na nova tabela
ALTER TABLE inspection_checklist_snapshots ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para snapshots
CREATE POLICY "Users can view snapshots for their inspections" 
  ON inspection_checklist_snapshots 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_checklist_snapshots.inspection_id 
    AND inspections.user_id = auth.uid()
  ));

CREATE POLICY "Users can create snapshots for their inspections" 
  ON inspection_checklist_snapshots 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_checklist_snapshots.inspection_id 
    AND inspections.user_id = auth.uid()
  ));

-- 7. Habilitar RLS na tabela inspection_responses se ainda não estiver
ALTER TABLE inspection_responses ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para inspection_responses
DROP POLICY IF EXISTS "Users can view their inspection responses" ON inspection_responses;
DROP POLICY IF EXISTS "Users can create their inspection responses" ON inspection_responses;
DROP POLICY IF EXISTS "Users can update their inspection responses" ON inspection_responses;
DROP POLICY IF EXISTS "Users can delete their inspection responses" ON inspection_responses;

CREATE POLICY "Users can view their inspection responses" 
  ON inspection_responses 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_responses.inspection_id 
    AND inspections.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their inspection responses" 
  ON inspection_responses 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_responses.inspection_id 
    AND inspections.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their inspection responses" 
  ON inspection_responses 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_responses.inspection_id 
    AND inspections.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their inspection responses" 
  ON inspection_responses 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_responses.inspection_id 
    AND inspections.user_id = auth.uid()
  ));

-- 9. Função para criar snapshot do checklist
CREATE OR REPLACE FUNCTION create_checklist_snapshot(p_inspection_id uuid, p_checklist_id uuid)
RETURNS uuid AS $$
DECLARE
  v_snapshot_id uuid;
  v_checklist_data jsonb;
BEGIN
  -- Buscar dados completos do checklist
  SELECT json_build_object(
    'checklist', c.*,
    'items', COALESCE(items.items_data, '[]'::json),
    'groups', COALESCE(groups.groups_data, '[]'::json)
  )::jsonb INTO v_checklist_data
  FROM checklists c
  LEFT JOIN (
    SELECT 
      checklist_id,
      json_agg(
        json_build_object(
          'id', id,
          'pergunta', pergunta,
          'tipo_resposta', tipo_resposta,
          'obrigatorio', obrigatorio,
          'ordem', ordem,
          'opcoes', opcoes,
          'weight', weight,
          'permite_foto', permite_foto,
          'permite_video', permite_video,
          'permite_audio', permite_audio,
          'permite_files', permite_files,
          'hint', hint,
          'parent_item_id', parent_item_id,
          'level', level,
          'path', path,
          'display_condition', display_condition,
          'is_conditional', is_conditional,
          'has_subchecklist', has_subchecklist,
          'sub_checklist_id', sub_checklist_id,
          'condition_value', condition_value
        ) ORDER BY ordem
      ) as items_data
    FROM checklist_itens
    WHERE checklist_id = p_checklist_id
    GROUP BY checklist_id
  ) items ON c.id = items.checklist_id
  LEFT JOIN (
    SELECT 
      checklist_id,
      json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'order', "order"
        ) ORDER BY "order"
      ) as groups_data
    FROM checklist_groups
    WHERE checklist_id = p_checklist_id
    GROUP BY checklist_id
  ) groups ON c.id = groups.checklist_id
  WHERE c.id = p_checklist_id;

  -- Inserir snapshot
  INSERT INTO inspection_checklist_snapshots (
    inspection_id,
    checklist_id,
    checklist_title,
    checklist_description,
    snapshot_data
  )
  SELECT 
    p_inspection_id,
    p_checklist_id,
    (v_checklist_data->'checklist'->>'title'),
    (v_checklist_data->'checklist'->>'description'),
    v_checklist_data
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger para criar snapshot automaticamente quando uma inspeção é criada
CREATE OR REPLACE FUNCTION trigger_create_checklist_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.checklist_id IS NOT NULL THEN
    PERFORM create_checklist_snapshot(NEW.id, NEW.checklist_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_create_checklist_snapshot ON inspections;
CREATE TRIGGER auto_create_checklist_snapshot
  AFTER INSERT ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_checklist_snapshot();
