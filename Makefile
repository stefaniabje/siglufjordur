
all:
    @echo "No default target"

bootstrap:
    virtualenv venv
    source venv/bin/activate
    pip install -r requirements.txt
