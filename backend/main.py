from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aco import optimize_routes
from data_loader import load_solomon_data, calculate_distance_matrix

app = FastAPI(title="MDVRP ACO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dataset/{name}")
def get_dataset(name: str):
    data = load_solomon_data(f"../data/{name}.txt")
    if "error" in data:
        return {"status": "error", "message": data["error"]}
    return {"status": "success", "data": data}

@app.post("/api/optimize")
def run_optimization(params: dict):
    dataset_name = params.get("dataset", "c101")
    # In a full production app we would cache the dataset in memory,
    # but for now we reload it per request as per the target structure.
    data = load_solomon_data(f"../data/{dataset_name}.txt")
    
    if "error" in data:
        # Fallback to clone data if our original data folder lacks it
        data = load_solomon_data(f"../clone_target/data/{dataset_name}.txt")
        if "error" in data:
            return {"status": "error", "message": data["error"]}
        
    distance_matrix, demand_array = calculate_distance_matrix(data)
    
    if distance_matrix is None:
        return {"status": "error", "message": "Failed to compute distance matrices."}
        
    # Execute the actual ACO algorithm
    result = optimize_routes(params, distance_matrix, demand_array)
    
    return {"status": "success", "result": result}
