"""Main Python application file for the EEL-CRA demo."""

# imports
import platform
import sys
import inspect
import eel
import pyodbc
import datetime
import random
from time import sleep
# from util_order_items import order_items

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
INSTANT_STATUS_ID = -1
INVALID_PRODUCT_ID = -1
INVALID_PRODUCT_DESC = ""

# LIST OF AVAILABE STATUS LIST
report_status_mapping = {
    'LEFT_FACTORY': (40, 35, 24, 23, 21, 20),
    'DISPATCH': (23, 24, 35),
    'PACKAGING': (20, 21),
    'FID': (13, 16, 17, 18, 19, 22, 77, 80, 58, 90),
    'A/W PCBA TEST': (85, ),
    'SMD': (7, 83, 15),
    'QC': (57, 73, 74),
    'SCRAPPED': (43, ),
    'BLACKLISTED': (39, ),
    'REPAIRS': (12, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 65, 66, 68, 69, 78),
    'SHIPPED': (40, ),
    'PRINTED': (7, ),
    'ASSEMBLY_RECEIVED': (85, ),
    'BLACKLISTED_PCB': (84, ),
    'TOTAL': (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 56, 57, 58, 59, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91),
}

# left_factory_status_str = ','.join(map(lambda status: str(status), report_status_mapping['LEFT_FACTORY']))
blacklisted_str = ','.join(map(lambda status: str(status), report_status_mapping['BLACKLISTED']))
scrapped_str = ','.join(map(lambda status: str(status), report_status_mapping['SCRAPPED']))

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
    "DSD": {
        # IF CURR_STATUS 58	QR Code Printed
        58: [85],           # 85	Assembly Received	only if status = 90/58
        # IF CURR_STATUS 90	QR Code Verified
        90: [85],           # 85	Assembly Received	only if status = 90/58
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
    },
    "OTT": {
        # IF CURR_STATUS 16	Mechanical
        16: [85],                # 90	QR Code Verified	only if status = 13/16/18[ PTC software required]
        # IF CURR_STATUS 13	PCBA Test Passed
        13: [16, 90],
        86: [13, 16, 90],
        87: [13, 16, 90],
        88: [86, 13, 16],
        89: [86, 13, 16],
        18: [88, 13, 16],
        # # IF CURR_STATUS 18	CA Test Passed
        # 18: [13,            # 16	Mechanical	only if status = 18
        #     16,                 # 13	PCBA Test Passed	only if status = 16/18/19/80
        #     90],                # 90	QR Code Verified	only if status = 13/16/18[ PTC software required]
        # IF CURR_STATUS 19	CA Test Passed
        # IF CURR_STATUS 19	CA Test Passed
        19: [18,             # 18	CA Test Passed	only if status = 19/80/57/22/73
            16],                # 13	PCBA Test Passed	only if status = 16/18/19/80
        # IF CURR_STATUS 80	Giftbox Pairing Verified
        80: [18,             # 18	CA Test Passed	only if status = 19/80/57/22/73
            16],
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
}

status_mapping_ott = {
    16: 'NT',
    13: 'interfacetest',
    86: 'wirelesstest',
    88: 'infocheck',
    18: 'factoryinspection'
}


def get_current_time():
    now = datetime.datetime.now()
    return now.strftime('%Y/%m/%d %H:%M:%S.%f')[:-3]


def rollback_instant(mode, conn, cursor, prod_id, prod_desc, pcb_sn, target_status_id, reason_desc, id_user):
    print(f'rollback_instant called for {prod_id} - {prod_desc}')
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
        prod_key = None
        try:
            if prod_desc.startswith('DSD'):
                prod_key = 'DSD'
            elif prod_desc.startswith('OTT'):
                prod_key = 'OTT'
            else:
                ValueError('Invalid Product Type')

            if type(id_user) == int:
                try:
                    select_sql = f'''
                    SELECT pe.pcb_num, pe.stb_num, pe.id_status, pro.prod_id, pro.prod_desc, status_desc FROM stb_production.dbo.production_event pe
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
                            "pcb_num": row.pcb_num,
                            "stb_num": row.stb_num,
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
                        raise ValueError("record not found")
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
                        target_status = rollback_rules_matrix[prod_key][row.id_status][ROLLBACK_INDEX]
                    elif mode == MODE_MANUAL:
                        allowed = target_status in rollback_rules_matrix[prod_key][row.id_status]
                        print(f'allowed target status? {allowed}')
                        if allowed is False:
                            response_data = {
                                **response_data,
                                "data": {
                                    **response_data['data'],
                                    "metadata": {
                                        **response_data['data']['metadata'],
                                        "allowed_target_status": rollback_rules_matrix[prod_key][row.id_status]
                                    }
                                }
                            }

                    print(f"--2 {target_status}")
                    if target_status in rollback_rules_matrix[prod_key][row.id_status] and target_status != -1:
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

                print(f'{type(e).__name__} {len(e.args)} {type(e.args[0])}')
                if type(e).__name__ == "KeyError" and len(e.args) and type(e.args[0]) == int:
                    print(f"--10 {e.args[0]}")
                    message = f"Rollback not allowed from {status_desc_for_id_status[e.args[0]]}"
                    print(f"--11 {message}\n{response_data}")
                elif type(e).__name__ == "KeyError" and len(e.args) and type(e.args[0]) == str:
                    print(f"--12 {e.args[0]}")
                    message = f"Rollback not allowed for status {status_desc_for_id_status[target_status]}"
                    print(f"--13 {message}\n{response_data}")
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


def roll_back_ott_db(pcb_sn, target_status_id):
    print(
        f'[roll_back_ott_db] called for {pcb_sn} status: {target_status_id}')
    global serverinstance
    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor_ott
        conn = serverinstance.conn_ott
        try:
            newdb_status = status_mapping_ott[target_status_id]
            update_sql = f'''SET NOCOUNT ON; UPDATE snr
            SET snr.Field28 = \'{newdb_status}\'
            FROM NEWDB.dbo.SNRecord snr
            WHERE SN = \'{pcb_sn}\'; SET NOCOUNT OFF;'''
            print(f'[INSERT-SQL] {update_sql}')
            conn.autocommit = False
            update_result = cursor.execute(update_sql)
            if (update_result):
                print(f'[OTT] NEWEDB Successfully upadated, rowcount: {update_result.rowcount}')
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
    # FOR NEW DB
    conn_ott = None
    cursor_ott = None

    def __init__(self, host="", driver="", database="", username="", password=""):
        # DEVELOPMENT CONFIG
        self.driver = "{ODBC Driver 17 for SQL Server}"
        self.database = "stb_production"
        self.database_ott = "NEWDB"
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
            if (self.conn_ott and self.cursor_ott):
                connection_status = CONST_SUCCESS
            else:
                message += "NEWDB instance is null, "
            # connection_status = 'Server Already Connected'
        else:
            message += "stb_production instance is null"
        return {"data": {"metadata": None}, "message": message, "status": connection_status}

    def __del__(self):
        print(f'Server {self.server} instance destroyed')
        if(self.conn):
            try:
                self.conn.close()
                self.conn_ott.close()
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
            self.conn_ott = pyodbc.connect("DRIVER=" + self.driver
                                       + ";SERVER=" + self.server
                                       + ";DATABASE=" + self.database_ott
                                       + ";UID=" + self.username
                                       + ";PWD=" + self.password)

            if(self.conn):
                self.cursor = self.conn.cursor()
                print(f'[MAIN] Connection established with server {self.server}')
                if(self.conn_ott):
                    self.cursor_ott = self.conn_ott.cursor()
                    print(f'[OTT] Connection established with server {self.server}')
                    # connection_status = CONST_SUCCESS
                else:
                    print(f'Error: Server {self.server} could not be connected!')
                    connection_status = connection_status + f"unable to establish {self.database_ott} connection"
            else:
                print(f'Error: Server {self.server} could not be connected!')
                connection_status = connection_status + f"unable to establish {self.database} connection"

            if (self.cursor and self.cursor_ott):
                connection_status = CONST_SUCCESS
            else:
                print(f'Error: Server Cursors [MAIN]: {self.cursor_ott} [OTT]: {self.cursor} could not be connected!')
                connection_status = connection_status + f"unable to establish {self.database} connection"
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
    global messerverinstance
    if serverinstance:
        return serverinstance.getInstanceStatus()
    else:
        serverinstance = Server(host)
        messerverinstance = MesServer("172.20.10.149\\PRODUCTION")
        mes_connect_result = messerverinstance.connect()
        print(f'[MES] {mes_connect_result}')
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
    global messerverinstance
    if serverinstance:
        serverinstance = serverinstance.disconnect()
        serverinstance = None
        if messerverinstance:
            messerverinstance = messerverinstance.disconnect()
            messerverinstance = None
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
    response_data = {
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        prod_id = INVALID_PRODUCT_ID
        prod_desc = INVALID_PRODUCT_DESC
        try:
            resp = get_product_info(pcb_sn)
            if (resp['status'] == CONST_SUCCESS):
                metadata = resp['data']['metadata']
                print(f'metadata: {metadata}')
                if ('prod_id' in metadata and 'prod_desc' in metadata):
                    prod_id = metadata['prod_id']
                    prod_desc = metadata['prod_desc']
                    print(f'prod_id: {prod_id} prod_desc: {prod_desc}')
                else:
                    raise ValueError('Product Information Not Found for given PCB / Serial')
                # if (metadata['prod_id'] == 115):
                #     print('[APP] requested rollback for 115')
                #     prod_desc = metadata['prod_desc']
                #     response_data = {
                #         **response_data,
                #         "data": {
                #             "metadata": {
                #                 "unsupported_product": True
                #             },
                #         },
                #         "message": f'{prod_desc} currently not supported for rollback!',
                #         "status": CONST_FAILURE
                #     }
                #     return response_data
        except Exception as e:
            print('----15')
            help_message = f'''EXCEPTION {pcb_sn} {mode} Message: {type(e).__name__ + ': '+ str(e)}'''
            response_data = {
                **response_data,
                "message": help_message
            }
            return response_data
        try:
            if(mode == MODE_INSTANT or mode == MODE_MANUAL):
                # HANDLE INSTANT ROLLBACK
                response_data = rollback_instant(mode, serverinstance.conn, serverinstance.cursor, prod_id, prod_desc, pcb_sn, target_status_id, reason_desc, id_user)
                # rollback_status = f'''{response_data.status} {pcb_sn} {mode} rollback done to {target_status_id}'''
            # elif(mode == MODE_MANUAL):
            #     # HANDLE MANUAL ROLLBACK
            #     help_message = f'''{CONST_FAILURE} {pcb_sn} {mode} rollback done to {target_status_id}'''
            #     response_data = {
            #         **response_data,
            #         "message": help_message
            #     }
            else:
                # ELSE
                help_message = f'''{CONST_FAILURE} {pcb_sn} not allowed target status {target_status_id} in {mode} '''
                response_data = {
                    **response_data,
                    "message": help_message
                }

        except Exception as e:
            help_message = f'''EXCEPTION {pcb_sn} {mode} rollback done to {target_status_id} Message: {type(e).__name__ + ': '+ str(e)}'''
            response_data = {
                **response_data,
                "message": help_message
            }
        if response_data['status'] == CONST_SUCCESS:
            # Update roll_back table for tracking
            try:
                if prod_desc.startswith('OTT'):
                    stb_num = response_data['data']['metadata']['stb_num']
                    target_status = response_data['data']['metadata']['target_status']
                    print(f"[OTT] Rollbacked Items stb_num: {stb_num}")
                    if (stb_num != '' and stb_num is not None):
                        roll_back_ott_db(stb_num, target_status)

                    # print(f'resp: {resp}')
                    # response_data = {
                    #     **response_data,
                    #     "message": help_message
                    # }
            except Exception as e:
                help_message = f'''EXCEPTION {pcb_sn} {mode} rollback done to {target_status} Message: {type(e).__name__ + ': '+ str(e)}'''
                response_data = {
                    **response_data,
                    "message": help_message
                }

            try:
                prod_id = response_data['data']['metadata']['prod_id']
                timestamp = response_data['data']['metadata']['timestamp']
                target_status = response_data['data']['metadata']['target_status']
                print(response_data['data']['metadata']['prod_id'])
                roll_back_insert_tracking(serverinstance.conn,
                                          serverinstance.cursor, pcb_sn, prod_id, target_status, reason_desc, id_user, timestamp)
            except Exception as e:
                help_message = f'''EXCEPTION {pcb_sn} {mode} rollback done to {target_status} Message: {type(e).__name__ + ': '+ str(e)}'''
                response_data = {
                    **response_data,
                    "message": help_message
                }

    print(f'''HELP> {help_message}''')

    return response_data
    # return {"data": 'hello', 'repsonse': 'world'}


@eel.expose
def get_last_pallet_carton(prod_id=-1, choice="pallet"):
    global serverinstance
    print(f'[get_last_pallet] requested last pallet for {prod_id}')
    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
                raise ValueError("record not found")
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
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
                # raise ValueError("record not found")
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
def get_pallet_items(pallet_num):
    print('[pallet_rollback] requested')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            select_sql = f'''SELECT pe.pallet_num, pe.stb_num, p.prod_desc, pe.id_status, s.status_desc, u.user_desc, pe.prod_id FROM stb_production.dbo.production_event pe
                            INNER JOIN stb_production.dbo.[user] u ON u.id_user = pe.id_user
                            INNER JOIN stb_production.dbo.status s ON s.id_status = pe.id_status
                            INNER JOIN stb_production.dbo.product p ON p.prod_id = pe.prod_id
                            WHERE pe.pallet_num = \'{pallet_num}\' ORDER BY pe.id_status DESC'''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')
            result_count = len(results)
            if result_count > 0:
                list_results = []
                conversion_prod_id = []
                prod_id = results[0][6]
                if (prod_id in [94, 95, 96]):
                    conversion_prod_id = [94, 95, 96]
                elif (prod_id in [97, 98, 99, 100, 101, 102, 103]):
                    conversion_prod_id = [97, 98, 99, 100, 101, 102, 103]
                elif (prod_id in [105, 106, 107]):
                    conversion_prod_id = [105, 106, 107]
                elif (prod_id in [108, 109, 110, 111, 112, 113, 114]):
                    conversion_prod_id = [108, 109, 110, 111, 112, 113, 114]

                for row in results:
                    list_results.append({
                        "pallet_num": row[0],
                        "pcb_sn": row[1],
                        "prod_desc": row[2],
                        "id_status": row[3],
                        "status_desc": row[4],
                        "user_desc": row[5],
                    })
                print(list_results)
                response_data = {
                    **response_data,
                    "data": {
                        "results": list_results,
                        "metadata": {
                            "pallet_num": pallet_num,
                            "prod_id": prod_id,
                            "count": result_count,
                            "conversion_prod_id": conversion_prod_id
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No units found in given pallet: " + pallet_num,
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def rollback_pallet_items(pallet_num, target_status, stb_num_list=[], reason="", convert_prod_id=-1, id_user=""):
    print(f'rollback_pallet_items requested {pallet_num}, {target_status}, {stb_num_list}, {reason}, {convert_prod_id}, {id_user}')
    global serverinstance
    current_time = get_current_time()
    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            update_sql = f'''UPDATE pe
                            SET pe.carton_num = NULL, pe.pallet_num = NULL, pe.id_customer_order_details = NULL, pe.id_customer_order = NULL, pe.weight = NULL, pe.id_status = {target_status}, pe.prod_id = {convert_prod_id}, pe.timestamp = N\'{current_time}\', pe.id_user = {id_user}
                            FROM stb_production.dbo.production_event pe
                            WHERE stb_num IN {tuple(stb_num_list)}'''
            print(f'[UPDATE-SQL] {update_sql}')
            response_data = {
                **response_data,
                "update_query": update_sql,
            }
            conn.autocommit = False
            update_count = cursor.execute(update_sql)
            print(f'[UPDATE-SQL-RESULTS] {update_count}')
            if (update_count):
                select_sql = f'''SELECT pe.pallet_num, pe.stb_num, p.prod_desc, pe.id_status, s.status_desc, u.user_desc, pe.prod_id FROM stb_production.dbo.production_event pe
                            INNER JOIN stb_production.dbo.[user] u ON u.id_user = pe.id_user
                            INNER JOIN stb_production.dbo.status s ON s.id_status = pe.id_status
                            INNER JOIN stb_production.dbo.product p ON p.prod_id = pe.prod_id
                            WHERE stb_num IN {tuple(stb_num_list)}'''
                print(f'[SELECT-SQL] {select_sql}')
                response_data = {
                    **response_data,
                    "select_query": select_sql,
                }
                conn.autocommit = False
                results = cursor.execute(select_sql).fetchall()
                print(f'[SELECT-SQL-RESULTS] {results}')
                result_count = len(results)
                if result_count > 0:
                    list_results = []
                    conversion_prod_id = []
                    prod_id = results[0][6]
                    if (prod_id in [94, 95, 96]):
                        conversion_prod_id = [94, 95, 96]
                    elif (prod_id in [97, 98, 99, 100, 101, 102, 103]):
                        conversion_prod_id = [97, 98, 99, 100, 101, 102, 103]
                    elif (prod_id in [105, 106, 107]):
                        conversion_prod_id = [105, 106, 107]
                    elif (prod_id in [108, 109, 110, 111, 112, 113, 114]):
                        conversion_prod_id = [108, 109, 110, 111, 112, 113, 114]

                    for row in results:
                        list_results.append({
                            "pallet_num": row[0],
                            "pcb_sn": row[1],
                            "prod_desc": row[2],
                            "id_status": row[3],
                            "status_desc": row[4],
                            "user_desc": row[5],
                        })
                    print(list_results)
                    response_data = {
                        **response_data,
                        "data": {
                            "results": list_results,
                            "metadata": {
                                "pallet_num": pallet_num,
                                "prod_id": prod_id,
                                "count": result_count,
                                "conversion_prod_id": conversion_prod_id
                            }
                        },
                        "message": "Pallet Rollback Done Successfully - " + pallet_num,
                        "status": CONST_SUCCESS,
                    }
            # response_data = {
            #     **response_data,
            #     "data": {
            #         "metadata": {
            #             "pallet_num": pallet_num,
            #         }
            #     },
            #     "message": "Pallet Rollback Done Successfully - " + pallet_num,
            #     "status": CONST_SUCCESS,
            # }

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
            if not update_count:
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": None
                    },
                    "message": "Could not rollback pallet: " + pallet_num,
                    "status": CONST_FAILURE,
                }
            return response_data


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
                # raise ValueError("record not found")
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
def get_all_prod_lines(deptDesc='Final Integration'):
    print(f'[GET-ALL-PROD-LINES] requested {deptDesc}')
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
            select_sql = '''SELECT 0 AS production_line,'PROD_LINE' AS line_desc ,'DEPARTMENT' AS dept_desc
                            UNION ALL
                            SELECT pl.id_production_line, pl.line_desc, d.dept_desc
                            FROM production_line AS pl
                            INNER JOIN department AS d ON pl.id_department = d.id_department
                            WHERE        (pl.id_status = 4) AND d.dept_desc = 'Final Integration' ORDER BY dept_desc, line_desc'''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) > 0:
                prod_lines = []
                for row in results:
                    print(row)
                    prod_lines.append({"production_line": row[0], "line_desc": row[1], "dept_desc": row[2]})

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "prod_lines": prod_lines,
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
                # raise ValueError("record not found")
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
def get_device_info(pcb_sn):
    print('[GET-DEVICE-INFO] requested ', pcb_sn)
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            storedProc = '''EXEC sp_RPT_GetDeviceInfo @serialNum  = ?'''
            params = (pcb_sn)
            print(f'[SELECT-SQL] {storedProc} {pcb_sn}')
            response_data = {
                **response_data,
                "select_query": storedProc,
            }
            conn.autocommit = False
            results = cursor.execute(storedProc, params).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) == 1:
                device_info = []
                for row in results:
                    print(row)
                    device_info.append({
                        "Pcb_Num": row[0],
                        "STB_Num": row[1],
                        "Status": row[2],
                        "Smartcard": row[3],
                        "Carton": row[4],
                        "Pallet": row[5],
                        "CAS_ID": row[6],
                        "IUC_Serial": row[7],
                        "Custom_String_1": row[8],
                        "Custom_String_2": row[9],
                        "Custom_String_3": row[10],
                        "Custom_String_4": row[11],
                        "Custom_String_5": row[12],
                        "Status_Description": row[13],
                        "Product_Description": row[14],
                    })

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "device_info": device_info[0]
                        },
                    },
                    "message": "Device Info Retrieved",
                    "status": CONST_SUCCESS,
                }
            elif len(results) == 0:
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "pcb_sn": pcb_sn,
                            "device_info": {}
                        },
                    },
                    "message": "Device Info Not Found",
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
            print(response_data)
            if len(results) == 0:
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "device not found",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def generate_stb_num(pcb_sn):
    print('[GENERATE-STB-NUM] requested ', pcb_sn)
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            storedProc = '''EXEC sp_UPD_GenerateStbNum @pcbNum  = ?'''
            params = (pcb_sn)
            print(f'[SELECT-SQL] {storedProc} {pcb_sn}')
            response_data = {
                **response_data,
                "select_query": storedProc,
            }
            conn.autocommit = False
            results = cursor.execute(storedProc, params).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) == 1:
                ret = []
                for row in results:
                    print(row)
                    ret.append({
                        "ErrorMessage": row[0]
                    })

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "ErrorMessage": ret[0]["ErrorMessage"]
                        },
                    },
                    "message": "Product Info Retrieved",
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Products Found with PCB/SN",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def update_mechanical(pcb_sn, fPanel="", PSU="", RS232="", prodLine="", userDesc="", material="", genericVariant=False, prodDesc=""):
    print(f'[UPDATE-MECHANICAL] requested {pcb_sn} {fPanel} {PSU} {RS232} {prodLine} {userDesc} {material} {genericVariant} {prodDesc}')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            storedProc = '''EXEC spLocal_UPDUpdateMechanical @pcbNum  = ?, @fPanel  = ?, @PSU  = ?, @RS232  = ?, @prodLine  = ?, @userDesc  = ?, @material  = ?, @genericVariant  = ?, @prodDesc  = ?'''
            params = (pcb_sn, fPanel, PSU, RS232, prodLine, userDesc, material, genericVariant, prodDesc)
            print(f'[SELECT-SQL] {storedProc} {pcb_sn}')
            response_data = {
                **response_data,
                "select_query": storedProc,
            }
            conn.autocommit = False
            results = cursor.execute(storedProc, params).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) == 1:
                ret = []
                for row in results:
                    print(row)
                    ret.append({
                        "ErrorMessage": row[0]
                    })

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "ErrorMessage": f'{ret[0]["ErrorMessage"]} [{pcb_sn}]'
                        },
                    },
                    "message": "Product Info Retrieved",
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Products Found with PCB/SN",
                    "status": CONST_FAILURE,
                }
            return response_data


# PRINTER_NAME = 'ZDesigner ZT230-200dpi ZPL'
# ZEBRA.setqueue(PRINTER_NAME)


@eel.expose
def process_streama_mechanical(pcb_sn, printer_name='', production_line='', user_desc=''):
    print(f'[PROCESS-STREAMA-MECHANICAL] requested {pcb_sn} {printer_name} {production_line} {user_desc}')
    global serverinstance

    state_common = {}

    ZEBRA.setqueue(printer_name)

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
        },
        "message": f'Default Message: pcb_sn: [{pcb_sn}]',
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        # cursor = serverinstance.cursor
        # conn = serverinstance.conn
        try:
            # Wrapper for all sub-methods for processing streama mechanical
            allowed_target_status = [85, 45, 47]
            device = get_device_info(pcb_sn)
            # print(device)
            if device["status"] == CONST_SUCCESS:
                # TODO: Handle StoredProcedure's failure codes also
                state_common = {
                    **state_common,
                    **device["data"]["metadata"]
                }
                id_status = state_common["device_info"]["Status"]
                if id_status in allowed_target_status:
                    sleeptime = round(random.uniform(0.1, 0.9), 3)
                    print("sleeping for:", sleeptime, "seconds")
                    sleep(sleeptime)
                    print("sleeping is over")
                    gen_sn = generate_stb_num(pcb_sn)
                    print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
                    print(gen_sn)
                    if gen_sn["data"]["metadata"]["ErrorMessage"].startswith(CONST_SUCCESS):
                        print(f'############################## {gen_sn["data"]["metadata"]["ErrorMessage"]}')
                        device = get_device_info(pcb_sn)
                        if device["status"] == CONST_SUCCESS:
                            # TODO: Handle StoredProcedure's failure codes also
                            state_common = {
                                **state_common,
                                **device["data"]["metadata"]
                            }
                            # =============== NOW WE HAVE THE STB NUMBER, WITH PCB =====================
                            # DONE_TODO: Update SQL07 MES System for binding STB Number
                            # 1. CSN
                            csn_ret = mes_update_WIPData(pcb_sn, state_common["device_info"]["STB_Num"], 'CSN')
                            print(csn_ret)
                            # 2. MAC
                            mac_ret = mes_update_WIPData(pcb_sn, state_common["device_info"]["Custom_String_1"], 'MAC')
                            print(mac_ret)
                            # 3 mes_update_WIP
                            wip_ret = mes_update_WIP(pcb_sn, state_common["device_info"]["STB_Num"])
                            print(wip_ret)
                            # PRINT THE VALUES
                            # =============== PRINT =====================
                            varDict = {
                                'STB_NUM': state_common["device_info"]["STB_Num"],
                                'ETHERNET_MAC': state_common["device_info"]["Custom_String_1"]
                            }

                            # TODO: 1. Printer Name, 2. Get Real Template From Database
                            print('>>> ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp')
                            printer_resp = printer_wrapper(varDict, 'streama_mechanical_template.txt')
                            print('<<< ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp')
                            if printer_resp["status"] == CONST_FAILURE:
                                print("Printing Failed")
                                response_data = {
                                    **response_data,
                                    "data": {
                                        "metadata": state_common,
                                    },
                                    "message": printer_resp["message"],
                                    "status": CONST_FAILURE,
                                }
                            else:
                                print("Printing Successful")
                                # print(f'[UPDATE-MECHANICAL] requested {pcb_sn} {fPanel} {PSU} {RS232} {prodLine} {userDesc} {material} {genericVariant} {prodDesc}')
                                mech_status = update_mechanical(pcb_sn, '', '', '', production_line, user_desc, '', False, '')
                                print(mech_status)
                                mech_message = mech_status["data"]["metadata"]["ErrorMessage"]
                                if mech_message.startswith(CONST_SUCCESS):
                                    response_data = {
                                        **response_data,
                                        "data": {
                                            "metadata": state_common,
                                        },
                                        "message": f'''{mech_message}''',
                                        "status": CONST_SUCCESS,
                                    }
                                else:
                                    response_data = {
                                        **response_data,
                                        "data": {
                                            "metadata": state_common,
                                        },
                                        "message": f'''ERROR, {mech_message}''',
                                        "status": CONST_FAILURE,
                                    }

                    else:
                        response_data = {
                            **response_data,
                            "data": {
                                "metadata": state_common,
                            },
                            "message": f'''{gen_sn["data"]["metadata"]["ErrorMessage"]}''',
                            "status": CONST_FAILURE,
                        }
                else:
                    # TODO: Set proper failure message that status is not allowed
                    response_data = {
                        **response_data,
                        "data": {
                            "metadata": state_common,
                        },
                        "message": f'''PCB: {pcb_sn} IS IN NOT ALLOWED STATUS {status_desc_for_id_status[id_status]}, ALLOWED {','.join(map(lambda id_status: status_desc_for_id_status[id_status], allowed_target_status))}''',
                        "status": CONST_FAILURE,
                    }
                    pass
            else:
                # print(device["message"])
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {},
                    },
                    "message": f'''ERROR,PCB: [{pcb_sn}] {device["message"]}''',
                    "status": CONST_FAILURE,
                }
        except Exception as e:
            print(
                f'[ERROR: Exception - {str(e)}, will skip this invalid cell value')
            raise e
        else:
            pass
            # cursor.commit()
        finally:
            # conn.autocommit = True
            print(response_data)
            # if len(results) == 0:
            #     # raise ValueError("record not found")
            #     response_data = {
            #         **response_data,
            #         "data": {
            #             "metadata": results,
            #         },
            #         "message": "No Products Found with PCB/SN",
            #         "status": CONST_FAILURE,
            #     }
            return response_data


def printer_wrapper(v, template_file):
    print(f'printer_wrapper requested {v} {template_file}')
    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "variables": v,
                "template_file": template_file
            },
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }
    try:
        with open('./' + template_file, 'r') as fh:
            t = replace_prn_variables(
                ''.join(c for c in fh.read() if ord(c) < 128), v)
            # print t
            send_prn(t)
            response_data = {
                **response_data,
                "message": "Print was successful",
                "status": CONST_SUCCESS
            }
    except MissingVariableException as e:
        print(f'Some variables specified in the PRN text are not supplied in the {template_file} file.')
        print(f'These variables are not supplied: {e[0].sort()}')
        print('\n'.join(e[0]))
        response_data = {
            **response_data,
            "message": "Error: MissingVariableException",
            "status": CONST_FAILURE
        }
    except Exception as e:
        print(str(e))
        response_data = {
            **response_data,
            "message": str(e),
            "status": CONST_FAILURE
        }
    return response_data


@eel.expose
def test_print(printer_name=''):
    print(f'[TEST_PRINT] requested {printer_name}')
    ZEBRA.setqueue(printer_name)
    varDict = {
        'STB_NUM': "MD88888888",
        'ETHERNET_MAC': "EFEFEFEFEFEF"
    }

    sleeptime = round(random.uniform(0.1, 0.9), 3)
    print("sleeping for:", sleeptime, "seconds")
    sleep(sleeptime)
    print("sleeping is over")
    # TODO: 1. Printer Name, 2. Get Real Template From Database
    print('>>> ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp')
    response_data = printer_wrapper(varDict, 'streama_mechanical_template.txt')
    print('<<< ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp')
    return response_data


@eel.expose
def get_product_info(pcb_sn):
    print('[GET-PRODUCT-INFO] requested ', pcb_sn)
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            select_sql = f'''SELECT pe.prod_id, p.prod_desc
                            FROM stb_production.dbo.production_event pe
                            INNER JOIN stb_production.dbo.product p ON p.prod_id = pe.prod_id
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
                prod_list = []
                for row in results:
                    print(row)
                    prod_list.append({"prod_id": row[0], "prod_desc": row[1]})

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "prod_id": row[0],
                            "prod_desc": row[1]
                        },
                    },
                    "message": "Product Info Retrieved",
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Products Found with PCB/SN",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def get_pcb_report(pcb_sn):
    print('[GET-PCB-REPORT] requested ', pcb_sn)
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        results = []
        pyodbcError = False
        try:
            select_sql = f'''DECLARE @pcb_num VARCHAR(50),
            @stb_num VARCHAR(50),
            @ord_sn_range VARCHAR(50),
            @value_min VARCHAR(50),
            @value_max VARCHAR(50),
            @pcb_timestamp DATETIME,
            @snrange_timestamp DATETIME,
            @crf_timestamp DATETIME
            SELECT @pcb_num = pe.pcb_num,
                @stb_num = pe.stb_num
                FROM stb_production.dbo.production_event pe WHERE pe.pcb_num = \'{pcb_sn}\' OR pe.stb_num = \'{pcb_sn}\'
            SET @pcb_timestamp = (SELECT TOP 1 ped.[timestamp] FROM stb_production.dbo.production_event_details ped WHERE id_status = 7 AND (ped.pcb_num = @pcb_num OR ped.stb_num = @pcb_num))
            SET @snrange_timestamp = (SELECT TOP 1 ped.[timestamp] FROM stb_production.dbo.production_event_details ped WHERE id_status = 13 AND (ped.pcb_num = @pcb_num OR ped.stb_num = @pcb_num))
            SET @crf_timestamp = (SELECT TOP 1 ped.[timestamp] FROM stb_production.dbo.production_event_details ped WHERE id_status = 35 AND (ped.pcb_num = @pcb_num OR ped.stb_num = @pcb_num))
            SELECT @ord_sn_range = SUBSTRING(data_value, 1, 6), @value_min = SUBSTRING(data_value, 7, 10), @value_max = SUBSTRING(data_value, 17, 10) FROM   stb_production.dbo.production_data
            WHERE (data_name = 'order_stb_range') and @stb_num BETWEEN SUBSTRING(data_value, 7, 10) AND SUBSTRING(data_value, 17, 10)
            SELECT pe.pcb_num AS [PCB NUM], pe.stb_num AS [STB NUM], SUBSTRING(pe.pcb_num,1,6) AS [PCB WAS FOR], @pcb_timestamp AS [PCB PRNIT TIMESTAMP],
                @ord_sn_range AS [SN RANGE FROM],  @value_min AS [SN_MIN],  @value_max AS [SN_MAX], @snrange_timestamp AS [PCBA TIMESTAMP],
                SUBSTRING(co.cus_ord,12,6) AS [SENT TO CUSTOMER ORD], @crf_timestamp AS [DISPATH TIMESTAMP],
                cod.inv_num AS [INVOICE], co.cus_ord AS [FULL CO] FROM stb_production.dbo.production_event pe
            LEFT JOIN stb_production.dbo.customer_order co ON co.id_customer_order = pe.id_customer_order
            LEFT JOIN stb_production.dbo.customer_order_details cod ON cod.id_customer_order_details = pe.id_customer_order_details
            WHERE pe.pcb_num = @pcb_num OR pe.stb_num = @pcb_num'''

            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "pcb_sn": pcb_sn,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}, LENGTH: {len(results)}')

            if len(results) == 1:
                row = results[0]
                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "pcb_num": row[0],
                            "stb_num": row[1],
                            "pcb_for": row[2],
                            "pcb_ts": str(row[3]),
                            "sn_from": row[4],
                            "sn_min": row[5],
                            "sn_max": row[6],
                            "pcba_tp": str(row[7]),
                            "cus_ord": row[8],
                            "dispatch_ts": str(row[9]),
                            "invoice": row[10],
                            "cus_ord_full": row[11],
                        },
                    },
                    "message": "PCB Info Retrieved",
                    "status": CONST_SUCCESS,
                }

        except (pyodbc.DatabaseError, pyodbc.OperationalError, pyodbc.ProgrammingError) as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            pyodbcError = True
        except UnboundLocalError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            print(response_data)
            if (pyodbcError):
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": None,
                    },
                    "message": "Connection got interrupted or server is down, Please try reconnecting",
                    "status": CONST_FAILURE,
                }
            elif len(results) == 0:
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Product Found with PCB/SN",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def get_order_items(ord, opt_list):
    print(f'[GET-ORDER-ITEMS] requested {ord} with opt list {opt_list}')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    merged_options = ()
    for opt in opt_list:
        merged_options += report_status_mapping[opt]
    merged_options = tuple(set(merged_options))

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        results = []
        pyodbcError = False
        try:
            select_sql = f'''SELECT id_production_data, data_value FROM production_data WHERE data_value LIKE \'{ord}%\''''

            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "ord": ord,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            # print(f'[SELECT-SQL-RESULTS] {results}, LENGTH: {len(results)}')

            africa_orders = {}
            africa_orders[ord] = {}
            for row in results:
                # print(row)
                delim = 'S'
                id_prod_data = row[0]
                _, start, end = row[1].split(delim, 3)
                print(f'[{id_prod_data}] order: {ord} start: {delim + start} end: {delim + end}', end='''\n''')
                if ord in africa_orders:
                    africa_orders[ord] = {
                        **africa_orders[ord],
                        id_prod_data: {'start': delim + start, 'end': delim + end}
                    }
                else:
                    africa_orders[ord] = {
                        id_prod_data: {'start': delim + start, 'end': delim + end}
                    }
            # Find all ranges count
            total_qty_choice = 0
            total_qty_produced = 0
            total_qty_target = 0
            total_qty_blacklisted = 0
            total_qty_scrapped = 0
            for id_prod_data in africa_orders[ord].keys():
                # print(id_prod_data)
                # print(f'{ord}_{id_prod_data}')
                # qty_target = int(africa_orders[id_prod_data]['end'][1:]) - int(africa_orders[id_prod_data]['start'][1:])
                qty_target = int(africa_orders[ord][id_prod_data]['end'][1:]) - int(africa_orders[ord][id_prod_data]['start'][1:])
                # print(f'OrderNo: {ord}_{id_prod_data} Qty: {qty_target}')
                africa_orders[ord][id_prod_data]['qty_target'] = qty_target

            # Order Wise Missing Qty
            # print('==== ORDER WISE MISSING QTY ====')
            columns = ['pe.pcb_num', 'prod.prod_desc', 'pe.id_production_order', 'pe.id_status', 'pe.timestamp', 'pe.stb_num', 's.status_desc', 'u.user_desc']
            # status_print_cols = ['pcb_num', 'stb_num', 'id_status', 'timestamp', 'id_user']
            # status_print_cols = ['pcb_num', 'prod_desc', 'id_production_order', 'id_status', 'timestamp', 'stb_num']
            # print(','.join(columns))
            # print(f'africa_orders[ord].keys(): {africa_orders[ord].keys()}')
            for id_prod_data in africa_orders[ord].keys():
                # print(f'africa_orders: {africa_orders}')
                items = []
                select_sql = ''
                if 'TOTAL' in opt_list:
                    select_sql = f'''SELECT {','.join(columns)}  FROM production_event pe
                    INNER JOIN product prod ON pe.prod_id = prod.prod_id
                    LEFT JOIN status s ON s.id_status = pe.id_status
                    LEFT JOIN [user] u ON u.id_user = pe.id_user
                    WHERE pe.stb_num BETWEEN \'{africa_orders[ord][id_prod_data]['start']}\' AND \'{africa_orders[ord][id_prod_data]['end']}\'
                    ORDER BY pe.stb_num
                    '''
                else:
                    select_sql = f'''SELECT {','.join(columns)}  FROM production_event pe
                    INNER JOIN product prod ON pe.prod_id = prod.prod_id
                    LEFT JOIN status s ON s.id_status = pe.id_status
                    LEFT JOIN [user] u ON u.id_user = pe.id_user
                    WHERE pe.stb_num BETWEEN \'{africa_orders[ord][id_prod_data]['start']}\' AND \'{africa_orders[ord][id_prod_data]['end']}\' AND pe.id_status IN ({','.join(map(lambda status: str(status), merged_options))})
                    ORDER BY pe.stb_num
                    '''

                print(select_sql)
                response_data = {
                    **response_data,
                    "select_query": select_sql,
                    "status": CONST_FAILURE
                }
                for row in cursor.execute(select_sql):
                    # print(row)  # returns a tuple
                    items.append(dict(zip(columns, row)))
                    # print(items)
                    processed_items = []
                    index = 0
                    for item in items:
                        index = index + 1
                        processed_items.append({
                            **item,
                            'index': index,
                            'pe.timestamp': str(item['pe.timestamp']).split('.')[0],
                        })
                    items = processed_items
                    # break

                # USE THIS TO GET ALL PRODUCED STB SN
                # for row in cursor.execute(f'''SELECT pcb_num, prod_id, id_production_order, id_status, id_status, timestamp,stb_num FROM production_event
                # select_sql = f'''SELECT COUNT(id_production_event) FROM production_event
                #     WHERE stb_num BETWEEN \'{africa_orders[ord][id_prod_data]['start']}\' AND \'{africa_orders[ord][id_prod_data]['end']}\' AND id_status IN ({left_factory_status_str})'''
                # print(select_sql)
                # response_data = {
                #     **response_data,
                #     "select_query": select_sql,
                #     "status": CONST_FAILURE
                # }
                # for row in cursor.execute(select_sql):
                #     if(row):
                #         africa_orders[ord][id_prod_data]['qty_choice'] = row[0]
                    # break
                # for row in cursor.execute(f'''SELECT pcb_num, prod_id, id_production_order, id_status, id_status, timestamp,stb_num FROM production_event
                select_sql = f'''SELECT COUNT(id_production_event) FROM production_event
                    WHERE stb_num BETWEEN \'{africa_orders[ord][id_prod_data]['start']}\' AND \'{africa_orders[ord][id_prod_data]['end']}\' AND id_status IN ({blacklisted_str})'''
                print(select_sql)
                response_data = {
                    **response_data,
                    "select_query": select_sql,
                    "status": CONST_FAILURE
                }
                for row in cursor.execute(select_sql):
                    if(row):
                        africa_orders[ord][id_prod_data]['blacklisted'] = row[0]
                        total_qty_blacklisted = total_qty_blacklisted + row[0]
                    # break
                select_sql = f'''SELECT COUNT(id_production_event) FROM production_event
                    WHERE stb_num BETWEEN \'{africa_orders[ord][id_prod_data]['start']}\' AND \'{africa_orders[ord][id_prod_data]['end']}\' AND id_status IN ({scrapped_str})'''
                print(select_sql)
                response_data = {
                    **response_data,
                    "select_query": select_sql,
                    "status": CONST_FAILURE
                }
                for row in cursor.execute(select_sql):
                    if(row):
                        africa_orders[ord][id_prod_data]['scrapped'] = row[0]
                        total_qty_scrapped = total_qty_scrapped + row[0]
                    # break
                # for row in cursor.execute(f'''SELECT pcb_num, prod_id, id_production_order, id_status, id_status, timestamp,stb_num FROM production_event
                select_sql = f'''SELECT COUNT(id_production_event) FROM production_event
                    WHERE stb_num BETWEEN \'{africa_orders[ord][id_prod_data]['start']}\' AND \'{africa_orders[ord][id_prod_data]['end']}\''''
                print(select_sql)
                response_data = {
                    **response_data,
                    "select_query": select_sql,
                    "status": CONST_FAILURE
                }
                for row in cursor.execute(select_sql):
                    if(row):
                        africa_orders[ord][id_prod_data]['qty_produced'] = row[0]
                        total_qty_produced = total_qty_produced + row[0]
                    # break

                # missing = africa_orders[k]['missing']
                qty_choice = len(items)
                total_qty_choice = total_qty_choice + qty_choice
                # qty_produced = africa_orders[ord][id_prod_data]['qty_produced']
                africa_orders[ord][id_prod_data]['qty_choice'] = qty_choice
                qty_target = africa_orders[ord][id_prod_data]['qty_target']
                blacklisted = africa_orders[ord][id_prod_data]['blacklisted']
                scrapped = africa_orders[ord][id_prod_data]['scrapped']
                africa_orders[ord][id_prod_data]['items'] = items
                total_qty_produced = total_qty_produced - blacklisted - scrapped
                total_qty_target = total_qty_target + qty_target - blacklisted - scrapped

                print(f'{ord}_{id_prod_data} qty_choice: {qty_choice} qty_choice: {qty_choice} qty_target: {qty_target} total_qty_produced: {total_qty_produced} blacklisted: {blacklisted} scrapped: {scrapped}')

            print(f'[TOTAL] {ord} total_qty_choice: {total_qty_choice} total_qty_target: {total_qty_target} total_qty_produced: {total_qty_produced} total_qty_blacklisted: {total_qty_blacklisted} total_qty_scrapped: {total_qty_scrapped}')
            response_data = {
                **response_data,
                "data": {
                    "metadata": {
                        "order_data": africa_orders[ord],
                        "total_qty_choice": total_qty_choice,
                        "total_qty_target": total_qty_target,
                        "total_qty_produced": total_qty_produced,
                        "total_qty_scrapped": total_qty_scrapped,
                        "total_qty_blacklisted": total_qty_blacklisted
                    },
                },
                "message": "Successfully Retrieved Data",
                "status": CONST_SUCCESS
            }
        except (pyodbc.DatabaseError, pyodbc.OperationalError, pyodbc.ProgrammingError) as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            pyodbcError = True
        except (UnboundLocalError, KeyError, ValueError) as ke:
            print(
                f'[ERROR: {ke.__str__} - {ke.args}, will skip this invalid cell value')
            raise ke
        except Exception as e:
            print(
                f'[ERROR: {{e.__str__}} - {e.args}, will skip this invalid cell value')
            raise e
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            # print(response_data)
            if (pyodbcError):
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": None,
                    },
                    "message": "Server Error, Please retry or contact developer",
                    "status": CONST_FAILURE,
                }
            elif len(results) == 0:
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Product Found with PCB/SN",
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
            "metadata": {
                "current_status": INSTANT_STATUS_ID,
                "target_status": INSTANT_STATUS_ID,
            },
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
            if (table == "production_data"):
                select_sql = f'''SELECT pd.data_name, pd.data_value FROM stb_production.dbo.production_data pd
                                WHERE prod_id = {prod_id} and data_name = \'{param_name}\''''
            if (table == "test_parameter"):
                target_prod_id = None
                if (prod_id in [94, 95, 96]):
                    target_prod_id = 94
                elif (prod_id in [97, 98, 99, 100, 101, 102, 103]):
                    target_prod_id = 97
                elif (prod_id in [105, 106, 107]):
                    target_prod_id = 105
                elif (prod_id in [108, 109, 110, 111, 112, 113, 114]):
                    target_prod_id = 108
                else:
                    target_prod_id = prod_id
                select_sql = f'''SELECT tp.parameter, tp.value FROM stb_production.dbo.test_parameter tp WHERE prod_id = {target_prod_id} and parameter = \'{key}\''''
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
                print(f'Results parameter: {cp_desc} value: {cd_data}')
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No matching paramters were found",
                    "status": CONST_FAILURE,
                }
            return response_data


# FEATURE: Order Serial Config
@eel.expose
def get_id_by_serial_number_ranges(prod_id= -1, ord_num= '', ord_start= '', ord_end=''):
    print(f'[GET-PROD-DATA-BY-ID] requested prod_id: {prod_id}')
    global serverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": None,
        },
        "message": "FAILED: get_id_by_serial_number_ranges",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + 'Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        try:
            select_sql = f'''SELECT id_serial_number_range  FROM stb_production.dbo.serial_number_range
                            WHERE prod_id={prod_id} AND ord_num=N\'{ord_num}\' AND ord_start=N\'{ord_start}\' AND ord_end=N\'{ord_end}\'
                            '''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = []
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) == 1:
                id_serial_number_range = 0
                for row in results:
                    print(row)
                    id_serial_number_range = row[0]

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "id_serial_number_range": id_serial_number_range,
                        },
                    },
                    "message": "Production Data for Product",
                    "status": CONST_SUCCESS,
                }
            else:
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "results": results,
                        },
                    },
                    "message": "Required single entry",
                    "status": CONST_FAILURE,
                }

        except pyodbc.DatabaseError as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            results = []
            raise e
        except pyodbc.ProgrammingError as pe:
            cursor.rollback()
            print(
                f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
            results = []
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "Production Data Found",
                    "status": CONST_FAILURE,
                }
            return response_data

# FEATURE: Order Serial Config
@eel.expose
def get_prod_data_by_id(prod_id=-1):
    # CAUTION: This function will not through error, on list is blank, it will result an empty list.
    print(f'[GET-PROD-DATA-BY-ID] requested prod_id: {prod_id}')
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
            select_sql = f'''
                            SELECT snr.prod_id, snr.ord_num, pd.data_value, snr.ord_start, snr.ord_end, snr.range_qty, snr.consumed_qty, pd.priority, pd.id_status, snr.id_serial_number_range  FROM stb_production.dbo.production_data pd
                            INNER JOIN stb_production.dbo.serial_number_range snr ON snr.id_serial_number_range = pd.id_serial_number_range
                            WHERE pd.prod_id={prod_id} and pd.data_name = \'order_stb_range\'
                            ORDER BY pd.priority;
                            '''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) > 0:
                prod_data_list = []
                for row in results:
                    print(row)
                    prod_data_list.append({"prod_id": row[0], "ord_num": row[1], "data_value": row[2], "ord_start": row[3], "ord_end": row[4], "range_qty": row[5], "consumed_qty": row[6], "priority": row[7], "id_status": row[8], "id_serial_number_range": row[9]})

                print("#######################################")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "prod_data": prod_data_list,
                        },
                    },
                    "message": "Production Data for Product",
                    "status": CONST_SUCCESS,
                }
            else:
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": {
                            "prod_data": [],
                            "results": results,
                        },
                    },
                    "message": "Production Data Unavailable for Product: " + str(prod_id),
                    "status": CONST_SUCCESS,
                }

        except pyodbc.DatabaseError as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            results = []
            raise e
        except pyodbc.ProgrammingError as pe:
            cursor.rollback()
            print(
                f'[ERROR: pyodbc.ProgrammingError - {pe.args}, will skip this invalid cell value')
            results = []
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
            # if len(results) == 0:
            #     # raise ValueError("record not found")
            #     response_data = {
            #         **response_data,
            #         "data": {
            #             "metadata": results,
            #         },
            #         "message": "Production Data Found",
            #         "status": CONST_FAILURE,
            #     }
            return response_data

@eel.expose
def set_prod_data_priority(data_value, p):
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
                if (table == "production_data"):
                    update_sql = f'''UPDATE pd
                                    SET pd.data_value = \'{param_value}\'
                                    FROM stb_production.dbo.production_data pd
                                    WHERE prod_id = {prod_id} and data_name = \'{param_name}\''''
                if (table == "test_parameter"):
                    target_prod_id = None
                    if (prod_id in [94, 95, 96]):
                        target_prod_id = 94
                    elif (prod_id in [97, 98, 99, 100, 101, 102, 103]):
                        target_prod_id = 97
                    elif (prod_id in [105, 106, 107]):
                        target_prod_id = 105
                    elif (prod_id in [108, 109, 110, 111, 112, 113, 114]):
                        target_prod_id = 108
                    else:
                        target_prod_id = prod_id
                    update_sql = f'''UPDATE tp SET tp.value = \'{param_value}\' FROM stb_production.dbo.test_parameter tp WHERE prod_id = {target_prod_id} and parameter = \'{key}\''''
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
                if (table == "production_data"):
                    update_sql = f'''UPDATE pd
                                    SET pd.data_value = \'{param_value}\'
                                    FROM stb_production.dbo.production_data pd
                                    WHERE prod_id = {prod_id} and data_name = \'{param_name}\''''
                if (table == "test_parameter"):
                    target_prod_id = None
                    if (prod_id in [94, 95, 96]):
                        target_prod_id = 94
                    elif (prod_id in [97, 98, 99, 100, 101, 102, 103]):
                        target_prod_id = 97
                    elif (prod_id in [105, 106, 107]):
                        target_prod_id = 105
                    elif (prod_id in [108, 109, 110, 111, 112, 113, 114]):
                        target_prod_id = 108
                    else:
                        target_prod_id = prod_id
                    update_sql = f'''UPDATE tp SET tp.value = \'{param_value}\' FROM stb_production.dbo.test_parameter tp WHERE prod_id = {target_prod_id} and parameter = \'{key}\''''
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


@eel.expose
def set_test_status_ott(sn, testname, user=52):
    print(f'[SET-TEST-STATUS-OTT] sn: {sn} test: {testname}')
    global serverinstance
    current_time = get_current_time()
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
                REQUIRED_STATUS_FOR_PCBA_TEST_PASSED = 16
                STATUS_PCBA_TEST_PASSED = 13
                REQUIRED_STATUS_WIRELESS_TEST_PASSED = 13
                STATUS_WIRELESS_TEST_PASSED = 86
                REQUIRED_STATUS_KEY_TEST_PASSED = 86
                STATUS_KEY_TEST_PASSED = 88
                REQUIRED_STATUS_CA_TEST_PASSED = 88
                STATUS_CA_TEST_PASSED = 18
                # interfacetest
                # wirelesstest
                # infocheck
                # factoryinspection

                # next_status = ""
                # for testname in tests:
                print(f'[TEST-NAME] {testname}')
                update_sql = ""
                pe_required_status = -1
                pe_update = -1
                if (testname == "interfacetest"):
                    pe_required_status = REQUIRED_STATUS_FOR_PCBA_TEST_PASSED
                    update_sql = f'''UPDATE stb_production.dbo.production_event
                                    SET id_status = {STATUS_PCBA_TEST_PASSED}, [timestamp] = N\'{current_time}\', id_user = {user}
                                    WHERE stb_num = N\'{sn}\' AND id_status = {pe_required_status}'''
                if (testname == "wirelesstest"):
                    pe_required_status = REQUIRED_STATUS_WIRELESS_TEST_PASSED
                    update_sql = f'''UPDATE stb_production.dbo.production_event
                                    SET id_status = {STATUS_WIRELESS_TEST_PASSED}, [timestamp] = N\'{current_time}\', id_user = {user}
                                    WHERE stb_num = N\'{sn}\' AND id_status = {pe_required_status}'''
                if (testname == "infocheck"):
                    pe_required_status = REQUIRED_STATUS_KEY_TEST_PASSED
                    update_sql = f'''UPDATE stb_production.dbo.production_event
                                    SET id_status = {STATUS_KEY_TEST_PASSED}, [timestamp] = N\'{current_time}\', id_user = {user}
                                    WHERE stb_num = N\'{sn}\' AND id_status = {pe_required_status}'''
                if (testname == "factoryinspection"):
                    pe_required_status = REQUIRED_STATUS_CA_TEST_PASSED
                    update_sql = f'''UPDATE stb_production.dbo.production_event
                                    SET id_status = {STATUS_CA_TEST_PASSED}, [timestamp] = N\'{current_time}\', id_user = {user}
                                    WHERE stb_num = N\'{sn}\' AND id_status = {pe_required_status}'''
                print(f'[{testname}][UPDATE-SQL] {update_sql}')
                response_data = {
                    **response_data,
                    "update_query_" + testname: update_sql,
                    "data": {"metadata": {
                        "stb_num": sn,
                        "status": testname,
                    }},
                }
                conn.autocommit = False
                pe_update = cursor.execute(update_sql)
                cursor.commit()
                conn.autocommit = True
                print(f'[UPDATE-SQL-PROD] {pe_update.rowcount}')

                # Find and update the target_status
                REQUIRED_STATUS_INTERFACE_TEST = 'NT'
                STATUS_INTERFACE_TEST = 'interfacetest'
                REQUIRED_STATUS_WIRELESS_TEST = 'interfacetest'
                STATUS_WIRELESS_TEST = 'wirelesstest'
                REQUIRED_STATUS_INFO_CHECK = 'wirelesstest'
                STATUS_INFO_CHECK = 'infocheck'
                REQUIRED_STATUS_FACTORY_INSPECTION = 'infocheck'
                STATUS_FACTORY_INSPECTION = 'factoryinspection'
                newdb_required_status = None
                newdb_update = -1
                if (pe_update.rowcount == 1):
                    # if (testname == "motherboardbinding"):
                    #     newdb_required_status = REQUIRED_STATUS_INTERFACE_TEST
                    #     update_sql = f'''UPDATE [NEWDB].[dbo].[SNRecord]
                    #                     SET Field28 = \'NT\', [LastEditDate] = N\'{current_time}\'
                    #                     WHERE SN = N\'{sn}\' AND Field28 = NULL'''
                    # WHERE SN = 'MD00055559' AND (Field28 IS NULL OR Field28 = 'NT')
                    if (testname == "interfacetest"):
                        newdb_required_status = REQUIRED_STATUS_INTERFACE_TEST
                        update_sql = f'''UPDATE [NEWDB].[dbo].[SNRecord]
                                        SET Field28 = \'{STATUS_INTERFACE_TEST}\', [LastEditDate] = N\'{current_time}\'
                                        WHERE SN = N\'{sn}\' AND (Field28 IS NULL OR Field28 = \'{newdb_required_status}\')'''
                    if (testname == "wirelesstest"):
                        newdb_required_status = REQUIRED_STATUS_WIRELESS_TEST
                        update_sql = f'''UPDATE [NEWDB].[dbo].[SNRecord]
                                        SET Field28 = \'{STATUS_WIRELESS_TEST}\', [LastEditDate] = N\'{current_time}\'
                                        WHERE SN = N\'{sn}\' AND Field28 = \'{newdb_required_status}\''''
                    if (testname == "infocheck"):
                        newdb_required_status = REQUIRED_STATUS_INFO_CHECK
                        update_sql = f'''UPDATE [NEWDB].[dbo].[SNRecord]
                                        SET Field28 = \'{STATUS_INFO_CHECK}\', [LastEditDate] = N\'{current_time}\'
                                        WHERE SN = N\'{sn}\' AND Field28 = \'{newdb_required_status}\''''
                    if (testname == "factoryinspection"):
                        newdb_required_status = REQUIRED_STATUS_FACTORY_INSPECTION
                        update_sql = f'''UPDATE [NEWDB].[dbo].[SNRecord]
                                        SET Field28 = \'{STATUS_FACTORY_INSPECTION}\', [LastEditDate] = N\'{current_time}\'
                                        WHERE SN = N\'{sn}\' AND Field28 = \'{newdb_required_status}\''''
                    conn.autocommit = False
                    newdb_update = cursor.execute(update_sql)
                    cursor.commit()
                    conn.autocommit = True
                    print(f'[UPDATE-SQL-NEWDB] {newdb_update.rowcount}')
                    if (newdb_update.rowcount == 0):
                        response_data = {
                            **response_data,
                            "message": f'''{sn} status {testname} could not be updated''',
                            "status": CONST_FAILURE,
                            "data": {"metadata": {
                                "stb_num": sn,
                                "status": testname,
                            }},
                        }
                    elif (newdb_update.rowcount == 1):
                        response_data = {
                            **response_data,
                            "message": f'''{sn} status {testname} updated''',
                            "status": CONST_SUCCESS,
                            "data": {"metadata": {
                                "stb_num": sn,
                                "status": testname,
                            }},
                        }
                if (pe_update.rowcount == 0):
                    response_data = {
                        **response_data,
                        "message": f'''{sn} status {testname} could not be updated''',
                        "status": CONST_FAILURE,
                        "data": {"metadata": {
                            "stb_num": sn,
                            "status": testname,
                        }},
                    }
                # print(f'[UPDATE-SQL-RESULTS] {vars('FAKE')}')
                # conn.autocommit = True

            except (pyodbc.DatabaseError, pyodbc.ProgrammingError) as e:
                print(
                    f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
                cursor.rollback()
                response_data = {
                    **response_data,
                    "error": e.args,
                    "message": f'''{sn} status {testname} could not be updated, check error''',
                    "status": CONST_FAILURE
                }
                raise e

            except KeyError as e:
                print(f"--7 {type(e).__name__ + ': ' + str(e)}")
                print(
                    f'[ERROR: eyError - {e.args}, will skip this invalid cell value')
                raise e
            else:
                print('[UPDATE-SQL-NO_ERROR]')
                cursor.commit()
                pass

            finally:
                conn.autocommit = True
                return response_data

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
        port=8888,
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


# -------------------------------------------------------------------------------------- SQL07
class MesServer:
    conn = None
    cursor = None

    def __init__(self, host="", driver="", database="", username="", password=""):
        # DEVELOPMENT CONFIG
        self.driver = "{ODBC Driver 17 for SQL Server}"
        self.database = "NEWDB"
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
            # connection_status = 'Server Already Connected'
        else:
            message += "stb_production instance is null"
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
                print(f'[MES] Connection established with server {self.server}')
                connection_status = CONST_SUCCESS
            else:
                print(f'[MES] Error: Server {self.server} could not be connected!')
                connection_status = connection_status + f"unable to establish {self.database} connection"

        except Exception as e:
            connection_status = connection_status + \
                type(e).__name__ + ': ' + str(e)
            print(
                f'[MES] Error: Server {self.server} could not be connected! \n {connection_status}')
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


messerverinstance = None


@eel.expose
def mes_connect_db(host="", driver="", database="", username="", password=""):
    """Returns connection status if connected, else connects to the production server"""
    print(
        f'[APP] requested connect_db driver={driver}, host={host}, database={database}, username={username}, password={password}')
    global messerverinstance
    if messerverinstance:
        return messerverinstance.getInstanceStatus()
    else:
        messerverinstance = Server(host)
        # messerverinstance = Server(driver, server, database, username, password)
        return messerverinstance.connect()
    # if(messerverinstance):
    #     return "Success"
    # else:
    #     return "Unable to connect"
    # pass


@eel.expose
def mes_disconnect_db():
    """Returns connection status if connected, else connects to the production server"""
    print('[APP] requested disconnect_db')
    global messerverinstance
    if messerverinstance:
        messerverinstance = messerverinstance.disconnect()
        messerverinstance = None
        return {"data": {"metadata": None}, "message": "Server Disonnected", "status": CONST_SUCCESS}
    else:
        return {"data": {"metadata": None}, "message": "FAILURE: No server instance available", "status": CONST_FAILURE}

    # if(messerverinstance):
    #     return "Success"
    # else:
    #     return "Unable to connect"
    # pass


@eel.expose
def mes_get_sn_status(pcb_sn, user=52):
    """Returns connection status if connected, else connects to the production server"""
    print(f'[APP] requested get_sn_status {pcb_sn} {user}')
    global messerverinstance

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "stb_num": None,
                "status": None
            },
        },
        "message": "NOT TESTED",
        "status": CONST_FAILURE
    }

    mes_status_dict = {
        152: "motherboardbinding",
        31: "interfacetest",
        34: "wirelesstest",
        36: "infocheck",
        146: "factoryinspection"
    }

    if not messerverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + ' Server not connected', "status": CONST_FAILURE}
    else:
        cursor = messerverinstance.cursor
        conn = messerverinstance.conn
        try:
            select_sql = f'''SELECT gsn,curprocessid, lastupdate
                            FROM SDTMESV2DIGITAL.dbo.MESProc_WIP
                            WHERE gsn  = \'{pcb_sn}\''''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) == 1:
                lTests = ['motherboardbinding', 'interfacetest', 'wirelesstest', 'infocheck', 'factoryinspection']
                for row in results:
                    print(row)
                    print("#######################################")
                    mes_status = mes_status_dict[row[1]]
                    stb_num = row[0]
                    print(f'mes_status: {mes_status} stb_num: {stb_num}')
                    for test in lTests:
                        set_test_status_ott(stb_num, test, user)
                        if (mes_status == test):
                            break

                    response_data = {
                        **response_data,
                        "data": {
                            "metadata": {
                                "stb_num": stb_num,
                                "status": mes_status,
                                "timestamp": row[2]
                            },
                        },
                        "message": "Product Info Retrieved",
                        "status": CONST_SUCCESS,
                    }

        except (pyodbc.DatabaseError, pyodbc.ProgrammingError) as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
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
                # raise ValueError("record not found")
                response_data = {
                    **response_data,
                    "data": {
                        "metadata": results,
                    },
                    "message": "No Products Found with PCB/SN",
                    "status": CONST_FAILURE,
                }
            return response_data


@eel.expose
def mes_update_WIPData(pcb_sn, data_value='', data_type=''):
    """Returns connection status if connected, else connects to the production server"""
    print(f'[MES-UPDATE-WIPData] {pcb_sn} {data_value} {data_type}')
    global messerverinstance

    current_time = get_current_time()

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "stb_num": None,
                "status": None
            },
        },
        "message": "NOT TESTED",
        "status": CONST_FAILURE
    }

    mes_status_dict = {
        152: "motherboardbinding",
        31: "interfacetest",
        34: "wirelesstest",
        36: "infocheck",
        146: "factoryinspection"
    }

    if not messerverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + ' Server not connected', "status": CONST_FAILURE}
    else:
        cursor = messerverinstance.cursor
        conn = messerverinstance.conn
        try:
            insert_sql = f'''INSERT INTO SDTMESV2DIGITAL.dbo.MESProc_WIPData
                            (productid, sntype, aliasname, datavalue, bindfuid, bindat, isunique, factory)
                            VALUES(N'FC011001', N\'{data_type}\', N\'{data_type}\', N\'{data_value}\', N\'{pcb_sn}\', N\'{current_time}\', 1, N'合权');
                            '''
            print(f'[INSERT-SQL] {insert_sql}')
            response_data = {
                **response_data,
                "insert_query": insert_sql,
            }
            # conn.autocommit = False
            # results = cursor.execute(select_sql).fetchall()
            # print(f'[SELECT-SQL-RESULTS] {results}')

            conn.autocommit = False
            wipdata_insert = cursor.execute(insert_sql)
            cursor.commit()
            conn.autocommit = True
            print(f'[INSERT-SQL-ROWCOUNT] {wipdata_insert.rowcount}')

            if (wipdata_insert.rowcount == 0):
                response_data = {
                    **response_data,
                    "message": f'''{pcb_sn} {data_type}: {data_value} could not be inserted''',
                    "status": CONST_FAILURE,
                    "data": {"metadata": {
                        "pcb_sn": pcb_sn,
                        data_type: data_type
                    }},
                }
            elif (wipdata_insert.rowcount == 1):
                response_data = {
                    **response_data,
                    "message": f'''{pcb_sn} {data_type}: {data_value} successfully inserted''',
                    "status": CONST_SUCCESS,
                    "data": {"metadata": {
                        "pcb_sn": pcb_sn,
                        data_type: data_type
                    }},
                }

        except (pyodbc.DatabaseError, pyodbc.ProgrammingError) as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except KeyError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            print(response_data)
            return response_data


@eel.expose
def mes_update_WIP(pcb_sn, gsn=''):
    """Returns connection status if connected, else connects to the production server"""
    print(f'[MES-UPDATE-WIP] {pcb_sn} {gsn}')
    global messerverinstance

    current_time = get_current_time()
    current_date = current_time[:10]

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "stb_num": None,
                "status": None
            },
        },
        "message": "NOT TESTED",
        "status": CONST_FAILURE
    }

    mes_status_dict = {
        152: "motherboardbinding",
        31: "interfacetest",
        34: "wirelesstest",
        36: "infocheck",
        146: "factoryinspection"
    }

    if not messerverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + ' Server not connected', "status": CONST_FAILURE}
    else:
        cursor = messerverinstance.cursor
        conn = messerverinstance.conn
        try:
            update_sql = f'''UPDATE SDTMESV2DIGITAL.dbo.MESProc_WIP
                                SET gsn=N\'{gsn}\',
                                martno=N'HPR0A',
                                state=15,
                                inputat=N\'{current_time}\',
                                outputat=NULL,
                                storageat=NULL,
                                deliveryat=NULL,
                                ngcode=NULL,
                                pono=N'310582',
                                sono=N'310582',
                                lineid=201,
                                factoryid=1,
                                curprocessid=152,
                                repairflag=0,
                                specialflag=-1,
                                parentfuid=NULL,
                                cartonno=NULL,
                                packat=NULL,
                                qabatchno=NULL,
                                productiontype=0,
                                reworkflag=0,
                                weighted=0,
                                weight=-1,
                                linecode=N'AL-01D',
                                pdate=N\'{current_date}\',
                                curprocess=N'bindingmainboard',
                                palletno=NULL,
                                palletat=NULL,
                                ngtimes=0,
                                repairedtimes=0,
                                inflag=0,
                                outflag=N'0         ',
                                lock=0,
                                lockdesc=NULL,
                                lasteditor=N'陈维南',
                                drepairflag=0,
                                lrepairflag=0,
                                intervalid=186,
                                factory=N'UEC',
                                checkflag=-1,
                                manualpass=0,
                                boxid=NULL,
                                oqcbarcomfirm=1,
                                checkstate=NULL,
                                lastupdate=N\'{current_time}\',
                                previousprocess=N'bindingmainboard',
                                previoustime=N\'{current_time}\'
                            WHERE fuid=N\'{pcb_sn}\';
                            '''
            print(f'[UPDATE-SQL] {update_sql}')
            response_data = {
                **response_data,
                "update_query": update_sql,
            }
            # conn.autocommit = False
            # results = cursor.execute(select_sql).fetchall()
            # print(f'[SELECT-SQL-RESULTS] {results}')

            conn.autocommit = False
            wipdata_insert = cursor.execute(update_sql)
            cursor.commit()
            conn.autocommit = True
            print(f'[INSERT-SQL-ROWCOUNT] {wipdata_insert.rowcount}')

            if (wipdata_insert.rowcount == 0):
                print(f'''{pcb_sn} SN: {gsn} could not be inserted''')
                response_data = {
                    **response_data,
                    "message": f'''{pcb_sn} SN: {gsn} could not be inserted''',
                    "status": CONST_FAILURE,
                    "data": {"metadata": {
                        "pcb_sn": pcb_sn,
                        "gsn": gsn
                    }},
                }
            elif (wipdata_insert.rowcount == 1):
                print(f'''{pcb_sn} SN: {gsn} successfully updated in MESProc_WIP''')
                response_data = {
                    **response_data,
                    "message": f'''{pcb_sn} SN: {gsn} successfully updated in MESProc_WIP''',
                    "status": CONST_SUCCESS,
                    "data": {"metadata": {
                        "pcb_sn": pcb_sn,
                        "gsn": gsn
                    }},
                }

        except (pyodbc.DatabaseError, pyodbc.ProgrammingError) as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except KeyError as ke:
            print(
                f'[ERROR: KeyError - {ke.args}, will skip this invalid cell value')
            raise ke
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            print('VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV')
            print(response_data)
            print('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
            return response_data


@eel.expose
def add_new_order_ranges(prod_id, prod_desc, ord_num, ord_start, ord_end='', range_qty = 0, full_len_sn_range=''):
    """Returns connection status if connected, else connects to the production server"""
    print(f'[ADD-NEW-ORDER-RANGES] {prod_id} {prod_desc} {ord_num} {ord_start} {ord_end} {range_qty} {full_len_sn_range}')
    global serverinstance

    current_time = get_current_time()

    response_data = {
        "function_name": inspect.currentframe().f_code.co_name,
        "data": {
            "metadata": {
                "prod_id": prod_id,
                "prod_desc": prod_desc,
                "ord_num": ord_num,
                "ord_start": ord_start,
                "ord_end": ord_end,
                "range_qty": range_qty,
                "full_len_sn_range": full_len_sn_range,
            },
        },
        "message": "Default Message",
        "status": CONST_FAILURE
    }

    if not serverinstance:
        return {"data": {"metadata": None}, "message": CONST_FAILURE + ' Server not connected', "status": CONST_FAILURE}
    else:
        cursor = serverinstance.cursor
        conn = serverinstance.conn
        try:
            select_sql = f'''
                        SELECT id_serial_number_range
                        FROM stb_production.dbo.serial_number_range
                        WHERE ord_num=N\'{ord_num}\' AND ord_start=N\'{ord_start}\' AND ord_end=N\'{ord_end}\'
            '''
            print(f'[SELECT-SQL] {select_sql}')
            response_data = {
                **response_data,
                "select_query": select_sql,
            }
            conn.autocommit = False
            results = cursor.execute(select_sql).fetchall()
            print(f'[SELECT-SQL-RESULTS] {results}')

            if len(results) > 0:
                response_data = {
                    **response_data,
                    "message": f'''{ord_num} Duplicate Order Range''',
                    "status": CONST_FAILURE,
                }
                raise Exception("Duplicate Order Range")

            snr_insert_sql = f'''INSERT INTO stb_production.dbo.serial_number_range
                                (prod_id, ord_num, ord_start, ord_end, range_qty, consumed_qty, entry_date, id_user)
                                VALUES({prod_id}, N\'{ord_num}\', N\'{ord_start}\', N\'{ord_end}\', {range_qty}, 0, \'{current_time}\', 117);
                                '''
            print(f'[INSERT-SQL] {snr_insert_sql}')
            response_data = {
                **response_data,
                "snr_insert_query": snr_insert_sql,
            }
            # conn.autocommit = False
            # results = cursor.execute(select_sql).fetchall()
            # print(f'[SELECT-SQL-RESULTS] {results}')

            conn.autocommit = False
            snr_insert = cursor.execute(snr_insert_sql)
            cursor.commit()
            conn.autocommit = True
            print(f'[INSERT-SQL-ROWCOUNT] {snr_insert.rowcount}')

            if (snr_insert.rowcount == 0):
                response_data = {
                    **response_data,
                    "message": f'''{ord_num} could not be inserted''',
                    "status": CONST_FAILURE,
                }
            elif (snr_insert.rowcount == 1):
                print('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
                verify_serial_range_added = get_id_by_serial_number_ranges(prod_id, ord_num, ord_start, ord_end)
                print(verify_serial_range_added)
                if verify_serial_range_added["status"] == CONST_SUCCESS:
                    print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
                    queried_prod_data_response = get_prod_data_by_id(prod_id)
                    print(queried_prod_data_response)
                    ord_priority = 1
                    ord_status = 4
                    data_value = full_len_sn_range
                    ref_snr = verify_serial_range_added["data"]["metadata"]["id_serial_number_range"]
                    prod_data_list = []
                    if queried_prod_data_response["status"] == CONST_SUCCESS:
                        print('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
                        try:
                            # TODO: Update the production data table with the new order range
                            if (len(queried_prod_data_response["data"]["metadata"]["prod_data"]) > 0):
                                prod_data_list = queried_prod_data_response["data"]["metadata"]["prod_data"]
                                if (len(prod_data_list) > 0):
                                    max_priority = prod_data_list[-1]["priority"]
                                    print(f'max_priority: {max_priority}')
                                    ord_priority = max_priority + 1
                                    ord_status = 5

                            print(f'[INSERTING-PROD-DATA] ref_snr {ref_snr} data_value {data_value} prod_data_list {prod_data_list} ord_priority {ord_priority} ord_status {ord_status}')
                            proddata_insert_sql = f'''INSERT INTO stb_production.dbo.production_data
                                (prod_id, data_name, data_value, data_description, priority, id_status, id_serial_number_range)
                                VALUES({prod_id}, N'order_stb_range', N\'{data_value}\', N'Skyworth internal order number and the STB range for the order number.', {ord_priority}, {ord_status}, {ref_snr});
                            '''

                            print(f'[INSERT-SQL] {proddata_insert_sql}')
                            response_data = {
                                **response_data,
                                "insert_query_production_data": proddata_insert_sql,
                            }

                            conn.autocommit = False
                            proddata_insert = cursor.execute(proddata_insert_sql)
                            cursor.commit()
                            conn.autocommit = True
                            print(f'[INSERT-SQL-ROWCOUNT] {proddata_insert.rowcount}')
                            response_data = {
                                **response_data,
                                "insert_query_production_data_count": proddata_insert.rowcount,
                            }
                            if (snr_insert.rowcount == 0):
                                response_data = {
                                    **response_data,
                                    "message": '''Failed to retreive production data info''',
                                    "status": CONST_FAILURE,
                                }
                            else:
                                print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
                                queried_prod_data_response = {}
                                queried_prod_data_response = get_prod_data_by_id(prod_id)
                                print(queried_prod_data_response)
                                response_data = {
                                    **response_data,
                                    "data": {
                                        **response_data["data"],
                                        "metadata": queried_prod_data_response["data"]["metadata"],
                                        "message": "Successfully added order range",
                                        "status": CONST_FAILURE,
                                    },
                                }
                        except Exception as e:
                            conn.autocommit = True
                            template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                            message = template.format(type(e).__name__, e.args)
                            print(f'[ERROR: {message}, will skip this invalid cell value')
                            response_data = {
                                **response_data,
                                "status": CONST_FAILURE,
                                "message": str(e),
                            }
                            raise e
                    else:
                        print('*********************************')
                        raise Exception("Product Data could not be queried")
                    print('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
                    response_data = {
                        **response_data,
                        "message": f'''{ord_num} successfully inserted''',
                        "status": CONST_SUCCESS,
                        "data": {
                            **response_data["data"],
                            "metadata": {
                                **response_data["data"]["metadata"],
                                **queried_prod_data_response["data"]["metadata"],
                            }
                        }
                    }
                else:
                    print('*********************************')
                    raise Exception("Serial Range not added")
                print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
                
                

        except (pyodbc.DatabaseError, pyodbc.ProgrammingError) as e:
            print(
                f'[ERROR: pyodbc.ProgrammingError - {e.args}, will skip this invalid cell value')
            cursor.rollback()
            raise e
        except Exception as e:
            print(
                f'[ERROR: {str(e)}, will skip this invalid cell value')
            raise e
        else:
            cursor.commit()
        finally:
            conn.autocommit = True
            print(response_data)
            return response_data


if __name__ == '__main__':
    import sys

    # Pass any second argument to enable debugging
    print(f'{sys.argv}')
    start_eel(develop=len(sys.argv) == 2)
