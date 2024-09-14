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

@app.route('/nodes', methods=['GET'])
def get_nodes():
    try:
        year = request.args.get('year')
        with Session() as session:
            query = session.query(Node)
            if year:
                query = query.filter(Node.year == year)
            nodes = query.all()
            node_list = [node.to_dict() for node in nodes]
            return jsonify(node_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/edges', methods=['GET'])
def get_edges():
    try:
        year = request.args.get('year')

        if year:
            try:
                year = int(year)  # Convert year to integer
            except ValueError:
                return jsonify({'error': 'Invalid year format'}), 400

        with Session() as session:
            query = session.query(Edge)

            if year:
                query = query.filter(Edge.year == year)

            edges = query.all()

            edge_list = []
            for edge in edges:
                # Fetch source and target nodes for each edge
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
                else:
                    print(f"Skipping edge {edge.id} due to missing source or target node.")

            return jsonify(edge_list)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
