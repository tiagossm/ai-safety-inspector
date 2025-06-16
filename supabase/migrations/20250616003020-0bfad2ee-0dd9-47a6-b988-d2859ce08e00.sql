
-- Criar bucket 'reports' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Criar política para permitir upload de arquivos autenticados
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir leitura de relatórios
CREATE POLICY "Authenticated users can read reports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir atualização de relatórios
CREATE POLICY "Authenticated users can update reports"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);
