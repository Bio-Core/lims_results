FROM ubuntu

MAINTAINER Tom Wu

RUN apt-get clean
RUN apt-get update --fix-missing
RUN apt-get upgrade --yes
RUN apt-get install -y \
    python python-dev python-pip curl \
    apache2 libapache2-mod-wsgi

RUN mkdir /home/lims/
WORKDIR /home/lims/

COPY . /home/lims/

RUN pip install -r requirements.txt

EXPOSE 8003

CMD ["python", "/home/lims/app.py"]
