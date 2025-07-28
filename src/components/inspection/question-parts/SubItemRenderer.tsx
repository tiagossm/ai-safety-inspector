import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Plus, Minus } from 'lucide-react';
import { InspectionQuestion } from '../InspectionQuestion';
import { standardizeQuestion } from '@/utils/responseTypeStandardization';

interface SubItemRendererProps {
  parentQuestion: any;
  subItems: any[];
  responses: Record<string, any>;
  onResponseChange: (questionId: string, data: any) => void;
  onAddSubItem?: (parentId: string) => void;
  onRemoveSubItem?: (subItemId: string) => void;
  readOnly?: boolean;
  level?: number;
  maxLevel?: number;
}

export function SubItemRenderer({
  parentQuestion,
  subItems = [],
  responses = {},
  onResponseChange,
  onAddSubItem,
  onRemoveSubItem,
  readOnly = false,
  level = 0,
  maxLevel = 3
}: SubItemRendererProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand primeiro e segundo níveis
  const [visibleSubItems, setVisibleSubItems] = useState<any[]>([]);

  useEffect(() => {
    // Filtrar subitens baseado em condições de exibição
    const filtered = subItems.filter(subItem => {
      if (!subItem.display_condition) return true;
      
      // Verificar condição de exibição baseada na resposta do pai
      const parentResponse = responses[parentQuestion.id];
      if (!parentResponse) return false;
      
      const condition = subItem.display_condition;
      if (condition.dependsOn && condition.value) {
        return parentResponse.value === condition.value;
      }
      
      return true;
    });

    setVisibleSubItems(filtered);
  }, [subItems, responses, parentQuestion.id]);

  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddSubItem = () => {
    if (onAddSubItem && level < maxLevel) {
      onAddSubItem(parentQuestion.id);
    }
  };

  const handleRemoveSubItem = (subItemId: string) => {
    if (onRemoveSubItem) {
      onRemoveSubItem(subItemId);
    }
  };

  const getIndentClass = (currentLevel: number) => {
    const indentMap = {
      0: 'ml-0',
      1: 'ml-4',
      2: 'ml-8',
      3: 'ml-12'
    };
    return indentMap[currentLevel as keyof typeof indentMap] || 'ml-16';
  };

  const getBorderColor = (currentLevel: number) => {
    const colorMap = {
      0: 'border-blue-200',
      1: 'border-green-200',
      2: 'border-yellow-200',
      3: 'border-red-200'
    };
    return colorMap[currentLevel as keyof typeof colorMap] || 'border-gray-200';
  };

  const getBackgroundColor = (currentLevel: number) => {
    const colorMap = {
      0: 'bg-blue-50',
      1: 'bg-green-50',
      2: 'bg-yellow-50',
      3: 'bg-red-50'
    };
    return colorMap[currentLevel as keyof typeof colorMap] || 'bg-gray-50';
  };

  if (visibleSubItems.length === 0 && !onAddSubItem) {
    return null;
  }

  return (
    <div className={`${getIndentClass(level)} space-y-2`}>
      {/* Cabeçalho dos subitens */}
      {visibleSubItems.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleExpansion}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          <span className="text-sm font-medium text-gray-600">
            Subitens ({visibleSubItems.length})
          </span>
          
          {!readOnly && onAddSubItem && level < maxLevel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubItem}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar
            </Button>
          )}
        </div>
      )}

      {/* Lista de subitens */}
      {isExpanded && (
        <div className="space-y-3">
          {visibleSubItems.map((subItem, index) => {
            const standardSubItem = standardizeQuestion(subItem);
            const subItemResponse = responses[subItem.id] || {};
            
            // Buscar subitens do subitem atual (recursivo)
            const nestedSubItems = subItems.filter(item => item.parent_item_id === subItem.id);
            
            return (
              <Card 
                key={subItem.id} 
                className={`${getBorderColor(level)} ${getBackgroundColor(level)} border-l-4`}
              >
                <div className="p-3">
                  {/* Cabeçalho do subitem */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-white rounded-full font-medium">
                        {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        Nível {level + 1}
                      </span>
                    </div>
                    
                    {!readOnly && onRemoveSubItem && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubItem(subItem.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Renderizar questão do subitem */}
                  <InspectionQuestion
                    question={standardSubItem}
                    index={index}
                    response={subItemResponse}
                    onResponseChange={(data) => onResponseChange(subItem.id, data)}
                    isSubQuestion={true}
                    numberLabel={`${index + 1}`}
                  />

                  {/* Renderizar subitens aninhados (recursivo) */}
                  {nestedSubItems.length > 0 && (
                    <div className="mt-4">
                      <SubItemRenderer
                        parentQuestion={subItem}
                        subItems={nestedSubItems}
                        responses={responses}
                        onResponseChange={onResponseChange}
                        onAddSubItem={onAddSubItem}
                        onRemoveSubItem={onRemoveSubItem}
                        readOnly={readOnly}
                        level={level + 1}
                        maxLevel={maxLevel}
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Botão para adicionar primeiro subitem */}
      {visibleSubItems.length === 0 && !readOnly && onAddSubItem && level < maxLevel && (
        <div className="text-center py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSubItem}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar primeiro subitem
          </Button>
        </div>
      )}
    </div>
  );
}