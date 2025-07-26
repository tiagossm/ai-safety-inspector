-- Adicionar índices para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_checklist_groups_checklist_id ON checklist_groups(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_groups_order ON checklist_groups("order");
CREATE INDEX IF NOT EXISTS idx_checklist_itens_checklist_id ON checklist_itens(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_itens_ordem ON checklist_itens(ordem);
CREATE INDEX IF NOT EXISTS idx_checklist_itens_parent_item_id ON checklist_itens(parent_item_id);

-- Criar função para validar UUIDs (corrigida)
CREATE OR REPLACE FUNCTION validate_uuid_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar se o ID não é "default" ou outros valores inválidos
  IF NEW.id::text = 'default' OR NEW.id::text = '' THEN
    RAISE EXCEPTION 'ID inválido: não pode ser "default" ou vazio';
  END IF;
  
  -- Validar formato UUID usando cast para text
  IF NEW.id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'ID deve ser um UUID válido, recebido: %', NEW.id::text;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para validar UUIDs na tabela checklist_groups
DROP TRIGGER IF EXISTS validate_checklist_groups_uuid ON checklist_groups;
CREATE TRIGGER validate_checklist_groups_uuid
  BEFORE INSERT OR UPDATE ON checklist_groups
  FOR EACH ROW
  EXECUTE FUNCTION validate_uuid_format();