
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MediaRenderer } from "@/components/media/MediaRenderer";

// Componente badge simples
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700 mr-1 ${className}`}>
      {children}
    </span>
  );
}

// Expansor JSON para objetos complexos
function ExpandableJson({ data }: { data: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(val => !val)}
        className="text-xs underline text-blue-700 hover:text-blue-900"
        title={open ? "Ocultar detalhes" : "Ver detalhes"}
        style={{ cursor: "pointer" }}
      >
        {open ? "Ocultar detalhes" : "Ver detalhes"}
      </button>
      {open && (
        <pre className="mt-1 p-2 bg-gray-50 text-gray-700 rounded text-xs max-h-48 overflow-auto border">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// Função utilitária para identificar o tipo de questão
function getQuestionType(question: any) {
  // Os principais nomes possíveis do tipo
  return (
    question.responseType ||
    question.tipo_resposta ||
    question.type ||
    question.tipo ||
    ""
  ).toLowerCase();
}

// Renderização personalizada da resposta
function renderAnswer(answer: any, question: any) {
  const type = getQuestionType(question);
  // Logging para debug em dev
  if (typeof answer === "object" && answer !== null) {
    console.log("[InspectionSummary] Resposta objeto para questão:", question, answer);
  }

  // Casos "não respondido"
  if (
    answer === undefined ||
    answer === null ||
    (typeof answer === "string" && answer.trim() === "")
  ) {
    return <span className="text-amber-600">Não respondido</span>;
  }

  // Respostas booleanas
  if (typeof answer === "boolean") {
    return (
      <Badge className={answer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
        {answer ? "Sim" : "Não"}
      </Badge>
    );
  }

  // Respostas número
  if (typeof answer === "number") {
    return <Badge className="bg-blue-100 text-blue-700">{answer}</Badge>;
  }

  // Respostas texto simples
  if (typeof answer === "string") {
    // Se for data/hora
    if (["date", "datetime", "hora", "time"].includes(type) && answer.length >= 8) {
      // Apenas melhora exibição para datas
      return <Badge className="bg-purple-100 text-purple-700">{answer}</Badge>;
    }
    return <span>{answer}</span>;
  }

  // Múltipla escolha array
  if (Array.isArray(answer)) {
    if (answer.length === 0) {
      return <span className="text-amber-600">Não respondido</span>;
    }
    return (
      <span>
        {answer.map((v, idx) => (
          <Badge key={idx}>{String(v)}</Badge>
        ))}
      </span>
    );
  }

  // Objetos: campos de múltipla/checkbox
  if (typeof answer === "object" && answer !== null) {
    // Verdadeiro para objetos simples tipo: { a: true, b: false }
    const entries = Object.entries(answer);
    // Todos valores booleanos ou "true"/"false"
    if (
      entries.length > 0 &&
      entries.every(
        ([, v]) =>
          typeof v === "boolean" ||
          v === "true" ||
          v === "false" ||
          typeof v === "string"
      )
    ) {
      const checked = entries.filter(([, v]) => v === true || v === "true").map(([k]) => k);
      if (checked.length > 0) {
        return (
          <span>
            {checked.map((item, idx) => (
              <Badge key={item + idx}>{item}</Badge>
            ))}
          </span>
        );
      }
      return <span className="text-amber-600">Não respondido</span>;
    }

    // Fallback: objeto complexo - expandir
    return (
      <span title="Resposta é uma estrutura complexa, veja detalhes abaixo.">
        <Badge className="bg-gray-200 text-gray-800">Resposta complexa</Badge>
        <ExpandableJson data={answer} />
      </span>
    );
  }

  // Fallback geral
  return (
    <span className="text-amber-700" title="Tipo de resposta não reconhecido">{String(answer)}</span>
  );
}

interface InspectionAnswersSummaryProps {
  questions: any[];
  responses: Record<string, any>;
}

export function InspectionAnswersSummary({ questions, responses }: InspectionAnswersSummaryProps) {
  if (!questions || questions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Este checklist não possui questões.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const response = responses?.[question.id] || {};
        const answer = response.value;
        const notes = response.comment ?? "";
        const mediaUrls: string[] = response.mediaUrls || [];

        return (
          <Card key={question.id} className="p-4 mb-2">
            <div className="space-y-2">
              <h3 className="font-medium">{question.text || question.pergunta}</h3>
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <span className="text-muted-foreground mr-2">Resposta:</span>
                <div className="flex-1">{renderAnswer(answer, question)}</div>
              </div>
              {notes && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Observações:</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
              {mediaUrls.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">Mídias:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="border rounded overflow-hidden h-24 bg-gray-100 flex items-center justify-center">
                        <MediaRenderer url={url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

