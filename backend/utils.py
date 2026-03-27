def calculate_distance(node_a, node_b):
    import math
    return math.hypot(node_a['x'] - node_b['x'], node_a['y'] - node_b['y'])
