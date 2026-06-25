import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// ==========================================
// COMPONENTE: TELA DE AUTENTICAÇÃO (RF001 / RF002)
// ==========================================
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', tipo: 'usuario' });
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.senha || (!isLogin && !formData.nome)) {
      setErro('Preencha todos os campos obrigatórios.'); return;
    }

    if (isLogin) {
      // Simulação de verificação no Banco de Dados
      const savedUsers = JSON.parse(localStorage.getItem('floody_users')) || [
        { nome: 'Admin Floody', email: 'admin@floody.com', senha: '123', tipo: 'admin' } // Admin padrão criado
      ];
      const user = savedUsers.find(u => u.email === formData.email && u.senha === formData.senha);
      
      if (user) {
        localStorage.setItem('floody_active_session', JSON.stringify(user));
        onLogin(user);
      } else {
        setErro('E-mail ou senha incorretos.');
      }
    } else {
      // Simulação de Cadastro (RF001)
      const savedUsers = JSON.parse(localStorage.getItem('floody_users')) || [
        { nome: 'Admin Floody', email: 'admin@floody.com', senha: '123', tipo: 'admin' }
      ];
      const newUser = { id: Date.now(), nome: formData.nome, email: formData.email, senha: formData.senha, tipo: 'usuario' };
      savedUsers.push(newUser);
      localStorage.setItem('floody_users', JSON.stringify(savedUsers));
      localStorage.setItem('floody_active_session', JSON.stringify(newUser));
      onLogin(newUser);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">F<span className="drop">💧</span></div>
          <h2>Floody</h2>
        </div>
        <p className="auth-subtitle">{isLogin ? 'Faça login para continuar' : 'Cadastre-se na plataforma'}</p>
        {erro && <div className="auth-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Nome Completo</label>
              <input type="text" placeholder="Ex: Yuri José" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>
          )}
          <div className="input-group">
            <label>E-mail</label>
            <input type="email" placeholder="seuemail@exemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" placeholder="••••••••" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary auth-btn">{isLogin ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        <div className="auth-switch">
          <span>{isLogin ? 'Não tem conta?' : 'Já possui conta?'}</span>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErro(''); }}>
            {isLogin ? 'Criar agora' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL: APP INTERNO
// ==========================================
function MainApp({ user, onLogout }) {
  // Estado de navegação inicial
  const [activeTab, setActiveTab] = useState(user.tipo === 'admin' ? 'admin_dashboard' : 'mapa');
  
  // Estados de Dados (Simulando o Firebase Firestore)
  const [veiculos, setVeiculos] = useState(JSON.parse(localStorage.getItem('floody_veiculos')) || []);
  const [reportes, setReportes] = useState(JSON.parse(localStorage.getItem('floody_reportes')) || []);
  
  // Formulários Locais
  const [formVeiculo, setFormVeiculo] = useState({ modelo: '', marca: '', ano: '', tipo: 'Carro', altura: '' });
  const [formReporte, setFormReporte] = useState({ tipo: 'Alagamento', descricao: '', local: 'Capturando GPS...' });

  const recifeCenter = [-8.05428, -34.8813];
  const [zones, setZones] = useState([
    { id: 'z1', nome: "Av. Agamenon Magalhães", status: "Crítico", nivel: 1.80, coords: [-8.0470, -34.8770], raio: 600, cor: '#ef4444' },
    { id: 'z2', nome: "Av. Domingos Ferreira", status: "Atenção", nivel: 0.90, coords: [-8.1130, -34.8940], raio: 500, cor: '#f59e0b' }
  ]);

  // --- FUNÇÕES DE VEÍCULO (RF005) ---
  const handleSaveVeiculo = (e) => {
    e.preventDefault();
    const novoVeiculo = { ...formVeiculo, id: Date.now(), userId: user.email };
    const novaLista = [...veiculos, novoVeiculo];
    setVeiculos(novaLista);
    localStorage.setItem('floody_veiculos', JSON.stringify(novaLista));
    alert('Veículo salvo com sucesso! O Floody agora calculará rotas baseadas na altura do seu veículo.');
    setFormVeiculo({ modelo: '', marca: '', ano: '', tipo: 'Carro', altura: '' });
  };

  // --- FUNÇÕES DE REPORTE DA COMUNIDADE (RF016) ---
  const handleSaveReporte = (e) => {
    e.preventDefault();
    const novoReporte = { ...formReporte, id: Date.now(), autor: user.nome, status: 'Pendente', data: new Date().toLocaleDateString() };
    const novaLista = [...reportes, novoReporte];
    setReportes(novaLista);
    localStorage.setItem('floody_reportes', JSON.stringify(novaLista));
    alert('Ocorrência enviada para validação da equipe do Floody!');
    setFormReporte({ tipo: 'Alagamento', descricao: '', local: 'Av. Caxangá, Recife (Simulado)' });
  };

  // --- FUNÇÕES ADMINISTRATIVAS (RF023) ---
  const aprovarReporte = (id) => {
    const atualizado = reportes.map(r => r.id === id ? { ...r, status: 'Aprovado (Visível no Mapa)' } : r);
    setReportes(atualizado);
    localStorage.setItem('floody_reportes', JSON.stringify(atualizado));
  };

  const deletarReporte = (id) => {
    const atualizado = reportes.filter(r => r.id !== id);
    setReportes(atualizado);
    localStorage.setItem('floody_reportes', JSON.stringify(atualizado));
  };

  return (
    <div className="floody-pro-layout">
      {/* ================= BARRA LATERAL (MENU) ================= */}
      <aside className="pro-sidebar">
        <div className="logo-container">
          <div className="logo-mark">F<span className="drop">💧</span></div>
          <h2>Floody</h2>
        </div>

        <nav className="pro-nav">
          {/* Menu para Usuário Comum */}
          {user.tipo !== 'admin' && (
            <>
              <button className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}>🗺️ Mapa de Risco</button>
              <button className={`nav-item ${activeTab === 'alertas' ? 'active' : ''}`} onClick={() => setActiveTab('alertas')}>🚨 Alertas Oficiais</button>
              <button className={`nav-item ${activeTab === 'veiculos' ? 'active' : ''}`} onClick={() => setActiveTab('veiculos')}>🚗 Meus Veículos</button>
              <button className={`nav-item ${activeTab === 'reportar' ? 'active' : ''}`} onClick={() => setActiveTab('reportar')}>📸 Reportar Problema</button>
              <button className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>👤 Meu Perfil</button>
            </>
          )}

          {/* Menu para Administrador (RF022 / RF023) */}
          {user.tipo === 'admin' && (
            <>
              <div className="admin-badge">Área Restrita</div>
              <button className={`nav-item ${activeTab === 'admin_dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('admin_dashboard')}>📊 Visão Geral</button>
              <button className={`nav-item ${activeTab === 'admin_reportes' ? 'active' : ''}`} onClick={() => setActiveTab('admin_reportes')}>✅ Validar Ocorrências</button>
              <button className={`nav-item ${activeTab === 'admin_usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('admin_usuarios')}>👥 Gestão de Usuários</button>
            </>
          )}
        </nav>

        <div className="user-profile">
          <div className="user-info">
            <strong>{user.nome}</strong>
            <span>{user.tipo === 'admin' ? 'Administrador' : 'Usuário Comum'}</span>
          </div>
          <button onClick={onLogout} className="logout-btn" title="Sair">🚪</button>
        </div>
      </aside>

      {/* ================= ÁREA DE CONTEÚDO ================= */}
      <main className="pro-workspace">
        
        {/* --- TELA: MAPA DE RISCO (RF007) --- */}
        {activeTab === 'mapa' && (
          <div className="fade-in fullscreen-tab">
            <header className="content-header">
              <h1>Mapa Inteligente de Mobilidade</h1>
              <p>Evite áreas alagadas baseadas na altura do seu veículo.</p>
            </header>
            <div className="map-container-box">
              <MapContainer center={recifeCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {zones.map(z => (
                  <Circle key={z.id} center={z.coords} radius={z.raio} pathOptions={{ color: z.cor, fillColor: z.cor, fillOpacity: 0.5 }}>
                    <Popup><div style={{ color: '#000' }}><strong>{z.nome}</strong><br/>Status: {z.status}<br/>Nível d'água: {z.nivel}m</div></Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* --- TELA: CADASTRO DE VEÍCULO (RF005) --- */}
        {activeTab === 'veiculos' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header">
              <h1>Garagem Floody</h1>
              <p>Cadastre os dados físicos do seu veículo para cálculos de rotas precisos.</p>
            </header>
            
            <div className="form-card">
              <h3>Adicionar Novo Veículo</h3>
              <form onSubmit={handleSaveVeiculo} className="grid-form">
                <div className="input-group">
                  <label>Marca</label>
                  <input type="text" placeholder="Ex: Honda" value={formVeiculo.marca} onChange={e => setFormVeiculo({...formVeiculo, marca: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Modelo</label>
                  <input type="text" placeholder="Ex: Civic" value={formVeiculo.modelo} onChange={e => setFormVeiculo({...formVeiculo, modelo: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Ano</label>
                  <input type="number" placeholder="Ex: 2020" value={formVeiculo.ano} onChange={e => setFormVeiculo({...formVeiculo, ano: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Tipo</label>
                  <select value={formVeiculo.tipo} onChange={e => setFormVeiculo({...formVeiculo, tipo: e.target.value})}>
                    <option>Carro</option>
                    <option>Moto</option>
                    <option>Caminhão</option>
                  </select>
                </div>
                <div className="input-group full-width">
                  <label>Altura livre do solo (em cm)</label>
                  <input type="number" placeholder="Ex: 15" value={formVeiculo.altura} onChange={e => setFormVeiculo({...formVeiculo, altura: e.target.value})} required />
                  <small>Isso ajuda a IA a saber se seu carro passa pelo alagamento.</small>
                </div>
                <button type="submit" className="btn-primary">Salvar Veículo</button>
              </form>
            </div>

            <div className="list-card mt-20">
              <h3>Seus Veículos Registrados</h3>
              <div className="items-list">
                {veiculos.filter(v => v.userId === user.email).length === 0 ? <p>Nenhum veículo cadastrado ainda.</p> : null}
                {veiculos.filter(v => v.userId === user.email).map(v => (
                  <div key={v.id} className="item-row">
                    <div className="item-icon">🚗</div>
                    <div className="item-details">
                      <strong>{v.marca} {v.modelo} ({v.ano})</strong>
                      <span>Tipo: {v.tipo} | Altura: {v.altura}cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TELA: REPORTAR PROBLEMA (RF016 / RF017) --- */}
        {activeTab === 'reportar' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header">
              <h1>Colaboração Comunitária</h1>
              <p>Ajude outros motoristas reportando perigos nas vias.</p>
            </header>

            <div className="form-card">
              <form onSubmit={handleSaveReporte} className="grid-form">
                <div className="input-group full-width">
                  <label>Tipo de Ocorrência</label>
                  <select value={formReporte.tipo} onChange={e => setFormReporte({...formReporte, tipo: e.target.value})}>
                    <option>Alagamento Intransitável</option>
                    <option>Acúmulo de Água Leve</option>
                    <option>Buraco Perigoso</option>
                    <option>Via Interditada por Árvore</option>
                  </select>
                </div>
                <div className="input-group full-width">
                  <label>Localização Automática (GPS)</label>
                  <input type="text" value={formReporte.local} disabled className="disabled-input" />
                </div>
                <div className="input-group full-width">
                  <label>Descrição Adicional</label>
                  <textarea placeholder="Ex: Água cobrindo o pneu de carros de passeio..." value={formReporte.descricao} onChange={e => setFormReporte({...formReporte, descricao: e.target.value})} required></textarea>
                </div>
                <div className="input-group full-width">
                  <label>Anexar Foto da Via</label>
                  <input type="file" accept="image/*" className="file-input" />
                </div>
                <button type="submit" className="btn-danger">Enviar Alerta de Emergência</button>
              </form>
            </div>
          </div>
        )}

        {/* --- TELA: ADMIN - VALIDAR REPORTES (RF023) --- */}
        {activeTab === 'admin_reportes' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header">
              <h1>Validação de Ocorrências (Modo Admin)</h1>
              <p>Revise as informações da comunidade antes de exibi-las no mapa público.</p>
            </header>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Autor</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>Nenhuma ocorrência pendente.</td></tr>}
                  {reportes.map(r => (
                    <tr key={r.id}>
                      <td>{r.data}</td>
                      <td>{r.autor}</td>
                      <td><span className="badge-tipo">{r.tipo}</span></td>
                      <td>{r.descricao}</td>
                      <td><strong className={r.status === 'Pendente' ? 'text-warning' : 'text-safe'}>{r.status}</strong></td>
                      <td>
                        {r.status === 'Pendente' && <button onClick={() => aprovarReporte(r.id)} className="btn-icon check">✔️ Aprovar</button>}
                        <button onClick={() => deletarReporte(r.id)} className="btn-icon delete">🗑️ Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ==========================================
// BOOTSTRAP DA APLICAÇÃO
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const session = localStorage.getItem('floody_active_session');
    if (session) setUser(JSON.parse(session));
  }, []);
  const handleLogout = () => { localStorage.removeItem('floody_active_session'); setUser(null); };

  return <>{!user ? <AuthScreen onLogin={setUser} /> : <MainApp user={user} onLogout={handleLogout} />}</>;
}