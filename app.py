from flask import Flask
from flask import render_template

app = Flask(__name__)
app.debug = True


@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run("0.0.0.0")
