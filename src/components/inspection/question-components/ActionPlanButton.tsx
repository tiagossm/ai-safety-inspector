      <div className="flex flex-wrap gap-2">
        <div style={{ background: "yellow", color: "black", padding: 8 }}>
          TESTE FIXO
        </div>
        {/* BOTÃO DE TESTE SIMPLES */}
        <button
          style={{
            border: '2px solid #888',
            padding: '6px 16px',
            borderRadius: '8px',
            background: 'white',
            color: 'black'
          }}
          onClick={() => alert('Cliquei no Plano de Ação')}
        >
          Plano de Ação TESTE
        </button>
        {(question.allowsPhoto || question.allowsVideo || question.permite_foto || question.permite_video) && (
          <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
        )}
      </div>
