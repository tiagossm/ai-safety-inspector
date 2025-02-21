
import { Badge } from "@/components/ui/badge";

interface CIPADimensioningProps {
  dimensioning: {
    type: string;
    dimensioning: any;
    error?: string;
  } | null;
}

export function CIPADimensioning({ dimensioning }: CIPADimensioningProps) {
  if (!dimensioning) return null;
  if (dimensioning.error) {
    return (
      <div className="text-sm text-muted-foreground">
        {dimensioning.error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">Dimensionamento da CIPA</h4>
        <Badge variant="outline">{dimensioning.type}</Badge>
      </div>

      {dimensioning.type === 'NR5' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Grau de Risco</p>
            <p className="text-sm text-muted-foreground">{dimensioning.dimensioning.grau_de_risco}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Número de Integrantes</p>
            <p className="text-sm text-muted-foreground">{dimensioning.dimensioning.numero_integrantes}</p>
          </div>
        </div>
      )}

      {dimensioning.type === 'NR22' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Representantes do Empregador</p>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Titulares: {dimensioning.dimensioning.representantes_titulares_empregador}
              </p>
              <p className="text-sm text-muted-foreground">
                Suplentes: {dimensioning.dimensioning.representantes_suplentes_empregador}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Representantes dos Empregados</p>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Titulares: {dimensioning.dimensioning.representantes_titulares_empregados}
              </p>
              <p className="text-sm text-muted-foreground">
                Suplentes: {dimensioning.dimensioning.representantes_suplentes_empregados}
              </p>
            </div>
          </div>
        </div>
      )}

      {dimensioning.type === 'NR31' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Representantes do Empregador</p>
            <p className="text-sm text-muted-foreground">
              {dimensioning.dimensioning.representantes_empregador}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Representantes dos Trabalhadores</p>
            <p className="text-sm text-muted-foreground">
              {dimensioning.dimensioning.representantes_trabalhadores}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
