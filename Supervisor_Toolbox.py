"""Main Python application file for the EEL-CRA demo."""

# imports
import platform
import sys
import inspect
import eel
import pyodbc
import datetime

# ZEBRA ----------------------------------------------------------------
import re
from zebra import Zebra

ZEBRA = Zebra()


class ZebraPRNPrintException(Exception):
    pass


class MissingVariableException(ZebraPRNPrintException):
    pass


def get_printers():
    ''' Return a list of available printers, empty if there aren't any
    '''
    return ZEBRA.getqueues()


def get_default_printer():
    ''' Return the queue name for the first Zebra printer found, None
    if no Zebra can be found
    '''
    print("get_default_printer called")
    printers = get_printers()
    for p in printers:
        if any(z in p.lower() for z in ('zebra', 'zpl', 'zdesigner')):
            # print(p)
            ZEBRA.setqueue(p)
            return p
    return None


def parse_prn(prn_text):
    ''' Return a list of variable names in the prn_text input
    '''
    m = re.findall('<([a-zA-Z_0-9]+?)>', prn_text)
    if m is None:
        return []
    return list(set(m))


def read_variables(fin='variables2.txt'):
    ''' Read the variables specified in 'fin' and return a dict
    '''
    d = {}
    with open(fin, 'r') as fh:
        for _l in fh:
            if ',' in _l:
                d.update((_l.strip().split(',', 1),))
    return d


def replace_prn_variables(prn_text, variables):
    ''' Ensure that all required variables for the supplied PRN text
    are in the variables dict, raising MissingVariableException
    with a list of missing variable names if not
    Otherwise replace all variables and return the new PRN text
    '''
    expected = parse_prn(prn_text)
    missing = []
    for e in expected:
        v = variables.get(e, None)
        if v is None:
            missing.append(e)
        else:
            prn_text = prn_text.replace('<%s>' % e, v)
    if missing:
        raise MissingVariableException(missing)
    return prn_text


def send_prn(prn_text):
    ''' Send prn_text to the printer. Only printable chars are sent

    Silently escape errors
    '''
    try:
        ZEBRA.output(''.join(c for c in prn_text if ord(c) < 128))
    except Exception:
        return None


# ZEBRA-END ----------------------------------------------------------------


ROLLBACK_STEP = 1
ROLLBACK_INDEX = ROLLBACK_STEP - 1

MODE_MANUAL = "manual"
MODE_INSTANT = "instant"
CONST_SUCCESS = "SUCCESS"
CONST_FAILURE = "FAILURE"
CONST_UNKNOWN = "UNKNOWN"
CONST_REASON_DEFAULT = "Other - Not specified"
INSTANT_MODE_STATUS_ID = -1

status_desc_for_id_status = {
    0: 'False',
    1: 'True',
    2: 'Open',
    3: 'Closed',
    4: 'Active',
    5: 'Inactive',
    6: 'Created',
    7: 'Printed',
    8: 'Flash Programming',
    9: 'SFDC Flash Programming',
    10: 'Bottom Side',
    11: 'Top Side',
    12: 'Repairs',
    13: 'PCBA Test Passed',
    14: 'SFDC Test Jigs',
    15: 'AOI Test Passed',
    16: 'Mechanical',
    17: 'Base Label Print',
    18: 'CA Test Passed',
    19: 'Giftbox Pairing',
    20: 'Carton Packaging',
    21: 'Carton Verified',
    22: 'OQC Test Passed',
    23: 'Pallet Check',
    24: 'Dispatch',
    28: 'In Stores',
    29: 'Out Stores',
    30: 'Duplication Process',
    31: 'Return To Stores',
    32: 'HDD Pairing',
    33: 'Voucher Pairing',
    34: 'Voucher Verification',
    35: 'Customer Return File',
    36: 'Locking Test Passed',
    38: 'Loose Label Print',
    39: 'Blacklisted',
    40: 'Shipped',
    41: 'Returned for Rework',
    42: 'Component Changer',
    43: 'Scrapped',
    44: 'Repair Checked Out PCBA',
    45: 'Repair Checked Out Mechanical',
    46: 'Component Changed PCBA',
    47: 'Component Changed Mechanical',
    48: 'PCBA Test Failed',
    49: 'CA Test Failed',
    50: 'OQC Test Failed',
    51: 'Locking Test Failed',
    52: 'Repairs Quarantine',
    53: 'Shipped Erroneously',
    54: 'GDL Reworked',
    56: 'GDL Reworked TSC Generated',
    57: 'Soak Test',
    58: 'QR Code Printed',
    59: 'Special Shipment',
    65: 'AOI Test Failed',
    66: 'Repair Checked Out PCB Label Duplication',
    67: 'Component Changed PCB Label Duplication',
    68: 'Repair Checked Out AOI',
    69: 'Component Changed AOI',
    70: 'SDTV Approved',
    71: 'Submitted for Shipping Approval',
    72: 'Netstar PCBA Retest',
    73: 'Awaiting OQC Test',
    74: 'Awaiting QC Buy-Off PCBA Test',
    77: 'Soak Test Passed',
    78: 'Soak Test Failed',
    79: 'CW Fuse Incorrectly Blown',
    80: 'Giftbox Pairing Verified',
    81: 'Reworked To New Variant',
    82: 'Reverified Pallet',
    83: 'PCB Label Verified',
    84: 'Blacklisted PCB Labels',
    85: 'Assembly Received',
    86: 'Wireless Test Passed',
    87: 'Wireless Test Failed',
    88: 'Key Test Passed',
    89: 'Key Test Failed',
    90: 'QR Code Verified',
    91: 'Reworked for RCU Issues'
}
rollback_rules_matrix = {
    # IF CURR_STATUS 58	QR Code Printed
    58: [15],           # 15	AOI Test Passed	only if status = 90/58
    # IF CURR_STATUS 90	QR Code Verified
    90: [15],           # 15	AOI Test Passed	only if status = 90/58
    # IF CURR_STATUS 13	PCBA Test Passed
    # 90	QR Code Verified	only if status = 13/16/18[ PTC software required]
    13: [90],
    # IF CURR_STATUS 16	Mechanical
    16: [13,            # 13	PCBA Test Passed	only if status = 16/18/19/80
         90],                # 90	QR Code Verified	only if status = 13/16/18[ PTC software required]
    # IF CURR_STATUS 18	CA Test Passed
    18: [16,            # 16	Mechanical	only if status = 18
         13,                 # 13	PCBA Test Passed	only if status = 16/18/19/80
         90],                # 90	QR Code Verified	only if status = 13/16/18[ PTC software required]
    # IF CURR_STATUS 19	CA Test Passed
    19: [18,             # 18	CA Test Passed	only if status = 19/80/57/22/73
         13],                # 13	PCBA Test Passed	only if status = 16/18/19/80
    # IF CURR_STATUS 80	Giftbox Pairing Verified
    80: [18,             # 18	CA Test Passed	only if status = 19/80/57/22/73
         13,                 # 13	PCBA Test Passed	only if status = 16/18/19/80
         ],
    # IF CURR_STATUS 73	Awaiting OQC Test
    73: [18],           # 18	CA Test Passed	only if status = 19/80/57/22/73
    # IF CURR_STATUS 50	OQC Test Failed
    50: [73],            # 73	Awaiting OQC Test	only if status = 50
    # IF CURR_STATUS 22	OQC Test Passed
    22: [18],            # ????? 18	CA Test Passed	only if status = 19/80/57/22/73
    # IF CURR_STATUS 57	Soak Test
    # 57:[22],            # 22	OQC Test Passed     only if a unit needs to be forced into soak , Allows prod statuses  from testing to passed OQC
    # TODO Soak Test after discussion
}


def get_current_time():
    now = datetime.datetime.now()
    return now.strftime('%Y/%m/%d %H:%M:%S.%f')[:-3]


def rollback_instant(mode, conn, cursor, pcb_sn, target_status_id, reason_desc, id_user):
    print("""rollback_instant called""")
    response_data = {
        "function_name": inspect.currentframe().f_code.co_name
    }
    current_time = get_current_time()
    if(pcb_sn == ''):
        print(
            f'[WARNING: Blank Cell Value - {type(pcb_sn)} ~ {pcb_sn}, will skip this invalid cell value')
        raise ValueError('Error: Empty PCB or Serial Number')
        # Code Here ###
        # prod_id = 'NOT FOUND'
        # customer_address = 'NOT FOUND'
    else:
        results = None
        try:
            if type(id_user) == int:
                try:
                    select_sql = f'''
                    SELECT pe.id_status, pro.prod_id, pro.prod_desc, status_desc FROM stb_production.dbo.production_event pe
                    INNER JOIN stb_production.dbo.status st ON st.id_status = pe.id_status
                    INNER JOIN stb_production.dbo.product pro ON pro.prod_id = pe.prod_id
                    WHERE pcb_num  = \'{pcb_sn}\' OR stb_num = \'{pcb_sn}\''''
                    print(f'[SELECT-SQL] {select_sql}')
                    response_data = {
                        **response_data,
                        "timestamp": current_time,
                        "pcb_sn": pcb_sn,
                        "select_query": select_sql,
                    }
                    conn.autocommit = False
                    results = cursor.execute(select_sql).fetchall()
                    print(f'[SELECT-SQL-RESULTS] {results}')

                    if len(results) == 1:
                        row = results[0]
                        response_data = {
                            **response_data,
                            "select_count": len(results),
                            "prod_id": row.prod_id,
                            "prod_desc": row.prod_desc,
                            "current_status": row.id_status,
                            "current_status_desc": row.status_desc,
                        }
                    else:
                        return {
                            "data": {
                                "metadata": {
                                    **response_data,
                                    "select_count": len(results),
                                    "id_user": id_user
                                }
                            },
                            "message": "PCB not found or search result not unique",
                            "status": CONST_FAILURE,
                        }
                except pyodbc.DatabaseError as e:
                    print(
                        f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
                    cursor.rollback()
                    raise e
                except pyodbc.ProgrammingError as pe:
                    cursor.rollback()
                    print(
                        f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
                    raise pe
                except KeyError as ke:
                    print(
                        f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
                    raise ke
                else:
                    cursor.commit()
                finally:
                    conn.autocommit = True
                    if len(results) == 0:
                        raise ValueError("Error: record not found")
            else:
                raise ValueError(
                    (id_user, "id_user cannot be other than int type"))

        except Exception as e:
            print('Error on line {}'.format(
                sys.exc_info()[-1].tb_lineno), type(e).__name__, e)

            # raise e
            message = type(e).__name__ + ': ' + str(e)
            if type(e).__name__ == 'KeyError':
                message = "Rollback not allowed to target station"
            return {
                "data": {"metadata": response_data},
                "message": message,
                "status": CONST_FAILURE,
            }
            # row = results # HACK
            # if row in results:

        # print(f'[SQL_SELECT_RESULTS] {results}')
        if len(results) == 1:
            row = results[0]
            target_status = target_status_id
            print(f'[{pcb_sn}] >> {type(row)} >> {row}')

            try:
                try:
                    # Find and update the target_status
                    response_data = {
                        **response_data,
                        "target_status": target_status,
                        "id_user": id_user
                    }
                    print(f"--1 {row.id_status} {ROLLBACK_INDEX}")
                    if mode == MODE_INSTANT:
                        target_status = rollback_rules_matrix[row.id_status][ROLLBACK_INDEX]
                    elif mode == MODE_MANUAL:
                        allowed = target_status in rollback_rules_matrix[row.id_status]
                        print(f'allowed target status? {allowed}')
                        if allowed is False:
                            response_data = {
                                **response_data,
                                "allowed_target_status": rollback_rules_matrix[row.id_status]
                            }

                    print(f"--2 {target_status}")
                    if target_status in rollback_rules_matrix[row.id_status] and target_status != -1:
                        update_sql = f'''SET NOCOUNT ON; UPDATE stb_production.dbo.production_event
                                    SET id_status={target_status}, [timestamp] = N\'{current_time}\', id_user={id_user}  WHERE pcb_num=N\'{pcb_sn}\' OR stb_num=N\'{pcb_sn}\'; SET NOCOUNT OFF;'''
                    else:
                        raise ValueError("Incorrect target_status")

                    print("--3")
                    print(f'[UPDATE-SQL] {update_sql}')
                    print("--4")
                    conn.autocommit = False
                    update_count = cursor.execute(update_sql)
                    print("--5")
                    response_data = {
                        **response_data,
                        "update_query": update_sql,
                        "update_count": update_count,
                        "current_status": row.id_status,
                        "target_status": target_status,
                        "id_user": id_user
                    }
                    print("--6")
                except pyodbc.DatabaseError as e:
                    print(
                        f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
                    cursor.rollback()
                    raise e

                except pyodbc.ProgrammingError as pe:
                    cursor.rollback()
                    print(
                        f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
                    raise pe
                except KeyError as e:
                    print(f"--7 {type(e).__name__ + ': ' + str(e)}")
                    print(
                        f'[ERROR: eyError - {e.args}, will skip this invalid cell value')
                    raise e
                else:
                    cursor.commit()

                finally:
                    print("--8")
                    conn.autocommit = True

            except Exception as e:
                print("--9")
                print(
                    f'>>>>>>> {type(e).__name__} type_of_e: {type(e.args)}')
                print('Error on line {}'.format(
                    sys.exc_info()[-1].tb_lineno), type(e).__name__, e)

                # raise e
                message = type(e).__name__ + ': ' + str(e)

                if type(e).__name__ == "KeyError" and len(e.args) and type(e.args[0]) == int:
                    print(f"--10 {e.args[0]}")
                    message = f"Rollback not allowed from {status_desc_for_id_status[e.args[0]]}"
                    print(f"--11 {message}\n{response_data}")
                return {
                    "data": {"metadata": response_data},
                    "message": message,
                    "status": CONST_FAILURE,
                }
            print("--12")
            temp_row = [pcb_sn, row.id_status, row.status_desc, '>>>',
                        target_status, status_desc_for_id_status[target_status]]
            print("--13")
            print(f'<<< {temp_row}')
            return {
                "data": {
                    "metadata": response_data
                },
                "message": temp_row,
                "status": CONST_SUCCESS,
            }
        else:
            print("--14")
            return {
                "data": {
                    "metadata": len(results)
                },
                "message": "PCB not found or search result not unique",
                "status": CONST_FAILURE,
            }


def roll_back_insert_tracking(conn, cursor, pcb_sn, prod_id, target_status_id, reason_desc, id_user, timestamp):
    print(
        f'[roll_back_insert_tracking] record updated for {pcb_sn} status: {target_status_id} on {timestamp} with reason: {reason_desc} by {id_user}')
    try:
        insert_sql = f'''SET NOCOUNT ON; INSERT INTO stb_production.dbo.roll_back (serial_num, prod_id, ncr_num, id_user, entry_date) VALUES(N\'{pcb_sn}\', {prod_id}, N\'{reason_desc}\', {id_user}, N\'{timestamp}\'); SET NOCOUNT OFF;'''
        print(f'[INSERT-SQL] {insert_sql}')
        # return
        conn.autocommit = False
        insert_count = cursor.execute(insert_sql)
        print(f'insert_count: {insert_count}')
    except pyodbc.DatabaseError as e:
        print(
            f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
        cursor.rollback()
        raise e

    except pyodbc.ProgrammingError as pe:
        cursor.rollback()
        print(
            f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
        raise pe
    except KeyError as e:
        print(f"--7 {type(e).__name__ + ': ' + str(e)}")
        print(
            f'[ERROR: eyError - {e.args}, will skip this invalid cell value')
        raise e
    else:
        cursor.commit()

    finally:
        print("--8")
        conn.autocommit = True


class Server:
    conn = None
    cursor = None

    def __init__(self, host="", driver="", database="", username="", password=""):
        # DEVELOPMENT CONFIG
        self.driver = "{ODBC Driver 17 for SQL Server}"
        self.database = "stb_production"
        self.server = host  # "172.20.10.103\\PRODUCTION"
        self.username = "Neo.Tech"
        self.password = "Password357"
        # LOCAL FOR TESTING
        # self.server = "HOMEPC\\SQLEXPRESS"
        # self.username = "Bhanu.Pratap"
        # self.password = "Password123"

    def getInstanceStatus(self):
        connection_status = CONST_FAILURE
        message = CONST_FAILURE
        if (self.conn and self.cursor):
            connection_status = CONST_SUCCESS
            connection_status = 'Server Already Connected'
        else:
            message += "Instance is null"
        return {"data": {"metadata": None}, "message": message, "status": connection_status}

    def __del__(self):
        print(f'Server {self.server} instance destroyed')
        if(self.conn):
            try:
                self.conn.close()
            except Exception as e:
                print(
                    f'Server {self.server} has no connection established earlier' + type(e).__name__ + ': ' + str(e))
        else:
            print(
                f'Server {self.server} has no connection established earlier')

    # def connect(self, driver='', server='', database='', username='', password=''):
    def connect(self):
        connection_status = 'FAILURE: '
        print(
            f'connect to driver={self.driver}, server={self.server}, database={self.database}, username={self.username}, password={self.password}')
        try:
            # if(server == ''):
            # conn_str = f'''DRIVER=\"{self.driver}\";SERVER=\"{self.server}\";DATABASE=\"{self.database}\";UID=\"{self.username}\";PWD=\"{self.password}\";'''
            # print(f'[CONNECTION-STRING] {conn_str}')
            # self.conn = pyodbc.connect(conn_str)
            # else:
            self.conn = pyodbc.connect("DRIVER=" + self.driver
                                       + ";SERVER=" + self.server
                                       + ";DATABASE=" + self.database
                                       + ";UID=" + self.username
                                       + ";PWD=" + self.password)
            if(self.conn):
                self.cursor = self.conn.cursor()
                print(f'Connection established with server {self.server}')
                connection_status = CONST_SUCCESS
            else:
                print(f'Error: Server {self.server} could not be connected!')
                connection_status = connection_status + "unable to establish server connection"
        except Exception as e:
            connection_status = connection_status + \
                type(e).__name__ + ': ' + str(e)
            print(
                f'Error: Server {self.server} could not be connected! \n {connection_status}')
        if(connection_status == CONST_SUCCESS):
            return {"data": {"metadata": connection_status}, "message": connection_status, "status": CONST_SUCCESS}
        else:
            return {"data": {"metadata": connection_status}, "message": connection_status, "status": CONST_FAILURE}

    def disconnect(self):
        connection_status = CONST_SUCCESS
        # connection_status = CONST_SUCCESS
        # print(
        #             connection_status=connection_status + "unable to establish server connection"
        #             f'Server {self.server} has no connection established earlier')
        # connection_status = connection_status + type(e).__name__ + ': '+ str(e)
        # print(
        #         f'Error: Server {self.server} could not be connected! \n {connection_status}')
        try:
            if(self.conn):
                self.cursor.close()
            else:
                connection_status = connection_status = 'FAILURE: ' + 'No active connection'
                print(
                    connection_status=connection_status + "unable to establish server connection"
                    f'Server {self.server} has no connection established earlier')
        except Exception as e:
            connection_status = 'FAILURE: ' + type(e).__name__ + ': ' + str(e)
            print('SERVER: cursor close error: ' + connection_status)

        try:
            self.conn.close()
        except Exception as e:
            connection_status = 'FAILURE: ' + type(e).__name__ + ': ' + str(e)
            print('SERVER: connection close error: ' + connection_status)

        if(connection_status.startswith(CONST_SUCCESS)):
            return {"data": {"metadata": connection_status}, "message": connection_status, "status": CONST_SUCCESS}
        else:
            return {"data": {"metadata": connection_status}, "message": connection_status, "status": CONST_FAILURE}


serverinstance = None


# Use latest version of Eel from parent directory
sys.path.insert(1, '../../')


@eel.expose  # Expose function to JavaScript
def say_hello_py(x):
    """Print message from JavaScript on app initialization, then call a JS function."""
    print('Hello from %s' % x)  # noqa T001
    eel.say_hello_js('Python {from within say_hello_py()}!')


# @eel.expose
# def expand_user(folder):
#     """Return the full path to display in the UI."""
#     return '{}/*'.format(os.path.expanduser(folder))


# @eel.expose
# def pick_file(folder):
#     """Return a random file from the specified folder."""
#     folder = os.path.expanduser(folder)
#     if os.path.isdir(folder):
#         listFiles = [_f for _f in os.listdir(
#             folder) if not os.path.isdir(os.path.join(folder, _f))]
#         if len(listFiles) == 0:
#             return 'No Files found in {}'.format(folder)
#         choice = random.choice(listFiles)
#         print(f'{choice} choosen')
#         return choice
#     else:
#         return '{} is not a valid folder'.format(folder)
#  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #


@eel.expose
def connect_db(host="", driver="", database="", username="", password=""):
    """Returns connection status if connected, else connects to the production server"""
    print(
        f'[APP] requested connect_db driver={driver}, host={host}, database={database}, username={username}, password={password}')
    global serverinstance
    if serverinstance:
        return serverinstance.getInstanceStatus()
    else:
        serverinstance = Server(host)
        # serverinstance = Server(driver, server, database, username, password)
        return serverinstance.connect()
    # if(serverinstance):
    #     return "Success"
    # else:
    #     return "Unable to connect"
    # pass


@eel.expose
def disconnect_db():
    """Returns connection status if connected, else connects to the production server"""
    print('[APP] requested disconnect_db')
    global serverinstance
    if serverinstance:
        serverinstance = serverinstance.disconnect()
        serverinstance = None
        return {"data": {"metadata": None}, "message": "Server Disonnected", "status": CONST_SUCCESS}
    else:
        return {"data": {"metadata": None}, "message": "FAILURE: No server instance available", "status": CONST_FAILURE}

    # if(serverinstance):
    #     return "Success"
    # else:
    #     return "Unable to connect"
    # pass


@eel.expose
def rollback(pcb_sn='', mode=MODE_INSTANT, target_status_id=INSTANT_MODE_STATUS_ID, reason_desc=CONST_REASON_DEFAULT, id_user=''):
    print(
        f'''[APP] requested rollback \npcb_num:{pcb_sn} mode:{mode} rollback done to target_status_id:{target_status_id} reason: {reason_desc}''')
    global serverinstance
    # rollback_status = CONST_FAILURE
    # response_data = None
    help_message = ''
    ret = {
        "data": {
            "metadata": None,
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        try:
            if(mode == MODE_INSTANT or mode == MODE_MANUAL):
                # HANDLE INSTANT ROLLBACK
                ret = rollback_instant(mode, serverinstance.conn,
                                       serverinstance.cursor, pcb_sn, target_status_id, reason_desc, id_user)
                # rollback_status = f'''{ret.status} {pcb_sn} {mode} rollback done to {target_status_id}'''
            # elif(mode == MODE_MANUAL):
            #     # HANDLE MANUAL ROLLBACK
            #     help_message = f'''{CONST_FAILURE} {pcb_sn} {mode} rollback done to {target_status_id}'''
            #     ret = {
            #         **ret,
            #         "message": help_message
            #     }
            else:
                # ELSE
                help_message = f'''{CONST_FAILURE} {pcb_sn} not allowed target status {target_status_id} in {mode} '''
                ret = {
                    **ret,
                    "message": help_message
                }

        except Exception as e:
            help_message = f'''EXCEPTION {pcb_sn} {mode} rollback done to {target_status_id} Message: {type(e).__name__ + ': '+ str(e)}'''
            ret = {
                **ret,
                "message": help_message
            }
        if ret['status'] == CONST_SUCCESS:
            # Update roll_back table for tracking
            try:
                prod_id = ret['data']['metadata']['prod_id']
                timestamp = ret['data']['metadata']['timestamp']
                target_status = ret['data']['metadata']['target_status']
                print(ret['data']['metadata']['prod_id'])
                roll_back_insert_tracking(serverinstance.conn,
                                          serverinstance.cursor, pcb_sn, prod_id, target_status, reason_desc, id_user, timestamp)
            except Exception as e:
                help_message = f'''EXCEPTION {pcb_sn} {mode} rollback done to {target_status} Message: {type(e).__name__ + ': '+ str(e)}'''
                ret = {
                    **ret,
                    "message": help_message
                }

    print(f'''HELP> {help_message}''')

    return ret
    # return {"data": 'hello', 'repsonse': 'world'}


@eel.expose
def get_last_pallet_carton(prod_id=-1, choice="pallet"):
    global serverinstance
    print(f'[get_last_pallet] requested last pallet for {prod_id}')
    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": None,
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        select_sql = ""
        # choice = 25 if choice == "pallet" else 24
        choice_carton = 24
        choice_pallet = 25
        if (choice == "pallet"):
            select_sql = f'''SELECT cd_data FROM stb_production.dbo.config_data cd
                        WHERE id_config_data = (SELECT id_config_data FROM stb_production.dbo.prod_config pc
                        WHERE prod_id = {prod_id} and id_config_param = {choice_pallet})'''
        elif (choice == "carton"):
            select_sql = f'''SELECT cd_data FROM stb_production.dbo.config_data cd
                        WHERE id_config_data = (SELECT id_config_data FROM stb_production.dbo.prod_config pc
                        WHERE prod_id = {prod_id} and id_config_param = {choice_carton})'''
        else:
            select_sql = f'''SELECT cd.cd_data FROM stb_production.dbo.config_data cd
                        WHERE id_config_data IN (SELECT id_config_data FROM stb_production.dbo.prod_config pc
                        WHERE prod_id = {prod_id} and (id_config_param = {choice_carton} OR id_config_param = {choice_pallet}))'''
        print(f'[SELECT-SQL] {select_sql}')

        try:
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results} len: {len(results)}')

            if len(results) == 1:
                row = results[0]
                k = "last_pallet" if choice == "pallet" else "last_carton"
                response_data = {
                    **response_data,
                    "message": "Last pallet: {row.cd_data} for prod_id: {prod_id}",
                    "data": {
                        "metadata": {
                            "select_count": len(results),
                            k: row.cd_data,
                        },
                    },
                    "status": CONST_SUCCESS,
                }
            elif len(results) == 2:
                ctn_row = results[0]
                plt_row = results[1]
                # k = "last_pallet" if choice == "pallet" else "last_carton"
                response_data = {
                    **response_data,
                    "message": "Last pallet: {row.cd_data} for prod_id: {prod_id}",
                    "data": {
                        "metadata": {
                            "select_count": len(results),
                            "last_carton": ctn_row.cd_data,
                            "last_pallet": plt_row.cd_data,
                        },
                    },
                    "status": CONST_SUCCESS,
                }
            else:
                response_data = {
                    **response_data,
                    "message": "Enter Manually",
                    "status": CONST_FAILURE,
                }
        except pyodbc.DatabaseError as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except pyodbc.ProgrammingError as pe:
            cursor.rollback()
            print(
                f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
            raise pe
        except KeyError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            if len(results) == 0:
                raise ValueError("Error: record not found")
            else:
                return response_data
    # return response_data

# Verfiying if the scanned barcode exists and has allowed status


@eel.expose
def is_valid_unit(application="", allowed_status=[], pcb_sn="", is_ott=False):
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": None,
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        print(
            f'[is_valid_unit] {application} - {allowed_status} requested for pcb_sn: {pcb_sn}')

        try:
            select_sql = ""
            if (is_ott):
                select_sql = f'''SELECT stb_num, pe.pcb_num, snr.Field2 as cdsn_iuc, pro.prod_id, pro.prod_desc, pe.id_status, status_desc, carton_num, pallet_num
                                    FROM stb_production.dbo.production_event pe
                                        INNER JOIN stb_production.dbo.status st ON st.id_status = pe.id_status
                                        INNER JOIN NEWDB.dbo.SNRecord snr ON snr.SN = pe.stb_num
                                        INNER JOIN stb_production.dbo.product pro ON pro.prod_id = pe.prod_id
                                        WHERE pcb_num  = \'{pcb_sn}\' OR stb_num = \'{pcb_sn}\''''
            else:
                # TODO: Currently the proudct iuc will be fetched only for 4140, to be made generic
                select_sql = f'''SELECT stb_num, pe.pcb_num, dsd.cdsn_iuc as cdsn_iuc, pro.prod_id, pro.prod_desc, pe.id_status, status_desc, carton_num, pallet_num
                                    FROM stb_production.dbo.production_event pe
                                        INNER JOIN stb_production.dbo.status st ON st.id_status = pe.id_status
                                        INNER JOIN stb_production.dbo.device_state_dsd_4140 dsd ON dsd.id_production_event = pe.id_production_event
                                        INNER JOIN stb_production.dbo.product pro ON pro.prod_id = pe.prod_id
                                        WHERE pcb_num  = \'{pcb_sn}\' OR stb_num = \'{pcb_sn}\''''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) == 1:
                row = results[0]
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "stb_num": row.stb_num,
                            "pcb_num": row.pcb_num,
                            "cdsn_iuc": row.cdsn_iuc,
                            "prod_desc": row.prod_desc,
                            "current_status": row.id_status,
                            "status_desc": row.status_desc,
                            "carton_num": row.carton_num,
                            "pallet_num": row.pallet_num,
                            "prod_id": row.prod_id,
                            "id_status": row.id_status,
                        }
                    },
                }
                if results[0].id_status in allowed_status:
                    response_data = {
                        **response_data,
                        "message": f'''{pcb_sn} is in {allowed_status} status''',
                        "status": CONST_SUCCESS,
                    }
                else:
                    response_data = {
                        **response_data,
                        "message": f'''{pcb_sn} is not in {allowed_status} allowed status''',
                        "status": CONST_FAILURE,
                    }
            else:
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": f'''Ambiguous results found for {pcb_sn}''',
                    "status": CONST_FAILURE,
                }
        except pyodbc.DatabaseError as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except pyodbc.ProgrammingError as pe:
            cursor.rollback()
            print(
                f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
            raise pe
        except KeyError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            if len(results) == 0:
                # raise ValueError("Error: record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "stb_num": pcb_sn,
                            "pcb_num": pcb_sn,
                            "cdsn_iuc": CONST_UNKNOWN,
                            "prod_desc": CONST_UNKNOWN,
                            "current_status": -1,
                            "status_desc": CONST_UNKNOWN,
                            "carton_num": CONST_UNKNOWN,
                            "pallet_num": CONST_UNKNOWN,
                            "prod_id": -1,
                            "id_status": -1,
                        },
                    },

                    "message": f'''{pcb_sn} pcb / serial not found in records''',
                    "status": CONST_FAILURE,
                }
            return response_data
    # return response_data


@eel.expose
def get_printer_list():
    printers = get_printers()
    print(type(printers))
    print(printers)
    response_data = {"function_name": inspect.currentframe().f_code.co_name, "data": {"metadata": {
        "printers": printers
    }}, "message": "Printer List", "status": CONST_SUCCESS}
    return response_data


@eel.expose
def send_fraction_print(printer_name="", pallet_num="", stb_num_list=[]):
    print(
        f'[SEND-FRACTION-PRINT] printer: {printer_name} pallet: {pallet_num} stbs: {stb_num_list}')
    response_data = {"function_name": inspect.currentframe().f_code.co_name, "data": {"metadata": {
        "pallet_num": pallet_num
    }}, "message": "Fraction Pallet Created", "status": CONST_SUCCESS}
    return response_data


@eel.expose
def get_active_products():
    print('[GET-ACTIVE-PRODUCTS] requested')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": None,
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        try:
            select_sql = '''SELECT prod_id
                                ,prod_desc
                            FROM stb_production.dbo.product
                            WHERE id_status = 4'''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) > 0:
                prod_list = []
                for row in results:
                    print(row)
                    prod_list.append({"prod_id": row[0], "prod_desc": row[1]})

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "prod_list": prod_list,
                        },
                    },
                    "message": "Active Product List",
                    "status": CONST_SUCCESS,
                }

        except pyodbc.DatabaseError as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except pyodbc.ProgrammingError as pe:
            cursor.rollback()
            print(
                f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
            raise pe
        except KeyError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            print(response_data)
            if len(results) == 0:
                # raise ValueError("Error: record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Active Products Found",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def get_frequent_params(prod_id, table, param_name, key):
    print(
        f'[GET-FREQUENT-PARAMS] prod_id: {prod_id} table: {table} param_name: {param_name} key: {key}')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": None,
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }
    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        try:
            if (table == "prod_config"):
                select_sql = f'''SELECT cp.cp_desc, cd.cd_data
                                FROM stb_production.dbo.config_data cd
                                INNER JOIN stb_production.dbo.prod_config pc ON pc.id_config_data = cd.id_config_data
                                INNER JOIN stb_production.dbo.config_param cp ON cp.id_config_param = pc.id_config_param
                                WHERE pc.prod_id = {prod_id} and cp.id_config_param = {key}'''
                print(f'[SELECT-SQL] {select_sql}')
                response_data = {
                    **response_data,
                    "select_query": select_sql,
                }
                conn.autocommit = False
                results = cursor.execute(select_sql).fetchall()
                print(f'[SELECT-SQL-RESULTS] {results}')
                if len(results) == 1:
                    cp_desc = results[0][0]
                    cd_data = results[0][1]
                    print(f'cd_data {cd_data}')
                    response_data = {
                        **response_data,
                        "data": {
                            "metadata": {
                                "param_desc": cp_desc,
                                "param_value": cd_data,
                            }
                        },
                        "message": "Retrieved cd_data for parameter",
                        "status": CONST_SUCCESS,
                    }

        except pyodbc.DatabaseError as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except pyodbc.ProgrammingError as pe:
            cursor.rollback()
            print(
                f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
            raise pe
        except KeyError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            if len(results) == 0:
                # raise ValueError("Error: record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Active Products Found",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def set_frequent_params(prod_id, table, param_name, key, param_value):
    print(
        f'[SET-FREQUENT-PARAMS] prod_id: {prod_id} table: {table} param_name: {param_name} key: {key} param_value: {param_value}')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": None,
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }
    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        try:
            try:
                # Find and update the target_status
                update_sql = ""
                if (table == "prod_config"):
                    update_sql = f'''UPDATE cd
                                    SET cd.cd_data = {param_value}
                                    FROM stb_production.dbo.config_data cd
                                    INNER JOIN stb_production.dbo.prod_config pc ON pc.id_config_data = cd.id_config_data
                                    INNER JOIN stb_production.dbo.config_param cp ON cp.id_config_param = pc.id_config_param
                                    WHERE pc.prod_id = {prod_id} and cp.id_config_param = {key}'''
                    response_data = {
                        **response_data,
                        "update_query": update_sql,
                    }
                    print(f'[UPDATE-SQL] {update_sql}')
                conn.autocommit = False
                update_count = cursor.execute(update_sql)
                print(f'[UPDATE-SQL-RESULTS] {vars(update_count)}')
                response_data = {
                    **response_data,
                    "update_count": update_count,
                }
            except pyodbc.DatabaseError as e:
                print(
                    f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
                cursor.rollback()
                raise e

            except pyodbc.ProgrammingError as pe:
                cursor.rollback()
                print(
                    f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
                raise pe
            except KeyError as e:
                print(f"--7 {type(e).__name__ + ': ' + str(e)}")
                print(
                    f'[ERROR: eyError - {e.args}, will skip this invalid cell value')
                raise e
            else:
                cursor.commit()

            finally:
                conn.autocommit = True
                return {
                    **response_data,
                    "data": {"metadata": None},
                    "message": param_name + " data updated",
                    "status": CONST_SUCCESS,
                }

        except Exception as e:
            print(
                f'>>>>>>> {type(e).__name__} type_of_e: {type(e.args)}')
            print('Error on line {}'.format(
                sys.exc_info()[-1].tb_lineno), type(e).__name__, e)
            message = type(e).__name__ + ': ' + str(e)

            if type(e).__name__ == "KeyError" and len(e.args) and type(e.args[0]) == int:
                print(f"--10 {e.args[0]}")
                message = f"Rollback not allowed from {status_desc_for_id_status[e.args[0]]}"
                print(f"--11 {message}\n{response_data}")
            return {
                "data": {"metadata": None},
                "message": message,
                "status": CONST_FAILURE,
            }


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

    # Pass any second argument to enable debugging
    print(f'{sys.argv}')
    start_eel(develop=len(sys.argv) == 2)
