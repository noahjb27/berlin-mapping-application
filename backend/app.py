from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import json

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes and origins

def load_graph(filename):
    return nx.read_graphml(filename)

def create_subgraph(G, target_year):
    subgraph_for_year = nx.Graph()
    for node, data in G.nodes(data=True):
        if str(target_year) in data.get('years', ''):
            subgraph_for_year.add_node(node, **data)

    for edge in G.edges(data=True):
        node1 = edge[0]
        node2 = edge[1]
        data = edge[2]
        if data.get("year") == int(target_year):
            if subgraph_for_year.has_node(node1) and subgraph_for_year.has_node(node2):
                subgraph_for_year.add_edge(node1, node2, **data)
    return subgraph_for_year

@app.route('/graph', methods=['GET'])
def get_graph():
    year = request.args.get('year')
    if not year:
        return jsonify({"error": "No year specified"}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({"error": "Invalid year format"}), 400

    G = load_graph('./backend/graph_data/base-graph.graphml')
    subgraph = create_subgraph(G, year)

    # Convert graph to node-link data format for JSON serialization
    data = nx.node_link_data(subgraph)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
