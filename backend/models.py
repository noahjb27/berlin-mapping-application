from sqlalchemy import Column, Integer, Float, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Example for Node model
class Node(Base):
    __tablename__ = 'nodes'
    id = Column(String, primary_key=True)
    x = Column(Float)
    y = Column(Float)
    station_type = Column(String)
    node_label = Column(String)
    year = Column(String)
    east_west = Column(String)
    neighbourhood = Column(String)
    district = Column(String)

    def to_dict(self):
        return {
            'id': self.id,
            'x': self.x,
            'y': self.y,
            'station_type': self.station_type,
            'node_label': self.node_label,
            'year': self.year,
            'east_west': self.east_west,
            'neighbourhood': self.neighbourhood,
            'district': self.district
        }

# Example for Edge model
class Edge(Base):
    __tablename__ = 'edges'
    source = Column(String)
    target = Column(String)
    label = Column(String)
    year = Column(Integer)
    frequency = Column(Float)
    east_west = Column(String)
    capacity = Column(Integer)
    distance = Column(Float)
    edge_type = Column(String)

    def to_dict(self):
        return {
            'source': self.source,
            'target': self.target,
            'label': self.label,
            'year': self.year,
            'frequency': self.frequency,
            'east_west': self.east_west,
            'capacity': self.capacity,
            'distance': self.distance,
            'edge_type': self.edge_type
        }
