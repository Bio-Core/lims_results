from flask import Flask, render_template
from database import mysql_connector

app = Flask(__name__)

# IP of container-running host and container's internal flask app host (localhost)
host_ip = 'clarity.uhnresearch.ca' #'192.168.2.10' #'142.1.33.237'
container_app_host = ''

container_results_port = 8003

@app.route('/query')
def queryBuilder():
#    mysql_connector.connect()
#    tables = mysql_connector.table_names
#    return render_template('queryBuilder.html', list1=tables)
    return render_template('queryBuilder.html')
'''
@app.route('/login')
def login():
    return render_template('login.html')
'''
@app.route('/edit')
def edit():
    return render_template('edit.html')
'''
@app.route('/patients')
def patients():
#    mysql_connector.preview('patients')
#    preview = mysql_connector.previews
#    return render_template('patients.html', list1=preview)
    return render_template('patients.html')

@app.route('/samples')
def samples():
#    mysql_connector.preview('samples')
#    preview = mysql_connector.previews
#    return render_template('samples.html', list1=preview)
    return render_template('samples.html')

@app.route('/query-profile')
def profile():
    return render_template('saveQuery.php')
'''
if __name__ == '__main__':
    app.run(debug=True, host=container_app_host, port=container_results_port)
    # host=container_app_host
