from flask import Flask, flash, redirect, render_template, request, session, Blueprint

app = Flask(__name__,
                    static_folder='static',
                    template_folder='templates')

@app.route('/')
def index():
    return render_template("resume.html")

if __name__ == '__main__':
    app.run()

