from flask import Flask, render_template

app = Flask(__name__)

# IP of container-running host and container's internal flask app host (localhost)
host_ip = 'clarity.uhnresearch.ca' #'192.168.2.10' #'142.1.33.237'
container_app_host = ''

container_results_port = 8003

@app.route('/query')
def queryBuilder():
    return render_template('queryBuilder.html')
'''
@app.route('/login')
def login():
    return render_template('login.html')
'''
@app.route('/edit')
def edit():
    return render_template('edit.html')

@app.route('/patients')
def tablePatients():
    return render_template('table.html', title='Patients')

@app.route('/samples')
def tableSamples():
    return render_template('table.html', title='Samples')

@app.route('/experiments')
def tableTest():
    return render_template('table.html', title='Experiments')

@app.route('/results')
def tableResults():
    return render_template('table.html', title='Results')

@app.route('/resultdetails')
def tableRD():
    return render_template('table.html', title='Result Details')

@app.route('/patients/<id>')
def patients(id):
    return render_template('patients.html')

@app.route('/samples/<id>')
def samples(id):
    return render_template('samples.html')

@app.route('/experiments/<id>')
def tests(id):
    return render_template('tests.html')

@app.route('/results/<id>')
def results(id):
    return render_template('results.html')

@app.route('/resultdetails/<id>')
def resultdetails(id):
    return render_template('resultdetails.html')

@app.route('/search/<id>')
def search(id):
    return render_template('search.html')

@app.route('/main')
def main():
    return render_template('main.html')

@app.route('/query-profile')
def profile():
    return render_template('saveQuery.php')

if __name__ == '__main__':
    app.run(debug=True, host=container_app_host, port=container_results_port)
