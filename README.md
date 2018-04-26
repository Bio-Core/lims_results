# lims_results

## Overview

This is written in AngularJS deployed with Flask and it's located on Mordor server. 

To access ``result-db-test`` vm, use ``ssh -p 5059 coop2@192.75.165.28`` to ``ssh`` to Mordor, and then ``ssh -p 10022 coop2@node38`` to reach ``result-db-test``. ``ssh`` to Mordor requires OTP key. 

Using MacOS, frontend testing is done on Remote Desktop. I recommend Firefox since its refresh clears cache better than Chrome. However, some border lines fro headers are missing on Firefox. 

To deploy the website frontend, execute ``python app.py`` from the root file, which can be found using ``cd flask/lims_results``. 

To access individule files, execute ``vi (filepath/)filename``. 

## Installation
To install the web application, clone the Git repository:
```
git clone https://github.com/Bio-Core/lims_results.git
```

We recommend using Python's ```virtualenv``` to sandbox your installation environment.

```
virtualenv lims-venv
source lims-venv/bin/activate
```

From there, install the required packages:

```
pip install -r requirements
```

## Running the server
To run the web application, execute the following after installation:
```
source <path to virtual environment>/activate
python app.py
```

## View the website
To view the website, visit the following URL:
```
http://172.27.164.207:8003/main
```
