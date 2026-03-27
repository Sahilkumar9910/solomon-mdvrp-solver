import numpy as np

class Ant:
    def __init__(self, capacity):
        self.capacity = capacity
        self.current_load = 0
        self.route = []          # List of customer IDs visited
        self.total_distance = 0.0
        self.current_node = 0    # Always starts at 0 (The Depot)

    def visit_node(self, node_id, demand, distance):
        self.route.append(node_id)
        self.total_distance += distance
        self.current_node = node_id
        
        if node_id == 0:
            self.current_load = 0  # Reload the truck at the depot
        else:
            self.current_load += demand

    def can_visit(self, demand):
        return (self.current_load + demand) <= self.capacity

class ACO_Colony:
    def __init__(self, distance_matrix, demand_array, vehicle_capacity, num_ants=20):
        self.distance_matrix = distance_matrix
        self.demand_array = demand_array
        self.vehicle_capacity = vehicle_capacity
        self.num_ants = num_ants
        
        self.num_nodes = len(distance_matrix)
        self.pheromone_matrix = np.ones((self.num_nodes, self.num_nodes))
        
        # Hyperparameters
        self.alpha = 1.0       
        self.beta = 2.0        
        self.evaporation = 0.5 

    def run_one_iteration(self):
        ants = [Ant(self.vehicle_capacity) for _ in range(self.num_ants)]
        
        for ant in ants:
            while len(set(ant.route) - {0}) < (self.num_nodes - 1):
                next_node = self.choose_next_node(ant)
                distance = self.distance_matrix[ant.current_node][next_node]
                demand = self.demand_array[next_node]
                ant.visit_node(next_node, demand, distance)
                
            if ant.current_node != 0:
                final_distance = self.distance_matrix[ant.current_node][0]
                ant.visit_node(0, 0, final_distance)
                
        self.update_pheromones(ants)
        best_ant = min(ants, key=lambda a: a.total_distance)
        return best_ant

    def update_pheromones(self, ants):
        self.pheromone_matrix *= (1.0 - self.evaporation)
        for ant in ants:
            pheromone_to_drop = 100.0 / ant.total_distance 
            for i in range(len(ant.route) - 1):
                from_node = ant.route[i]
                to_node = ant.route[i+1]
                self.pheromone_matrix[from_node][to_node] += pheromone_to_drop
                self.pheromone_matrix[to_node][from_node] += pheromone_to_drop 

    def choose_next_node(self, ant):
        current = ant.current_node
        unvisited = [node for node in range(1, self.num_nodes) if node not in ant.route]
        feasible_nodes = [node for node in unvisited if ant.can_visit(self.demand_array[node])]
        
        if not feasible_nodes:
            return 0
            
        probabilities = np.zeros(len(feasible_nodes))
        for index, next_node in enumerate(feasible_nodes):
            pheromone = self.pheromone_matrix[current][next_node]
            distance = self.distance_matrix[current][next_node]
            visibility = 1.0 / distance if distance > 0 else 0.0001
            probabilities[index] = (pheromone ** self.alpha) * (visibility ** self.beta)
            
        total_prob = np.sum(probabilities)
        if total_prob == 0:
            probabilities = np.ones(len(feasible_nodes)) / len(feasible_nodes)
        else:
            probabilities = probabilities / total_prob
        
        chosen_node = np.random.choice(feasible_nodes, p=probabilities)
        return chosen_node

def optimize_routes(params: dict, distance_matrix: np.ndarray, demand_array: np.ndarray):
    """
    Executes the ACO engine. Replaces the old mock logic.
    """
    alpha = params.get("alpha", 1.0)
    beta = params.get("beta", 2.0)
    evaporation = params.get("evaporation", 0.5)
    num_ants = params.get("num_ants", 25)
    iterations = params.get("iterations", 50)
    vehicle_capacity = params.get("vehicle_capacity", 200)

    colony = ACO_Colony(
        distance_matrix=distance_matrix,
        demand_array=demand_array,
        vehicle_capacity=vehicle_capacity,
        num_ants=num_ants
    )
    colony.alpha = alpha
    colony.beta = beta
    colony.evaporation = evaporation

    global_best_distance = float('inf')
    global_best_route = []

    for _ in range(iterations):
        best_ant = colony.run_one_iteration()
        if best_ant.total_distance < global_best_distance:
            global_best_distance = best_ant.total_distance
            global_best_route = list(best_ant.route)

    # Calculate number of distinct trips (vehicles used)
    # Exclude the starting depot (implicit or explicitly the first node) 
    # and count occurrences of returning to the depot (0)
    vehicles = len([n for n in global_best_route if n == 0]) 

    return {
        "distance": global_best_distance,
        "vehicles": vehicles,
        "violations": 0,
        "route": [int(n) for n in global_best_route]
    }
