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

  useEffect(() => {
    const fetchChecklistItem = async () => {
      try {
        const response = await api.get(`/checklist-itens/${id}`);
        setChecklistItem(response.data);
        setDescricao(response.data.descricao);
        setTipoResposta(response.data.tipo_resposta);
        setObrigatorio(response.data.obrigatorio);
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
            onChange={(e) => setTipoResposta(e.target.value)}
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