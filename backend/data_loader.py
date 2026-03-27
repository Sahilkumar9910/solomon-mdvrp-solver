import pandas as pd
import numpy as np
import math
import os

def load_solomon_data(filepath):
    """
    Parses the standard Solomon dataset file (e.g., c101.txt) and returns JSON serializable structures.
    """
    if not os.path.exists(filepath):
        return {"error": f"Dataset not found at {filepath}"}

    column_names = ['CUST_NO', 'XCOORD', 'YCOORD', 'DEMAND', 'READY_TIME', 'DUE_DATE', 'SERVICE_TIME']
    
    # Read the text file, skipping the header lines
    try:
        df = pd.read_csv(filepath, sep=r'\s+', skiprows=9, header=None, names=column_names)
    except Exception as e:
        return {"error": f"Failed to parse dataset: {e}"}
    
    # Node 0 is the Tata Depot
    depot = df.iloc[0].to_dict()
    # The rest are dealerships
    customers = df.iloc[1:].to_dict('records')
    
    return {"depot": depot, "customers": customers}

def calculate_distance_matrix(data_dict):
    """
    Translates physical X/Y coordinates into the mathematical distance matrix.
    Accepts the serialized dictionary from load_solomon_data.
    """
    if "error" in data_dict:
        return None, None
        
    depot = data_dict["depot"]
    customers = data_dict["customers"]
    
    all_nodes = [depot] + customers
    num_nodes = len(all_nodes)
    
    distance_matrix = np.zeros((num_nodes, num_nodes))
    demand_array = np.zeros(num_nodes)
    
    for i in range(num_nodes):
        demand_array[i] = all_nodes[i]['DEMAND']
        
        for j in range(num_nodes):
            if i != j:
                x1, y1 = all_nodes[i]['XCOORD'], all_nodes[i]['YCOORD']
                x2, y2 = all_nodes[j]['XCOORD'], all_nodes[j]['YCOORD']
                
                # Calculate straight-line distance between nodes
                dist = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
                distance_matrix[i][j] = dist
                
    return distance_matrix, demand_array
