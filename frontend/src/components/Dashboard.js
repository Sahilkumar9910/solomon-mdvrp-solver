import React, { useState } from 'react';
import Controls from './Controls.js';
import MapView from './MapView.js';
import Metrics from './Metrics.js';

const Dashboard = () => {
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({ dist: 0, vehicles: 0, violations: 0 });
  
  // ACO parameters & dataset
  const [params, setParams] = useState({
    dataset: 'c101', 
    alpha: 1.0, 
    beta: 2.0, 
    rho: 0.1, 
    ants: 50, 
    cap: 200, 
    depots: 4
  });
  
  // State for chart data
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  const toggleStart = () => setIsRunning(true);
  const togglePause = () => setIsRunning(false);
  
  const resetSim = () => {
    setIsRunning(false);
    setIteration(0);
    setMetrics({ dist: 0, vehicles: 0, violations: 0 });
    setChartData({ labels: [], data: [] });
  };

  return (
    <div className="dashboard">
      <header className="top-bar glass">
        <div className="logo">
          <i className="fa-solid fa-network-wired neon-text"></i>
          <h1>MDVRP <span>Optimizer</span></h1>
        </div>
        <div className="controls">
          <button className="btn primary" onClick={toggleStart} disabled={isRunning}>
            <i className="fa-solid fa-play"></i> Start
          </button>
          <button className="btn warning" onClick={togglePause} disabled={!isRunning}>
            <i className="fa-solid fa-pause"></i> Pause
          </button>
          <button className="btn danger" onClick={resetSim}>
            <i className="fa-solid fa-rotate-right"></i> Reset
          </button>
        </div>
        <div className="status">
          <div className="iteration">Iteration: <span className="neon-text">{iteration}</span></div>
        </div>
      </header>

      <Controls 
        params={params} 
        setParams={setParams} 
        resetSim={resetSim} 
      />
      
      <MapView 
        isRunning={isRunning} 
        params={params} 
        iteration={iteration} 
        setIteration={setIteration} 
        setMetrics={setMetrics}
        setChartData={setChartData}
      />
      
      <Metrics 
        metrics={metrics} 
        chartData={chartData} 
      />
    </div>
  );
};

export default Dashboard;
