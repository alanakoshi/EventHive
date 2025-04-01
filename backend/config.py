class Config:
    # Set up your database URI. SQLite is used for development here.
    SQLALCHEMY_DATABASE_URI = 'sqlite:///events.db'  # This will create a SQLite database in your project folder
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disables modification tracking for performance
