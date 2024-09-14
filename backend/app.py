from flask import Flask, jsonify, request
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from backend.models import Node, Edge
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Get the database URL from the environment
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables")

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
        with Session() as session:
            query = session.query(Edge)
            if year:
                query = query.filter(Edge.year == year)
            edges = query.all()
            edge_list = [edge.to_dict() for edge in edges]
            return jsonify(edge_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
