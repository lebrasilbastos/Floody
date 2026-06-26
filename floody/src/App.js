import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import 'leaflet/dist/leaflet.css';
import './App.css';

// ==========================================
// TELA DE AUTENTICAÇÃO
// ==========================================
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.senha || (!isLogin && !formData.nome)) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('floody_users')) || [
      { nome: 'Admin Floody', email: 'admin@floody.com', senha: '123', tipo: 'admin' }
    ];

    if (isLogin) {
      const user = savedUsers.find(u => u.email === formData.email && u.senha === formData.senha);
      if (user) {
        localStorage.setItem('floody_active_session', JSON.stringify(user));
        onLogin(user);
      } else {
        setErro('E-mail ou senha incorretos.');
      }
    } else {
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
              <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>
          )}
          <div className="input-group">
            <label>E-mail</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary auth-btn">{isLogin ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        <div className="auth-switch">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErro(''); }}>
            {isLogin ? 'Não tem conta? Criar agora' : 'Já possui conta? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// APLICATIVO PRINCIPAL (RESPONSIVO E COMPLETO)
// ==========================================
function MainApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('mapa');
  const [mapMode, setMapMode] = useState('dark'); // dark, satellite, alert
  const [veiculos, setVeiculos] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [formVeiculo, setFormVeiculo] = useState({ modelo: '', marca: '', ano: '', tipo: 'Carro', altura: '' });
  const [formReporte, setFormReporte] = useState({ tipo: 'Alagamento', descricao: '', local: 'GPS: Av. Agamenon Magalhães (Detectado)' });
  
  // Estado para controlar a tela de sucesso do alerta enviado
  const [statusEnvioAlerta, setStatusEnvioAlerta] = useState('formulario'); // formulario | sucesso

  // Dados de Telemetria Climática ao vivo simulando sensores de satélite e sensores de nível de bacia
  const [dadosSensores, setDadosSensores] = useState([
    { hora: '04:00', chuva_mm: 12, nível_bacia: 0.4 },
    { hora: '05:00', chuva_mm: 18, nível_bacia: 0.6 },
    { hora: '06:00', chuva_mm: 35, nível_bacia: 1.2 },
    { hora: '07:00', chuva_mm: 58, nível_bacia: 2.1 },
    { hora: '08:00', chuva_mm: 42, nível_bacia: 1.9 },
    { hora: 'Agora', chuva_mm: 45, nível_bacia: 2.3 },
  ]);

  useEffect(() => {
    setVeiculos(JSON.parse(localStorage.getItem('floody_veiculos')) || []);
    setReportes(JSON.parse(localStorage.getItem('floody_reportes')) || []);
  }, []);

  // Simulação de dados de telemetria atualizando sozinhos (Efeito ao vivo de TV)
  useEffect(() => {
    const interval = setInterval(() => {
      setDadosSensores(dadosAtuais => {
        const modificados = [...dadosAtuais];
        const indexUltimo = modificados.length - 1;
        const oscilacaoChuva = Math.max(5, Math.min(100, modificados[indexUltimo].chuva_mm + (Math.random() * 8 - 4)));
        const oscilacaoRio = Math.max(0.1, Math.min(4.0, modificados[indexUltimo].nível_bacia + (Math.random() * 0.14 - 0.07)));
        
        modificados[indexUltimo] = {
          ...modificados[indexUltimo],
          chuva_mm: parseFloat(oscilacaoChuva.toFixed(1)),
          nível_bacia: parseFloat(oscilacaoRio.toFixed(2))
        };
        return modificados;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const recifeCenter = [-8.05428, -34.8813];
  
  // Zonas de risco dinâmicas baseadas no modo de alerta
  const zones = [
    { id: 'z1', nome: "Av. Agamenon Magalhães", nivel: "Crítico (Transbordamento)", raio: mapMode === 'alert' ? 800 : 500, cor: '#ef4444' },
    { id: 'z2', nome: "Av. Caxangá - Próx. ao Terminal", nivel: "Atenção (Pontos Acumulados)", raio: mapMode === 'alert' ? 700 : 450, cor: '#f59e0b' },
    { id: 'z3', nome: "Av. Sul", nivel: "Alagamento Severe", raio: mapMode === 'alert' ? 600 : 400, cor: '#ef4444' }
  ];

  const handleSaveVeiculo = (e) => {
    e.preventDefault();
    const novaLista = [...veiculos, { ...formVeiculo, id: Date.now(), userId: user.email }];
    setVeiculos(novaLista);
    localStorage.setItem('floody_veiculos', JSON.stringify(novaLista));
    alert('Veículo cadastrado na garagem com sucesso!');
    setFormVeiculo({ modelo: '', marca: '', ano: '', tipo: 'Carro', altura: '' });
  };

  const handleSaveReporte = (e) => {
    e.preventDefault();
    const novaLista = [...reportes, { ...formReporte, id: Date.now(), autor: user.nome, status: 'Pendente', data: new Date().toLocaleDateString() }];
    setReportes(novaLista);
    localStorage.setItem('floody_reportes', JSON.stringify(novaLista));
    
    // Altera o estado do formulário para mostrar a tela de sucesso configurada
    setStatusEnvioAlerta('sucesso');
    setFormReporte({ tipo: 'Alagamento', descricao: '', local: 'GPS: Av. Agamenon Magalhães (Detectado)' });
  };

  const aprovarReporte = (id) => {
    const atualizado = reportes.map(r => r.id === id ? { ...r, status: 'Aprovado' } : r);
    setReportes(atualizado);
    localStorage.setItem('floody_reportes', JSON.stringify(atualizado));
  };

  const deletarReporte = (id) => {
    const atualizado = reportes.filter(r => r.id !== id);
    setReportes(atualizado);
    localStorage.setItem('floody_reportes', JSON.stringify(atualizado));
  };

  // Links das APIs de Mapas (Mapbox Dark, Esri Satellite Imagery e Camada Estilizada)
  const getTileUrl = () => {
    if (mapMode === 'satellite') {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    if (mapMode === 'alert') {
      return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png";
    }
    return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  };

  return (
    <div className="floody-pro-layout">
      {/* SIDEBAR PARA COMPUTADOR & BARRA INFERIOR PARA CELULAR AUTOMÁTICA */}
      <aside className="pro-sidebar">
        <div className="logo-container">
          <div className="logo-mark">F<span className="drop">💧</span></div>
          <h2>Floody</h2>
        </div>
        <nav className="pro-nav">
          <button className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}>
            <span className="nav-icon">🗺️</span> <span className="nav-text">Mapa</span>
          </button>
          <button className={`nav-item ${activeTab === 'graficos' ? 'active' : ''}`} onClick={() => setActiveTab('graficos')}>
            <span className="nav-icon">📊</span> <span className="nav-text">Gráficos</span>
          </button>
          <button className={`nav-item ${activeTab === 'veiculos' ? 'active' : ''}`} onClick={() => setActiveTab('veiculos')}>
            <span className="nav-icon">🚗</span> <span className="nav-text">Garagem</span>
          </button>
          <button className={`nav-item ${activeTab === 'reportar' ? 'active' : ''}`} onClick={() => setActiveTab('reportar')}>
            <span className="nav-icon">⚠️</span> <span className="nav-text">Reportar</span>
          </button>
          {user.tipo === 'admin' && (
            <button className={`nav-item ${activeTab === 'admin_panel' ? 'active' : ''}`} onClick={() => setActiveTab('admin_panel')}>
              <span className="nav-icon">✅</span> <span className="nav-text">Validar</span>
            </button>
          )}
        </nav>
        <div className="user-profile">
          <div className="user-info">
            <strong>{user.nome.split(' ')[0]}</strong>
            <span>{user.tipo === 'admin' ? 'Admin' : 'Condutor'}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">🚪</button>
        </div>
      </aside>

      {/* WORKSPACE DE EXIBIÇÃO DE CONTEÚDO */}
      <main className="pro-workspace">
        
        {/* ABA 1: MAPA MULTI-MODOS */}
        {activeTab === 'mapa' && (
          <div className="fade-in fullscreen-tab">
            <div className="map-layer-selector">
              <button className={mapMode === 'dark' ? 'active' : ''} onClick={() => setMapMode('dark')}>🗺️ Modo Escuro</button>
              <button className={mapMode === 'satellite' ? 'active' : ''} onClick={() => setMapMode('satellite')}>🛰️ Satélite Real</button>
              <button className={mapMode === 'alert' ? 'active' : ''} onClick={() => setMapMode('alert')}>⚠️ Mapa de Alertas</button>
            </div>
            <div className="map-container-box">
              <MapContainer center={recifeCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url={getTileUrl()} attribution="Floody Smart Map System" />
                {zones.map((z, idx) => (
                  <Circle 
                    key={z.id} 
                    center={idx === 0 ? [-8.0470, -34.8770] : idx === 1 ? [-8.0610, -34.9080] : [-8.0790, -34.8890]} 
                    radius={z.raio} 
                    pathOptions={{ color: z.cor, fillColor: z.cor, fillOpacity: mapMode === 'alert' ? 0.65 : 0.4 }}
                  >
                    <Popup>
                      <div className="map-popup-custom">
                        <h4>{z.nome}</h4>
                        <p><strong>Status:</strong> {z.nivel}</p>
                        <p>Atualizado via telemetria em tempo real.</p>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* ABA 2: CENTRAL DE GRÁFICOS (ABERTA PARA TODOS) */}
        {activeTab === 'graficos' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header">
              <h1>Central Hidrográfica ao Vivo</h1>
              <p>Cruzamento de dados de satélite meteorológico e telemetria urbana.</p>
            </header>
            
            <div className="dashboard-grid">
              <div className="form-card chart-container">
                <h3>🌊 Nível Crítico dos Rios e Canais (Metros)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dadosSensores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hora" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="nível_bacia" name="Nível de Emergência (m)" stroke="#38bdf8" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 9 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="form-card chart-container">
                <h3>🌧️ Densidade pluviométrica acumulada (mm/h)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dadosSensores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hora" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                    <Legend />
                    <Bar dataKey="chuva_mm" name="Milímetros de Chuva" fill="#a855f7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: GARAGEM / VEÍCULOS */}
        {activeTab === 'veiculos' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header">
              <h1>Minha Garagem Inteligente</h1>
              <p>Mapeamento preventivo baseado na especificação física do seu chassi.</p>
            </header>
            <div className="form-card">
              <form onSubmit={handleSaveVeiculo} className="grid-form">
                <div className="input-group"><label>Marca do Veículo</label><input required placeholder="Ex: Chevrolet" value={formVeiculo.marca} onChange={e => setFormVeiculo({...formVeiculo, marca: e.target.value})} /></div>
                <div className="input-group"><label>Modelo / Versão</label><input required placeholder="Ex: Onix 1.0" value={formVeiculo.modelo} onChange={e => setFormVeiculo({...formVeiculo, modelo: e.target.value})} /></div>
                <div className="input-group full-width"><label>Altura Livre do Solo / Vão Total (cm)</label><input required type="number" placeholder="Ex: 15" value={formVeiculo.altura} onChange={e => setFormVeiculo({...formVeiculo, altura: e.target.value})} /></div>
                <button type="submit" className="btn-primary full-width">Vincular Veículo ao GPS</button>
              </form>
            </div>
            <div className="list-card">
              <h3>Veículos Cadastrados</h3>
              {veiculos.filter(v => v.userId === user.email).length === 0 ? <p style={{color: '#94a3b8', marginTop: '10px'}}>Nenhum veículo configurado.</p> : null}
              {veiculos.filter(v => v.userId === user.email).map(v => (
                <div key={v.id} className="item-row">🚙 <strong>{v.marca} {v.modelo}</strong> — Tolerância de Chassi: <span style={{color: '#38bdf8'}}>{v.altura} cm</span></div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: REPORTAR PERIGO COM TELA DE CONFIRMAÇÃO EM CONTRAPARTIDA */}
        {activeTab === 'reportar' && (
          <div className="fade-in scrollable-tab">
            {statusEnvioAlerta === 'formulario' ? (
              <>
                <header className="content-header">
                  <h1>Reportar Ponto Crítico</h1>
                  <p>Colabore enviando dados de vias intransitáveis para a malha geral.</p>
                </header>
                <div className="form-card">
                  <form onSubmit={handleSaveReporte} className="grid-form">
                    <div className="input-group full-width">
                      <label>Classificação da Ocorrência</label>
                      <select value={formReporte.tipo} onChange={e => setFormReporte({...formReporte, tipo: e.target.value})}>
                        <option>Alagamento Intransitável</option>
                        <option>Início de Alagamento</option>
                        <option>Vias Obstruídas / Árvores Caídas</option>
                      </select>
                    </div>
                    <div className="input-group full-width">
                      <label>Relato Visual da Situação</label>
                      <textarea required placeholder="Descreva o cenário atual do local para ajudar na validação da equipe técnica..." value={formReporte.descricao} onChange={e => setFormReporte({...formReporte, descricao: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="btn-danger full-width">Transmitir Alerta de Emergência</button>
                  </form>
                </div>
              </>
            ) : (
              /* TELA DE SUCESSO EXCLUSIVA SOLICITADA */
              <div className="report-success-screen fade-in">
                <div className="success-icon-wrapper">✓</div>
                <h2>Alerta Enviado!</h2>
                <p>Nossa equipe vai verificar os detalhes e atualizar o mapa geral imediatamente.</p>
                <button className="btn-primary" onClick={() => setStatusEnvioAlerta('formulario')}>Emitir Novo Alerta</button>
              </div>
            )}
          </div>
        )}

        {/* ABA 5: PAINEL DE VALIDAÇÃO ADMINISTRATIVA */}
        {activeTab === 'admin_panel' && user.tipo === 'admin' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header">
              <h1>Moderação de Ocorrências</h1>
              <p>Controle operacional de reportes comunitários recebidos pelo Floody.</p>
            </header>
            <div className="admin-table-container">
              {reportes.length === 0 ? <p style={{color: '#94a3b8', padding: '20px'}}>Não existem novos alertas aguardando moderação técnica.</p> : (
                <table className="admin-table">
                  <thead><tr><th>Data</th><th>Autor</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
                  <tbody>
                    {reportes.map(r => (
                      <tr key={r.id}>
                        <td>{r.data}</td>
                        <td>{r.autor}</td>
                        <td>{r.tipo}</td>
                        <td className={r.status === 'Pendente' ? 'text-warning' : 'text-safe'}>{r.status}</td>
                        <td>
                          {r.status === 'Pendente' && <button onClick={() => aprovarReporte(r.id)} className="btn-icon check">✔️</button>}
                          <button onClick={() => deletarReporte(r.id)} className="btn-icon delete">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// PONTO DE ENTRADA DO REACT
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