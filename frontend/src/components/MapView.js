import React, { useEffect, useRef } from 'react';

const routeColors = [
  '#3b82f6', '#10b981', '#d946ef', '#f59e0b', 
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'
];

const MapView = ({ isRunning, params, iteration, setIteration, setMetrics, setChartData }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stateRef = useRef({
    depots: [],
    customers: [],
    routes: [],
    pheromones: [],
    bestDistance: Infinity,
    lastLogicUpdate: 0,
    animationId: null
  });

  const generateNodes = (w, h) => {
    const s = stateRef.current;
    s.depots = [];
    s.customers = [];
    s.pheromones = [];
    const padding = 50;

    for (let i = 0; i < params.depots; i++) {
      s.depots.push({
        x: padding + Math.random() * (w - padding * 2),
        y: padding + Math.random() * (h - padding * 2)
      });
    }

    const clusters = 5;
    const clusterCenters = [];
    for(let c=0; c<clusters; c++) {
      clusterCenters.push({
        x: padding + Math.random() * (w - padding * 2),
        y: padding + Math.random() * (h - padding * 2)
      });
    }

    const isClustered = params.dataset.startsWith('c');
    for (let i = 0; i < 100; i++) {
      if (isClustered) {
        const center = clusterCenters[Math.floor(Math.random() * clusters)];
        s.customers.push({
          x: Math.max(padding, Math.min(w - padding, center.x + (Math.random() - 0.5) * 150)),
          y: Math.max(padding, Math.min(h - padding, center.y + (Math.random() - 0.5) * 150))
        });
      } else {
        s.customers.push({
          x: padding + Math.random() * (w - padding * 2),
          y: padding + Math.random() * (h - padding * 2)
        });
      }
    }

    for(let i=0; i<40; i++) {
        s.pheromones.push({
            from: s.customers[Math.floor(Math.random()*s.customers.length)],
            to: s.customers[Math.floor(Math.random()*s.customers.length)],
            strength: Math.random() * 0.15
        });
    }
  };

  const generateRoutes = () => {
    const s = stateRef.current;
    s.routes = [];
    const baseVehicles = Math.max(4, Math.floor(100 * 15 / params.cap) + 1);
    const numVehicles = baseVehicles + Math.floor(Math.random() * 3);
    
    let violations = Math.random() > 0.85 && iteration < 50 ? Math.floor(Math.random() * 3) + 1 : 0;
    
    let unassigned = [...s.customers];
    let currentDist = 0;
    
    for (let v = 0; v < numVehicles; v++) {
      if (unassigned.length === 0) break;
      const startDepot = s.depots[v % s.depots.length];
      const route = { depot: startDepot, path: [], color: routeColors[v % routeColors.length] };
      let current = startDepot;
      const stops = Math.floor(s.customers.length / numVehicles) + Math.floor(Math.random() * 4) - 1;
      
      for (let i = 0; i < stops; i++) {
        if (unassigned.length === 0) break;
        unassigned.sort((a, b) => {
          const distA = Math.hypot(a.x - current.x, a.y - current.y);
          const distB = Math.hypot(b.x - current.x, b.y - current.y);
          const noise = Math.max(0, 200 - iteration * 2) * (Math.random() - 0.5);
          return (distA - distB) + noise;
        });
        const nextNode = unassigned.shift();
        currentDist += Math.hypot(nextNode.x - current.x, nextNode.y - current.y);
        route.path.push(nextNode);
        current = nextNode;
      }
      currentDist += Math.hypot(startDepot.x - current.x, startDepot.y - current.y);
      s.routes.push(route);
    }
    
    if (unassigned.length > 0) {
      const r = s.routes[s.routes.length - 1];
      let curr = r.path[r.path.length-1];
      unassigned.forEach(u => {
        currentDist += Math.hypot(u.x - curr.x, u.y - curr.y);
        r.path.push(u);
        curr = u;
      });
      currentDist += Math.hypot(r.depot.x - curr.x, r.depot.y - curr.y);
    }
    
    if (iteration === 0) {
      s.bestDistance = currentDist * 1.5; 
    } else {
      const improvementChance = Math.max(0.05, 0.4 - iteration * 0.002);
      if (currentDist < s.bestDistance || Math.random() < improvementChance) {
          let newBest = s.bestDistance - (s.bestDistance * (Math.random() * 0.02 * (1 - params.rho)));
          const floor = 1000 + (s.depots.length * 50);
          if (newBest > floor) s.bestDistance = newBest;
      }
    }
    
    s.pheromones = [];
    s.routes.forEach(r => {
        let pr = r.depot;
        r.path.forEach(n => {
            if(Math.random() > 0.5) {
                s.pheromones.push({ from: pr, to: n, strength: Math.random() * 0.3 });
            }
            pr = n;
        });
    });

    setMetrics({ dist: s.bestDistance.toFixed(1), vehicles: numVehicles, violations });
    setChartData(prev => {
      const newLabels = [...prev.labels, iteration];
      const newData = [...prev.data, s.bestDistance];
      if (newLabels.length > 250) { newLabels.shift(); newData.shift(); }
      return { labels: newLabels, data: newData };
    });
  };

  const drawMap = (ctx, w, h) => {
    const s = stateRef.current;
    ctx.clearRect(0, 0, w, h);
    
    ctx.lineWidth = 1;
    s.pheromones.forEach(p => {
        ctx.strokeStyle = `rgba(59, 130, 246, ${p.strength})`;
        ctx.beginPath();
        ctx.moveTo(p.from.x, p.from.y);
        ctx.lineTo(p.to.x, p.to.y);
        ctx.stroke();
    });

    const time = Date.now();
    s.routes.forEach((route, idx) => {
        if (route.path.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(route.depot.x, route.depot.y);
        route.path.forEach(node => ctx.lineTo(node.x, node.y));
        ctx.lineTo(route.depot.x, route.depot.y);
        
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 2;
        
        const glowPhase = (time / 300 + idx) % (s.routes.length || 1);
        if (glowPhase < 1.5) {
            ctx.shadowColor = route.color;
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ffffff'; 
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    s.customers.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    s.depots.forEach(depot => {
        const size = 10;
        ctx.beginPath();
        ctx.rect(depot.x - size/2, depot.y - size/2, size, size);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
  };

  useEffect(() => {
    // Canvas setup handling
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (!isRunning) drawMap(ctx, rect.width, rect.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (iteration === 0 && stateRef.current.customers.length === 0) {
      generateNodes(containerRef.current.getBoundingClientRect().width, containerRef.current.getBoundingClientRect().height);
      drawMap(ctx, containerRef.current.getBoundingClientRect().width, containerRef.current.getBoundingClientRect().height);
    } else if (iteration === 0 && !isRunning) {
        // Just reset nodes when params change usually via iteration=0
        generateNodes(containerRef.current.getBoundingClientRect().width, containerRef.current.getBoundingClientRect().height);
        drawMap(ctx, containerRef.current.getBoundingClientRect().width, containerRef.current.getBoundingClientRect().height);
    }

    let aId;
    const loop = (timestamp) => {
      if (!isRunning) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (timestamp - stateRef.current.lastLogicUpdate > 150) {
          setIteration(prev => prev + 1);
          generateRoutes();
          stateRef.current.lastLogicUpdate = timestamp;
      }
      drawMap(ctx, rect.width, rect.height);
      aId = requestAnimationFrame(loop);
    };

    if (isRunning) {
      stateRef.current.lastLogicUpdate = performance.now();
      aId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (aId) cancelAnimationFrame(aId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, params.depots, params.dataset]);

  return (
    <main className="map-container glass">
      <div className="map-header">
        <h3>Live Routing Map</h3>
        <div className="legend">
          <span className="legend-item"><span className="dot depot"></span> Depot</span>
          <span className="legend-item"><span className="dot customer"></span> Customer</span>
        </div>
      </div>
      <div className="canvas-wrapper" ref={containerRef}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </main>
  );
};

export default MapView;
