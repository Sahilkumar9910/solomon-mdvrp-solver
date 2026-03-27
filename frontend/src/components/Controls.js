import React from 'react';

const Controls = ({ params, setParams, resetSim }) => {
  const handleChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
    if (field === 'depots' || field === 'dataset') {
      resetSim();
    }
  };

  return (
    <aside className="sidebar left-sidebar glass">
      <section className="control-group">
        <h3>Dataset Selection</h3>
        <select 
          value={params.dataset} 
          onChange={(e) => handleChange('dataset', e.target.value)}
        >
          <option value="c101">Solomon C101</option>
          <option value="c102">Solomon C102</option>
          <option value="r101">Solomon R101</option>
          <option value="rc101">Solomon RC101</option>
        </select>
      </section>
      
      <section className="control-group">
        <h3>ACO Parameters</h3>
        
        <div className="param">
          <label>Alpha (Pheromone) <span className="val">{params.alpha}</span></label>
          <input 
            type="range" min="0" max="5" step="0.1" 
            value={params.alpha} 
            onChange={(e) => handleChange('alpha', parseFloat(e.target.value))} 
          />
        </div>
        
        <div className="param">
          <label>Beta (Heuristic) <span className="val">{params.beta}</span></label>
          <input 
            type="range" min="0" max="5" step="0.1" 
            value={params.beta} 
            onChange={(e) => handleChange('beta', parseFloat(e.target.value))} 
          />
        </div>
        
        <div className="param">
          <label>Evaporation Rate (ρ) <span className="val">{params.rho}</span></label>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={params.rho} 
            onChange={(e) => handleChange('rho', parseFloat(e.target.value))} 
          />
        </div>
        
        <div className="param">
          <label>Ants Count <span className="val">{params.ants}</span></label>
          <input 
            type="range" min="10" max="200" step="1" 
            value={params.ants} 
            onChange={(e) => handleChange('ants', parseInt(e.target.value))} 
          />
        </div>
      </section>

      <section className="control-group">
        <h3>VRP Constraints</h3>
        <div className="param">
          <label>Vehicle Capacity <span className="val">{params.cap}</span></label>
          <input 
            type="range" min="50" max="1000" step="10" 
            value={params.cap} 
            onChange={(e) => handleChange('cap', parseInt(e.target.value))} 
          />
        </div>
        <div className="param">
          <label>Number of Depots <span className="val">{params.depots}</span></label>
          <input 
            type="range" min="1" max="10" step="1" 
            value={params.depots} 
            onChange={(e) => handleChange('depots', parseInt(e.target.value))} 
          />
        </div>
      </section>
    </aside>
  );
};

export default Controls;
