from flask import Flask, jsonify, request
from sqlalchemy.orm import sessionmaker, scoped_session
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

# Create engine and session factory
engine = create_engine(DATABASE_URL)
session_factory = sessionmaker(bind=engine)
Session = scoped_session(session_factory)

@app.route('/nodes', methods=['GET'])
def get_nodes():
    try:
        year = request.args.get('year')
        type_filter = request.args.get('type')
        with Session() as session:
            query = session.query(Node)
            if year:
                query = query.filter(Node.year == year)
            if type_filter and type_filter != 'All':
                query = query.filter(Node.station_type == type_filter)
            nodes = query.all()
            node_list = [node.to_dict() for node in nodes]
            return jsonify(node_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/edges', methods=['GET'])
def get_edges():
    try:
        year = request.args.get('year')
        type_filter = request.args.get('type')
        with Session() as session:
            query = session.query(Edge)
            if year:
                query = query.filter(Edge.year == year)
            if type_filter and type_filter != 'All':
                # Assuming Edge has a type field that needs filtering.
                # Adjust according to your actual schema.
                query = query.filter(Edge.edge_type == type_filter)
            edges = query.all()
            edge_list = [edge.to_dict() for edge in edges]
            return jsonify(edge_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ensure scoped_session is removed after each request
@app.teardown_appcontext
def remove_session(exception=None):
    Session.remove()

if __name__ == '__main__':
    app.run(debug=True)