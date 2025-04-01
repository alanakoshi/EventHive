from flask import Flask
from models import db, Event, User, CoHost, Vote, Task, Budget, Idea
from config import Config
from routes import *

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize the database
db.init_app(app)

# This runs before the first request
@app.before_request
def create_tables():
    db.create_all()  # Create all tables in the database

if __name__ == '__main__':
    app.run(debug=True)