siglufjordur
============

This is a web application that enables story telling of locals through treasure hunting around Siglufjörður.


Installation
------------

It is an installation prerequisite to have installed Python's virtualenv:

    pip install virtualenv

Installation can either be done using the "bootstrap" make target:

    make bootstrap

Or by executing the necessary steps manually:

    virtualenv venv
    source venv/bin/activate
    pip install -r requirements.txt


Usage
-----

Run

    python app.py

to start a local server.

Run

    ifconfig

to find your IP address.

Open a browser on a smart phone / tablet. Type in the IP address you've looked up, but replace the last two section of the IP address with `1.100`, and append the port created when you launched the server.

Usage example
-------------

Say your IP address is `234.567.9.876`, and that you saw `http://0.0.0.0:5000/` when you launched the server, the URL you type into your phone's browser would be

    234.567.1.100:5000