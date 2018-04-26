# lims_results

This is written in AngularJS deployed with Flask and it's located on Mordor server. 

To access ``result-db-test`` vm, use ``ssh -p 5059 coop2@192.75.165.28`` to ``ssh`` to Mordor, and then ``ssh -p 10022 coop2@node38`` to reach ``result-db-test``. ``ssh`` to Mordor requires OTP key. 

Using MacOS, frontend testing is done on Remote Desktop. I recommend Firefox since its refresh clears cache better than Chrome. However, some border lines fro headers are missing on Firefox. 

To deploy the website frontend, execute ``python app.py`` from the root file, which can be found using ``cd flask/lims_results``. 

To access individule files, execute ``vi (filepath/)filename``. 
