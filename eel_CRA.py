"""Main Python application file for the EEL-CRA demo."""

# imports
import os
import platform
import random
import sys
import eel
import pyodbc
import time
import pandas as pd
from tqdm.notebook import tqdm


class Server:
    conn = None
    cursor = None

    def __init__(self):
        # default config
        self.driver = "{ODBC Driver 17 for SQL Server}"
        self.server = "172.20.10.149\\PRODUCTION"
        self.database = "stb_production"
        self.username = "Neo.Tech"
        self.password = "Password357"

    def __del__(self):
        print(f'Server {self.server} instance destroyed')
        if(self.conn):
            self.conn.close()
        else:
            print(
                f'Server {self.server} has no connection established earlier')

    def connect(self, driver='', server='', database='', username='', password=''):
        if(server == ''):
            self.conn = pyodbc.connect("DRIVER=" + self.driver
                                       + ";SERVER=" + self.server
                                       + ";DATABASE=" + self.database
                                       + ";UID=" + self.username
                                       + ";PWD=" + self.password)
        else:
            self.server = server
            self.conn = pyodbc.connect("DRIVER=" + driver
                                       + ";SERVER=" + server
                                       + ";DATABASE=" + database
                                       + ";UID=" + username
                                       + ";PWD=" + password)
        if(self.conn):
            self.cursor = self.conn.cursor()
            print(f'Connection established with server {self.server}')
        else:
            print(f'Error: Server {self.server} could not be connected!')


# Use latest version of Eel from parent directory
sys.path.insert(1, '../../')


@eel.expose  # Expose function to JavaScript
def say_hello_py(x):
    """Print message from JavaScript on app initialization, then call a JS function."""
    print('Hello from %s' % x)  # noqa T001
    eel.say_hello_js('Python {from within say_hello_py()}!')


@eel.expose
def expand_user(folder):
    """Return the full path to display in the UI."""
    return '{}/*'.format(os.path.expanduser(folder))


@eel.expose
def pick_file(folder):
    """Return a random file from the specified folder."""
    folder = os.path.expanduser(folder)
    if os.path.isdir(folder):
        listFiles = [_f for _f in os.listdir(
            folder) if not os.path.isdir(os.path.join(folder, _f))]
        if len(listFiles) == 0:
            return 'No Files found in {}'.format(folder)
        choice = random.choice(listFiles)
        print(f'{choice} choosen')
        return choice
    else:
        return '{} is not a valid folder'.format(folder)
#  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #


def connect_db(path):
    """Returns connection status if connected, else connects to the production server"""
    pass


def start_eel(develop):
    """Start Eel with either production or development configuration."""

    if develop:
        directory = 'src'
        app = None
        page = {'port': 3000}
    else:
        directory = 'build'
        app = 'chrome-app'
        page = 'index.html'

    eel.init(directory, ['.tsx', '.ts', '.jsx', '.js', '.html'])

    # These will be queued until the first connection is made, but won't be repeated on a page reload
    say_hello_py('Python World!')
    # Call a JavaScript function (must be after `eel.init()`)
    eel.say_hello_js('Python World!')

    eel.show_log(
        'https://github.com/samuelhwilliams/Eel/issues/363 (show_log)')

    eel_kwargs = dict(
        host='localhost',
        port=8080,
        size=(1280, 800),
    )
    try:
        eel.start(page, mode=app, **eel_kwargs)
    except EnvironmentError:
        # If Chrome isn't found, fallback to Microsoft Edge on Win10 or greater
        if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
            eel.start(page, mode='edge', **eel_kwargs)
        else:
            raise


if __name__ == '__main__':
    import sys

    server = Server()
    server.connect()

    # Pass any second argument to enable debugging
    print(f'{sys.argv}')
    start_eel(develop=len(sys.argv) == 2)
