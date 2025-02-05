import { useState } from "react";

export default function CompanyList() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            {/* Botão para abrir o formulário */}
            <button 
                className="cadastrar-btn" 
                onClick={() => setShowForm(true)}
            >
                + Cadastrar Empresa
            </button>

            {/* Modal com o formulário */}
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Cadastrar Nova Empresa</h2>
                        
                        <input type="text" placeholder="CNPJ da Empresa" className="input-field"/>
                        <select className="input-field">
                            <option>Selecione o grau de risco</option>
                            <option value="1">Risco 1</option>
                            <option value="2">Risco 2</option>
                            <option value="3">Risco 3</option>
                        </select>

                        <button className="cadastrar-btn">Cadastrar</button>
                        <button className="fechar-btn" onClick={() => setShowForm(false)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
