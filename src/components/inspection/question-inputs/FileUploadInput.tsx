import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, File, Download, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadInputProps {
  value?: string[];
  onChange: (fileUrls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  inspectionId?: string;
  questionId?: string;
  readOnly?: boolean;
}

export function FileUploadInput({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  allowedTypes = ['application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt'],
  inspectionId,
  questionId,
  readOnly = false
}: FileUploadInputProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Verificar limite de arquivos
    if (value.length + files.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Verificar tamanho dos arquivos
    const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Arquivos muito grandes. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // Verificar tipos de arquivo
    const invalidFiles = files.filter(file => {
      return !allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });
    });

    if (invalidFiles.length > 0) {
      toast.error('Tipo de arquivo não permitido');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${inspectionId}_${questionId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('inspection-files')
          .upload(fileName, file);

        if (error) {
          console.error('Erro no upload:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('inspection-files')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newFileUrls = [...value, ...uploadedUrls];
      onChange(newFileUrls);
      
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso`);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(`Erro no upload: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
      // Limpar input
      event.target.value = '';
    }
  }, [value, onChange, maxFiles, maxSizeMB, allowedTypes, inspectionId, questionId]);

  const removeFile = useCallback((index: number) => {
    const newFileUrls = value.filter((_, i) => i !== index);
    onChange(newFileUrls);
    toast.success('Arquivo removido');
  }, [value, onChange]);

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return <File className="h-4 w-4" />;
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    // Tentar extrair nome original se houver timestamp
    const match = fileName.match(/_\d+_[a-z0-9]+\.(.+)$/);
    if (match) {
      return `arquivo.${match[1]}`;
    }
    return fileName;
  };

  const getFileSize = (url: string) => {
    // Como não temos acesso ao tamanho do arquivo após upload,
    // retornamos um placeholder
    return 'Tamanho desconhecido';
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Botão de upload */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <input
            type="file"
            id={`file-upload-${questionId}`}
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || value.length >= maxFiles}
          />
          
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => document.getElementById(`file-upload-${questionId}`)?.click()}
            disabled={uploading || value.length >= maxFiles}
            className="text-xs flex items-center gap-1"
          >
            <Paperclip className="h-3.5 w-3.5" />
            {uploading ? 'Enviando...' : 'Adicionar arquivo'}
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxFiles} arquivo(s)
          </span>
        </div>
      )}

      {/* Lista de arquivos */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Arquivos anexados ({value.length})
          </h4>
          
          {value.map((fileUrl, index) => {
            const fileName = getFileName(fileUrl);
            
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border rounded-lg bg-white hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(fileUrl)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getFileSize(fileUrl)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openFile(fileUrl)}
                    className="h-8 w-8 p-0"
                    title="Visualizar arquivo"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(fileUrl, fileName)}
                    className="h-8 w-8 p-0"
                    title="Baixar arquivo"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  {!readOnly && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                      title="Remover arquivo"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Informações sobre tipos de arquivo permitidos */}
      {!readOnly && (
        <div className="text-xs text-gray-500">
          <p>Tipos permitidos: PDF, Word, Excel, PowerPoint, ZIP, RAR, TXT</p>
          <p>Tamanho máximo: {maxSizeMB}MB por arquivo</p>
        </div>
      )}

      {/* Estado vazio */}
      {value.length === 0 && (
        <div className="text-center p-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum arquivo anexado</p>
          {!readOnly && (
            <p>Clique em "Adicionar arquivo" para anexar documentos</p>
          )}
        </div>
      )}
    </div>
  );
}