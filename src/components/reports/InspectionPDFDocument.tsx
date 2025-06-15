
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportDTO } from '@/types/reportDto';

// Definir cores e estilos
const colors = {
  primary: '#00966E',
  secondary: '#FFBF00', 
  danger: '#D72638',
  text: '#333333',
  lightGray: '#F5F5F5',
  white: '#FFFFFF'
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#CCCCCC',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#CCCCCC',
    backgroundColor: colors.lightGray,
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#CCCCCC',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'left',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  mediaItem: {
    width: 120,
    height: 120,
    border: '1px solid #CCCCCC',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImage: {
    width: 100,
    height: 80,
    objectFit: 'cover',
  },
  qrCode: {
    width: 50,
    height: 50,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 150,
    height: 75,
    marginBottom: 10,
  },
  compliantText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  nonCompliantText: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    width: '70%',
  },
});

interface InspectionPDFDocumentProps {
  reportData: ReportDTO;
}

export const InspectionPDFDocument: React.FC<InspectionPDFDocumentProps> = ({ reportData }) => {
  return (
    <Document>
      {/* Capa Interna */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Inspeção</Text>
          <Image style={styles.logo} src="/lovable-uploads/LogoazulFT.png" />
        </View>
        
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Empresa:</Text>
            <Text style={styles.value}>{reportData.inspection.companyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Checklist:</Text>
            <Text style={styles.value}>{reportData.inspection.checklistTitle}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Inspetor:</Text>
            <Text style={styles.value}>{reportData.inspector.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>
              {new Date(reportData.inspection.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          {reportData.inspection.location && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Local:</Text>
              <Text style={styles.value}>{reportData.inspection.location}</Text>
            </View>
          )}
        </View>
      </Page>

      {/* Resumo Executivo */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Resumo Executivo</Text>
        
        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Conformidade</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Não Conformidades</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Total de Mídias</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Questões</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{reportData.summary.conformityPercent}%</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{reportData.summary.totalNc}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{reportData.summary.totalMedia}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {reportData.summary.completedQuestions}/{reportData.summary.totalQuestions}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metodologia & Escopo */}
        <Text style={styles.subtitle}>Metodologia & Escopo</Text>
        <View style={styles.section}>
          <Text>
            {reportData.inspection.description || 
             'Esta inspeção foi realizada seguindo as melhores práticas de segurança e saúde ocupacional, com base nos padrões estabelecidos no checklist aplicado. Todas as evidências foram coletadas e documentadas para garantir a rastreabilidade dos resultados.'}
          </Text>
        </View>
      </Page>

      {/* Resultados Detalhados */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Resultados Detalhados</Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>Nº</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '40%' }]}>
              <Text style={styles.tableCellHeader}>Pergunta</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Resposta</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text style={styles.tableCellHeader}>Observação</Text>
            </View>
          </View>
          
          {reportData.responses.map((response, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.tableCell}>{response.questionNumber}</Text>
              </View>
              <View style={[styles.tableCol, { width: '40%' }]}>
                <Text style={styles.tableCell}>{response.questionText}</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={[
                  styles.tableCell,
                  response.isCompliant ? styles.compliantText : styles.nonCompliantText
                ]}>
                  {response.answer}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '30%' }]}>
                <Text style={styles.tableCell}>{response.comments || '-'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* Plano de Ação */}
      {reportData.actionPlan.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Plano de Ação</Text>
          
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '8%' }]}>
                <Text style={styles.tableCellHeader}>Nº</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '32%' }]}>
                <Text style={styles.tableCellHeader}>Não Conformidade</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '32%' }]}>
                <Text style={styles.tableCellHeader}>Ação</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '18%' }]}>
                <Text style={styles.tableCellHeader}>Responsável</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '10%' }]}>
                <Text style={styles.tableCellHeader}>Prazo</Text>
              </View>
            </View>
            
            {reportData.actionPlan.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '8%' }]}>
                  <Text style={styles.tableCell}>{item.questionNumber}</Text>
                </View>
                <View style={[styles.tableCol, { width: '32%' }]}>
                  <Text style={styles.tableCell}>{item.nonConformity}</Text>
                </View>
                <View style={[styles.tableCol, { width: '32%' }]}>
                  <Text style={styles.tableCell}>{item.action}</Text>
                </View>
                <View style={[styles.tableCol, { width: '18%' }]}>
                  <Text style={styles.tableCell}>{item.responsible}</Text>
                </View>
                <View style={[styles.tableCol, { width: '10%' }]}>
                  <Text style={styles.tableCell}>{item.dueDate}</Text>
                </View>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* Galeria de Evidências */}
      {(reportData.mediaByType.photos.length > 0 || 
        reportData.mediaByType.videos.length > 0 || 
        reportData.mediaByType.audios.length > 0 || 
        reportData.mediaByType.files.length > 0) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Galeria de Evidências</Text>
          
          {/* Fotos */}
          {reportData.mediaByType.photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Fotos</Text>
              <View style={styles.mediaGrid}>
                {reportData.mediaByType.photos.map((photo, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image style={styles.mediaImage} src={photo.url} />
                    <Text style={{ fontSize: 8, marginTop: 5 }}>
                      Perg. {photo.questionNumber} - Foto {index + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Vídeos */}
          {reportData.mediaByType.videos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Vídeos</Text>
              <View style={styles.mediaGrid}>
                {reportData.mediaByType.videos.map((video, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={{ fontSize: 12, marginBottom: 5 }}>▶</Text>
                    <Image style={styles.qrCode} src={video.qrCode} />
                    <Text style={{ fontSize: 8, marginTop: 5 }}>
                      Perg. {video.questionNumber} - Vídeo {index + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Áudios */}
          {reportData.mediaByType.audios.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Áudios</Text>
              <View style={styles.mediaGrid}>
                {reportData.mediaByType.audios.map((audio, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={{ fontSize: 12, marginBottom: 5 }}>🎤</Text>
                    <Image style={styles.qrCode} src={audio.qrCode} />
                    <Text style={{ fontSize: 8, marginTop: 5 }}>
                      Perg. {audio.questionNumber} - Áudio {index + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Arquivos */}
          {reportData.mediaByType.files.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Arquivos</Text>
              <View style={styles.mediaGrid}>
                {reportData.mediaByType.files.map((file, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={{ fontSize: 12, marginBottom: 5 }}>📎</Text>
                    <Image style={styles.qrCode} src={file.qrCode} />
                    <Text style={{ fontSize: 8, marginTop: 5 }}>
                      {file.fileName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Page>
      )}

      {/* Assinaturas */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Assinaturas</Text>
        
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.subtitle}>Inspetor</Text>
            {reportData.signatures.inspectorSignature && (
              <Image 
                style={styles.signatureImage} 
                src={reportData.signatures.inspectorSignature} 
              />
            )}
            <Text>{reportData.inspector.name}</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>
              {reportData.signatures.signedAt && 
               new Date(reportData.signatures.signedAt).toLocaleString('pt-BR')}
            </Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.subtitle}>Responsável da Empresa</Text>
            {reportData.signatures.companySignature && (
              <Image 
                style={styles.signatureImage} 
                src={reportData.signatures.companySignature} 
              />
            )}
            <Text>_________________________</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>
              {reportData.signatures.signedAt && 
               new Date(reportData.signatures.signedAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
