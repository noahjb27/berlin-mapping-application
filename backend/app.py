from flask import Flask, jsonify, request
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from backend.models import Node, Edge
from dotenv import load_dotenv
import os
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app)

# Get the database URL from the environment
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables")

# Setup the engine and sessionmaker
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

@app.route('/graph', methods=['GET'])
def get_graph():
    try:
        year = request.args.get('year')
        if year:
            year = int(year)
        
        with Session() as session:
            # Fetch nodes
            nodes = session.query(Node).filter(Node.year == year).all()
            node_list = [node.to_dict() for node in nodes]

            # Fetch edges
            edges = session.query(Edge).filter(Edge.year == year).all()
            edge_list = []
            for edge in edges:
                source_node = session.query(Node).filter(Node.id == edge.source).one_or_none()
                target_node = session.query(Node).filter(Node.id == edge.target).one_or_none()
                if source_node and target_node:
                    edge_list.append({
                        "id": edge.id,
                        "label": edge.label,
                        "source": {
                            "id": edge.source,
                            "x": source_node.x,
                            "y": source_node.y
                        },
                        "target": {
                            "id": edge.target,
                            "x": target_node.x,
                            "y": target_node.y
                        },
                        "edge_type": edge.edge_type,
                        "distance": edge.distance,
                        "year": edge.year
                    })
        
        return jsonify({"nodes": node_list, "edges": edge_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
