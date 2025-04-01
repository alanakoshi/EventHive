from flask import Flask, render_template, request, redirect, url_for
from flask_cors import CORS
app = Flask(__name__)

# Route to the homepage
@app.route('/')
def home():
    return render_template('home.html')  # This is where the "Create Plan" button should be

# Route to create a new event
@app.route('/create_event', methods=['GET', 'POST'])
def create_event():
    # Handle form input and create event
    return render_template('create_event.html')

# Route to invite co-hosts
@app.route('/invite_cohost/<event_id>', methods=['GET', 'POST'])
def invite_cohost(event_id):
    # Handle input for co-hosts and shareable link
    return render_template('invite_cohost.html', event_id=event_id)

# Route to choose event dates
@app.route('/choose_date/<event_id>', methods=['GET', 'POST'])
def choose_date(event_id):
    # Handle date selection
    return render_template('choose_date.html', event_id=event_id)

# Route to choose event theme
@app.route('/choose_theme/<event_id>', methods=['GET', 'POST'])
def choose_theme(event_id):
    # Handle theme input
    return render_template('choose_theme.html', event_id=event_id)

# Route to choose event location
@app.route('/choose_location/<event_id>', methods=['GET', 'POST'])
def choose_location(event_id):
    # Handle location input (including Google Maps integration)
    return render_template('choose_location.html', event_id=event_id)

# Route to choose budget
@app.route('/choose_budget/<event_id>', methods=['GET', 'POST'])
def choose_budget(event_id):
    # Handle budget input
    return render_template('choose_budget.html', event_id=event_id)

# Route for voting
@app.route('/voting/<event_id>', methods=['GET', 'POST'])
def voting(event_id):
    # Handle voting on dates, theme, etc.
    return render_template('voting.html', event_id=event_id)

# Route for final results
@app.route('/final_results/<event_id>', methods=['GET'])
def final_results(event_id):
    # Display the final results of the voting
    return render_template('final_results.html', event_id=event_id)

# Route to delegate tasks
@app.route('/delegate_task/<event_id>', methods=['GET', 'POST'])
def delegate_task(event_id):
    # Handle task delegation
    return render_template('delegate_task.html', event_id=event_id)

# Route to split the budget
@app.route('/split_budget/<event_id>', methods=['GET', 'POST'])
def split_budget(event_id):
    # Handle budget splitting
    return render_template('split_budget.html', event_id=event_id)

# Route to complete the event and return home
@app.route('/complete/<event_id>', methods=['GET'])
def complete(event_id):
    # Display the completed event details
    return render_template('complete.html', event_id=event_id)

if __name__ == '__main__':
    app.run(debug=True)
