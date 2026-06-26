import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
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
      setErro('Preencha todos os campos obrigatórios.'); return;
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
// APLICATIVO PRINCIPAL
// ==========================================
function MainApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(user.tipo === 'admin' ? 'admin_reportes' : 'mapa');
  const [veiculos, setVeiculos] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [formVeiculo, setFormVeiculo] = useState({ modelo: '', marca: '', ano: '', tipo: 'Carro', altura: '' });
  const [formReporte, setFormReporte] = useState({ tipo: 'Alagamento', descricao: '', local: 'GPS: Av. Caxangá (Simulado)' });

  // Carregar dados salvos
  useEffect(() => {
    setVeiculos(JSON.parse(localStorage.getItem('floody_veiculos')) || []);
    setReportes(JSON.parse(localStorage.getItem('floody_reportes')) || []);
  }, []);

  const recifeCenter = [-8.05428, -34.8813];
  const zones = [
    { id: 'z1', nome: "Av. Agamenon Magalhães", status: "Crítico", nivel: 1.80, coords: [-8.0470, -34.8770], raio: 600, cor: '#ef4444' },
    { id: 'z2', nome: "Av. Domingos Ferreira", status: "Atenção", nivel: 0.90, coords: [-8.1130, -34.8940], raio: 500, cor: '#f59e0b' }
  ];

  const handleSaveVeiculo = (e) => {
    e.preventDefault();
    const novaLista = [...veiculos, { ...formVeiculo, id: Date.now(), userId: user.email }];
    setVeiculos(novaLista);
    localStorage.setItem('floody_veiculos', JSON.stringify(novaLista));
    alert('Veículo salvo! Rotas baseadas na altura do chassi ativadas.');
    setFormVeiculo({ modelo: '', marca: '', ano: '', tipo: 'Carro', altura: '' });
  };

  const handleSaveReporte = (e) => {
    e.preventDefault();
    const novaLista = [...reportes, { ...formReporte, id: Date.now(), autor: user.nome, status: 'Pendente', data: new Date().toLocaleDateString() }];
    setReportes(novaLista);
    localStorage.setItem('floody_reportes', JSON.stringify(novaLista));
    alert('Ocorrência enviada para validação da equipe!');
    setFormReporte({ tipo: 'Alagamento', descricao: '', local: 'GPS: Capturando...' });
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

  return (
    <div className="floody-pro-layout">
      <aside className="pro-sidebar">
        <div className="logo-container">
          <div className="logo-mark">F<span className="drop">💧</span></div>
          <h2>Floody</h2>
        </div>
        <nav className="pro-nav">
          {user.tipo !== 'admin' && (
            <>
              <button className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}>🗺️ Mapa de Risco</button>
              <button className={`nav-item ${activeTab === 'veiculos' ? 'active' : ''}`} onClick={() => setActiveTab('veiculos')}>🚗 Meus Veículos</button>
              <button className={`nav-item ${activeTab === 'reportar' ? 'active' : ''}`} onClick={() => setActiveTab('reportar')}>📸 Reportar Perigo</button>
            </>
          )}
          {user.tipo === 'admin' && (
            <>
              <div className="admin-badge">Área Admin</div>
              <button className={`nav-item ${activeTab === 'admin_reportes' ? 'active' : ''}`} onClick={() => setActiveTab('admin_reportes')}>✅ Validar Ocorrências</button>
            </>
          )}
        </nav>
        <div className="user-profile">
          <div className="user-info">
            <strong>{user.nome}</strong>
            <span>{user.tipo === 'admin' ? 'Administrador' : 'Motorista'}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">🚪</button>
        </div>
      </aside>

      <main className="pro-workspace">
        {/* MAPA */}
        {activeTab === 'mapa' && (
          <div className="fade-in fullscreen-tab">
            <header className="content-header">
              <h1>Mapa de Mobilidade</h1><p>Alertas em tempo real baseados na altura do seu veículo.</p>
            </header>
            <div className="map-container-box">
              <MapContainer center={recifeCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {zones.map(z => (
                  <Circle key={z.id} center={z.coords} radius={z.raio} pathOptions={{ color: z.cor, fillColor: z.cor, fillOpacity: 0.5 }}>
                    <Popup><div style={{ color: '#000' }}><strong>{z.nome}</strong><br/>Nível: {z.nivel}m</div></Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* VEÍCULOS */}
        {activeTab === 'veiculos' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header"><h1>Garagem</h1><p>Cadastre a altura do seu carro.</p></header>
            <div className="form-card">
              <form onSubmit={handleSaveVeiculo} className="grid-form">
                <div className="input-group"><label>Marca</label><input required value={formVeiculo.marca} onChange={e => setFormVeiculo({...formVeiculo, marca: e.target.value})} /></div>
                <div className="input-group"><label>Modelo</label><input required value={formVeiculo.modelo} onChange={e => setFormVeiculo({...formVeiculo, modelo: e.target.value})} /></div>
                <div className="input-group full-width"><label>Altura do solo (cm)</label><input required type="number" value={formVeiculo.altura} onChange={e => setFormVeiculo({...formVeiculo, altura: e.target.value})} /></div>
                <button type="submit" className="btn-primary">Salvar Veículo</button>
              </form>
            </div>
            <div className="list-card">
              <h3>Seus Veículos</h3>
              {veiculos.filter(v => v.userId === user.email).map(v => (
                <div key={v.id} className="item-row">🚗 {v.marca} {v.modelo} - Altura: {v.altura}cm</div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTE */}
        {activeTab === 'reportar' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header"><h1>Reportar Problema</h1><p>Ajude a comunidade.</p></header>
            <div className="form-card">
              <form onSubmit={handleSaveReporte} className="grid-form">
                <div className="input-group full-width"><label>Tipo</label><select value={formReporte.tipo} onChange={e => setFormReporte({...formReporte, tipo: e.target.value})}><option>Alagamento</option><option>Buraco</option></select></div>
                <div className="input-group full-width"><label>Descrição</label><textarea required value={formReporte.descricao} onChange={e => setFormReporte({...formReporte, descricao: e.target.value})}></textarea></div>
                <button type="submit" className="btn-danger">Enviar Alerta</button>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'admin_reportes' && (
          <div className="fade-in scrollable-tab">
            <header className="content-header"><h1>Validação Admin</h1><p>Aprove ou rejeite alertas.</p></header>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Data</th><th>Autor</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {reportes.map(r => (
                    <tr key={r.id}>
                      <td>{r.data}</td><td>{r.autor}</td><td>{r.tipo}</td>
                      <td className={r.status === 'Pendente' ? 'text-warning' : 'text-safe'}>{r.status}</td>
                      <td>
                        {r.status === 'Pendente' && <button onClick={() => aprovarReporte(r.id)} className="btn-icon check">✔️</button>}
                        <button onClick={() => deletarReporte(r.id)} className="btn-icon delete">🗑️</button>
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
// RAIZ DO APP
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