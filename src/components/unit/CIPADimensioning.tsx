
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CIPADimensioning as CIPADimensioningType } from "@/types/cipa";

interface CIPADimensioningProps {
  dimensioning: CIPADimensioningType;
}

export function CIPADimensioning({ dimensioning }: CIPADimensioningProps) {
  if (!dimensioning) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {dimensioning.norma === 'NR-31' ? 'Dimensionamento da CIPATR' : 
             dimensioning.norma === 'NR-22' ? 'Dimensionamento da CIPAMIN' : 
             'Dimensionamento da CIPA'}
          </CardTitle>
          <Badge variant="outline">{dimensioning.norma}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {dimensioning.message ? (
          <div className="text-center p-2">
            <Badge variant="outline" className="font-medium text-md">
              {dimensioning.message}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Empresas com menos de 20 funcionários e grau de risco 4 devem designar 1 representante da CIPA.
            </p>
          </div>
        ) : dimensioning.observacao ? (
          <p className="text-sm text-muted-foreground">{dimensioning.observacao}</p>
        ) : dimensioning.norma === 'NR-5' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Efetivos</p>
              <p className="text-2xl">{dimensioning.efetivos}</p>
            </div>
            <div>
              <p className="font-medium">Suplentes</p>
              <p className="text-2xl">{dimensioning.suplentes}</p>
            </div>
          </div>
        ) : dimensioning.norma === 'NR-31' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Representantes do Empregador</p>
              <p className="text-2xl">{dimensioning.efetivos_empregador}</p>
            </div>
            <div>
              <p className="font-medium">Representantes dos Empregados</p>
              <p className="text-2xl">{dimensioning.efetivos_empregados}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Representantes do Empregador</p>
              <div className="space-y-1">
                <p>Efetivos: {dimensioning.efetivos_empregador}</p>
                {dimensioning.suplentes_empregador && (
                  <p>Suplentes: {dimensioning.suplentes_empregador}</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium">Representantes dos Empregados</p>
              <div className="space-y-1">
                <p>Efetivos: {dimensioning.efetivos_empregados}</p>
                {dimensioning.suplentes_empregados && (
                  <p>Suplentes: {dimensioning.suplentes_empregados}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
