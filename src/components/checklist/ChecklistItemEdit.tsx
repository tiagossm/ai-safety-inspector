import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { ChecklistItem } from '../../../types/ChecklistItem';
import { Container, Form, Button } from 'react-bootstrap';

const ChecklistItemEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [checklistItem, setChecklistItem] = useState<ChecklistItem | null>(null);
  const [descricao, setDescricao] = useState('');
  const [tipoResposta, setTipoResposta] = useState('');
  const [obrigatorio, setObrigatorio] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    const fetchChecklistItem = async () => {
      try {
        const response = await api.get(`/checklist-itens/${id}`);
        setChecklistItem(response.data);
        setDescricao(response.data.descricao);
        setTipoResposta(response.data.tipo_resposta);
        setObrigatorio(response.data.obrigatorio);
        // Carregar opções se for múltipla escolha
        if (
          response.data.tipo_resposta === 'seleção múltipla' ||
          response.data.tipo_resposta === 'multiple_choice'
        ) {
          setOptions(response.data.options || []);
        }
      } catch (error) {
        console.error('Erro ao buscar item da checklist:', error);
      }
    };

    fetchChecklistItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.put(`/checklist-itens/${id}`, {
        descricao,
        tipo_resposta: tipoResposta,
        obrigatorio,
        options: tipoResposta === 'seleção múltipla' || tipoResposta === 'multiple_choice' ? options : undefined,
      });

      // Redirecionar ou mostrar mensagem de sucesso
    } catch (error) {
      console.error('Erro ao editar item da checklist:', error);
    }
  };

  const tiposResposta = [
    'sim/não',
    'numérico',
    'texto',
    'assinatura',
    'seleção múltipla',
    'yes_no',
    'multiple_choice',
    'imagem',
    'time',   // alterado de 'hora' para 'time'
    'date'    // alterado de 'data' para 'date'
  ];

  if (!checklistItem) {
    return <div>Carregando...</div>;
  }

  return (
    <Container>
      <h1>Editar Item da Checklist</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="descricao">
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="tipoResposta">
          <Form.Label>Tipo de Resposta</Form.Label>
          <Form.Control
            as="select"
            value={tipoResposta}
            onChange={(e) => {
              setTipoResposta(e.target.value);
              // Limpa opções se mudar para outro tipo
              if (e.target.value !== 'seleção múltipla' && e.target.value !== 'multiple_choice') {
                setOptions([]);
              }
            }}
            required
          >
            <option value="">Selecione um tipo</option>
            {tiposResposta.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {/* Campo de opções para múltipla escolha */}
        {(tipoResposta === 'seleção múltipla' || tipoResposta === 'multiple_choice') && (
          <Form.Group controlId="opcoesMultiplaEscolha" className="mt-3">
            <Form.Label>Opções</Form.Label>
            {options.map((opt, idx) => (
              <div key={idx} className="d-flex align-items-center mb-2">
                <Form.Control
                  type="text"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[idx] = e.target.value;
                    setOptions(newOpts);
                  }}
                  className="me-2"
                  required
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                  tabIndex={-1}
                >
                  Remover
                </Button>
              </div>
            ))}
            <div className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Adicionar opção"
                value={newOption}
                onChange={e => setNewOption(e.target.value)}
                className="me-2"
              />
              <Button
                variant="outline-primary"
                size="sm"
                onClick={e => {
                  e.preventDefault();
                  if (newOption.trim()) {
                    setOptions([...options, newOption.trim()]);
                    setNewOption('');
                  }
                }}
              >
                Adicionar
              </Button>
            </div>
          </Form.Group>
        )}

        <Form.Group controlId="obrigatorio">
          <Form.Check
            type="checkbox"
            label="Obrigatório"
            checked={obrigatorio}
            onChange={(e) => setObrigatorio(e.target.checked)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Salvar
        </Button>
      </Form>
    </Container>
  );
};

export default ChecklistItemEdit;