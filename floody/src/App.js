import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- ESTADOS GLOBAIS DE ALTA PERFORMANCE ---
  const [activeTab, setActiveTab] = useState('mapa'); // Começando pelo mapa que é o foco agora
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapMode, setMapMode] = useState('rain'); // 'rain' (Azul/Rota) ou 'risk' (Laranja/Heatmap) baseado no mockup
  const [showSafeRoute, setShowSafeRoute] = useState(true);
  const [alertFilter, setAlertFilter] = useState('todos');

  // --- DADOS DE TELEMETRIA COMPLEXOS ---
  const [zones, setZones] = useState([
    { id: 'z1', nome: "Bacia do Capibaribe", status: "Crítico", nivel: 2.15, chuva: "45mm/h", temp: "28°C", coords: { top: '30%', left: '40%' } },
    { id: 'z2', nome: "Av. Boa Viagem", status: "Atenção", nivel: 1.10, chuva: "15mm/h", temp: "27°C", coords: { top: '65%', left: '60%' } },
    { id: 'z3', nome: "Centro Histórico", status: "Crítico", nivel: 1.80, chuva: "30mm/h", temp: "29°C", coords: { top: '45%', left: '45%' } },
    { id: 'z4', nome: "Zona Norte (Arruda)", status: "Estável", nivel: 0.40, chuva: "5mm/h", temp: "26°C", coords: { top: '20%', left: '55%' } }
  ]);

  const [liveMetrics, setLiveMetrics] = useState({
    globalRain: 24.5,
    activeSensors: 142,
    incidents: 8
  });

  // Alertas inspirados nos cards inferiores do mockup
  const alertsLog = [
    { id: 101, tipo: 'critico', titulo: 'Alerta de Inundação Rápida', local: 'Bacia do Capibaribe', desc: 'Risco de transbordo nas próximas 2 horas. Rota de evacuação sul ativada.', icon: '🌊', tempo: 'Agora' },
    { id: 102, tipo: 'aviso', titulo: 'Pista Escorregadia', local: 'Av. Agamenon Magalhães', desc: 'Acúmulo de água nas faixas centrais. Reduza a velocidade.', icon: '🚗', tempo: 'Há 15 min' },
    { id: 103, tipo: 'critico', titulo: 'Temperatura Anômala', local: 'Ilha do Retiro', desc: 'Sensação térmica de 38°C combinada com alta umidade pré-chuva.', icon: '🌡️', tempo: 'Há 32 min' },
    { id: 104, tipo: 'info', titulo: 'Drenagem Ativa', local: 'Boa Viagem', desc: 'Bombas de sucção operando em capacidade máxima.', icon: '✅', tempo: 'Há 1 hora' }
  ];

  // --- MOTOR DE SIMULAÇÃO EM TEMPO REAL ---
  useEffect(() => {
    const engine = setInterval(() => {
      setZones(prev => prev.map(z => {
        const volatility = (Math.random() * 0.08 - 0.04);
        const newLevel = Math.max(0.1, parseFloat((z.nivel + volatility).toFixed(2)));
        let newStatus = "Estável";
        
        if (newLevel > 1.5) newStatus = "Crítico";
        else if (newLevel > 0.8) newStatus = "Atenção";

        return { ...z, nivel: newLevel, status: newStatus };
      }));

      setLiveMetrics(prev => ({
        ...prev,
        globalRain: Math.max(0, parseFloat((prev.globalRain + (Math.random() * 1 - 0.5)).toFixed(1)))
      }));
    }, 3000); // Atualiza a cada 3s para dar sensação de sistema vivo

    return () => clearInterval(engine);
  }, []);

  return (
    <div className="floody-pro-layout">
      {/* SIDEBAR SUPERIOR/LATERAL */}
      <aside className="pro-sidebar">
        <div className="logo-container">
          <div className="logo-mark">F<span className="drop">💧</span></div>
          <h2>Floody <span>Pro</span></h2>
        </div>

        <nav className="pro-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">📊</span> Visão Geral
          </button>
          <button className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}>
            <span className="icon">🗺️</span> Mapa Dinâmico
          </button>
          <button className={`nav-item ${activeTab === 'alertas' ? 'active' : ''}`} onClick={() => setActiveTab('alertas')}>
            <span className="icon">⚠️</span> Central de Risco
          </button>
        </nav>

        <div className="system-health">
          <div className="health-indicator pulse-green"></div>
          <span>Rede Neural Online</span>
        </div>
      </aside>

      {/* ÁREA DE RENDERIZAÇÃO PRINCIPAL */}
      <main className="pro-workspace">
        <header className="workspace-header">
          <div className="header-titles">
            <h1>Monitoramento de Mobilidade e Clima</h1>
            <p>Recife, PE • Inteligência Artificial Ativa</p>
          </div>
          <div className="live-pill">🔴 LIVE FEED</div>
        </header>

        {/* --- TELA 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="bento-grid">
              <div className="bento-card kpi-card blue">
                <span className="kpi-label">Volume Pluviométrico</span>
                <div className="kpi-value">{liveMetrics.globalRain} <small>mm/h</small></div>
                <div className="kpi-chart-mockup rain-chart"></div>
              </div>
              
              <div className="bento-card kpi-card orange">
                <span className="kpi-label">Sensores IoT Desdobrados</span>
                <div className="kpi-value">{liveMetrics.activeSensors} <small>Ativos</small></div>
                <div className="kpi-chart-mockup pulse-chart"></div>
              </div>

              <div className="bento-card kpi-card red">
                <span className="kpi-label">Zonas Críticas de Risco</span>
                <div className="kpi-value">{zones.filter(z => z.status === 'Crítico').length} <small>Locais</small></div>
                <div className="kpi-chart-mockup danger-chart"></div>
              </div>
            </div>

            <div className="zones-data-table">
              <h3>Status Detalhado das Bacias</h3>
              <div className="table-header">
                <span>Localização</span>
                <span>Nível d'Água</span>
                <span>Chuva</span>
                <span>Temperatura</span>
                <span>Status</span>
              </div>
              {zones.map(z => (
                <div key={z.id} className="table-row">
                  <strong>{z.nome}</strong>
                  <span>{z.nivel}m</span>
                  <span>{z.chuva}</span>
                  <span>{z.temp}</span>
                  <span className={`status-tag ${z.status === 'Crítico' ? 'tag-red' : z.status === 'Atenção' ? 'tag-yellow' : 'tag-green'}`}>
                    {z.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TELA 2: MAPA DINÂMICO (Baseado nos Mockups) --- */}
        {activeTab === 'mapa' && (
          <div className="fade-in map-fullscreen-container">
            {/* Controles Flutuantes do Mapa */}
            <div className="map-controls-glass">
              <div className="mode-toggle">
                <button className={`toggle-btn ${mapMode === 'rain' ? 'active-rain' : ''}`} onClick={() => setMapMode('rain')}>🌧️ Rain Mode</button>
                <button className={`toggle-btn ${mapMode === 'risk' ? 'active-risk' : ''}`} onClick={() => setMapMode('risk')}>🔥 Risk Mode</button>
              </div>
              <label className="route-toggle">
                <input type="checkbox" checked={showSafeRoute} onChange={(e) => setShowSafeRoute(e.target.checked)} />
                🛣️ Rota Segura Ativa
              </label>
            </div>

            {/* O CANVAS DO MAPA */}
            <div className={`pro-map-canvas mode-${mapMode}`}>
              {/* Textura de fundo estilo mapa topográfico */}
              <div className="topo-texture"></div>

              {/* Camada de Heatmap (Muda dependendo do modo) */}
              <div className={`heatmap-layer ${mapMode}`}></div>

              {/* Rota Segura em SVG (Como no print da esquerda) */}
              {showSafeRoute && mapMode === 'rain' && (
                <svg className="safe-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 60 80 Q 40 50 45 30 T 55 10" fill="transparent" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" className="route-path" />
                  <circle cx="60" cy="80" r="2" fill="#10b981" className="route-node" />
                  <circle cx="55" cy="10" r="2" fill="#10b981" className="route-node" />
                </svg>
              )}

              {/* Sensores espalhados pelo mapa */}
              {zones.map(z => (
                <div key={z.id} className={`map-pin ${z.status}`} style={{ top: z.coords.top, left: z.coords.left }} onClick={() => setSelectedZone(z)}>
                  <div className="pin-ring"></div>
                  <div className="pin-core"></div>
                  <div className="pin-label">{z.nivel}m</div>
                </div>
              ))}
            </div>

            {/* Card inferior flutuante se clicar em um sensor */}
            {selectedZone && (
              <div className="floating-bottom-card slide-up">
                <div className="card-header">
                  <h3>{selectedZone.nome}</h3>
                  <button className="close-btn" onClick={() => setSelectedZone(null)}>✕</button>
                </div>
                <div className="card-body-grid">
                  <div className="stat"><span>Risco</span><strong className={selectedZone.status}>{selectedZone.status}</strong></div>
                  <div className="stat"><span>Água</span><strong>{selectedZone.nivel}m</strong></div>
                  <div className="stat"><span>Chuva</span><strong>{selectedZone.chuva}</strong></div>
                  <div className="stat"><span>Temp</span><strong>{selectedZone.temp}</strong></div>
                </div>
                {selectedZone.status === 'Crítico' && (
                  <button className="evac-btn">Acionar Protocolo de Evacuação</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TELA 3: CENTRAL DE ALERTAS --- */}
        {activeTab === 'alertas' && (
          <div className="fade-in">
            <div className="alerts-layout">
              <div className="alerts-sidebar-filter">
                <h3>Filtros de Eventos</h3>
                <button className={`filter-chip ${alertFilter === 'todos' ? 'active' : ''}`} onClick={() => setAlertFilter('todos')}>🌐 Todos os Eventos</button>
                <button className={`filter-chip danger ${alertFilter === 'critico' ? 'active' : ''}`} onClick={() => setAlertFilter('critico')}>🚨 Inundação / Risco Alto</button>
                <button className={`filter-chip warning ${alertFilter === 'aviso' ? 'active' : ''}`} onClick={() => setAlertFilter('aviso')}>⚠️ Trânsito / Avisos</button>
                <button className={`filter-chip info ${alertFilter === 'info' ? 'active' : ''}`} onClick={() => setAlertFilter('info')}>✅ Sistemas Normais</button>
              </div>

              <div className="alerts-feed-container">
                {alertsLog.filter(a => alertFilter === 'todos' || a.tipo === alertFilter).map(alert => (
                  <div key={alert.id} className={`pro-alert-card type-${alert.tipo}`}>
                    <div className="alert-icon-box">{alert.icon}</div>
                    <div className="alert-content">
                      <div className="alert-top">
                        <h4>{alert.titulo}</h4>
                        <span className="alert-time">{alert.tempo}</span>
                      </div>
                      <span className="alert-location">📍 {alert.local}</span>
                      <p className="alert-desc">{alert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;