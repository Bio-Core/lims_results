from flask import Flask, render_template
from database import mysql_connector

app = Flask(__name__)

# IP of container-running host and container's internal flask app host (localhost)
host_ip = 'clarity.uhnresearch.ca' #'192.168.2.10' #'142.1.33.237'
container_app_host = '0.0.0.0'

container_results_port = 8003

@app.route('/')
def index():
    mysql_connector.connect()
    tables = mysql_connector.table_names
    return render_template('test.html', list1=tables)

@app.route('/test.php')
def test():
    return render_template('test.php')

if __name__ == '__main__':
    app.run(debug=True, host=container_app_host, port=container_results_port)
