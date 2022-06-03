import React, { useCallback, useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import swal from "@sweetalert/with-react";
import ActionButtons from "../ActionButtons";
import { title } from "process";

import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { green, red } from '@material-ui/core/colors';

const choices = ['YES', 'NO'];
const useStyles = makeStyles({
  yes_btn: {
    backgroundColor: green[100],
    color: green[600],
  },
  no_btn: {
    backgroundColor: red[100],
    color: red[600],
  },
  dialog_actions: {
      display: `flex`,
      justifyContent: `space-between`
  }
});

function SimpleDialog(props) {
    const classes = useStyles();
    const { onClose, selectedValue, open } = props;
  
    const handleClose = () => {
        console.log('handleClose called.')
        onClose(selectedValue);
    };
  
    const handleSubmitChoice = (value) => {
        console.log(value + ' selected')
        onClose(value);
    };
  
    return (
        <Dialog
            onClose={(_, reason) => {
                if (reason !== "backdropClick") {
                    handleClose();
                }
            }}
            aria-labelledby="simple-dialog-title"
            open={open}
        >
            <DialogTitle id="simple-dialog-title">
                Confirm all items scanned correctly ?
            </DialogTitle>
            <DialogActions className={classes.dialog_actions}>
                <Button
                    onClick={() => handleSubmitChoice("yes")}
                    key={"yes"}
                    className={classes.yes_btn}
                >
                    YES
                </Button>
                <Button
                    onClick={() => handleSubmitChoice("no")}
                    key={"no"}
                    className={classes.no_btn}
                >
                    NO
                </Button>
            </DialogActions>
        </Dialog>
    );
  }
  
  SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
  };



const default_product = {
    prod_id: 0,
    prod_desc: "Please Choose a Product",
}

const default_job = {
    job_id: 0,
    job_desc: "Please Choose a Job",
}

function TPVPrepStation({ eel, params, setParams }) {
    /** Simple Modal */
    // const [modalStyle] = React.useState(getModalStyle);
    // const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState('no');
    const default_action_btns = [ACTION_BUTTON_DELETE];
    const SCANNED_VOID = "<Pending>";
    const [state, setState] = useState({
        tests: [],
        status: CONST_NONE, //each barcode scan status
        scanned_value: "",
        active_products: [default_product],
        prod_id: 0,
        selected_product: default_product.prod_desc,
        active_jobs: [default_job],
        job_id: 0,
        selected_job: default_job.job_desc,
        nextItem: "",
        all_validated: false,
        prep_qty: 0,
        target_qty: 0,
        last_prep: "Unknown"
        // message: `Click button to choose a random file from the user's system`,
        // path: defPath,
    });

    const handleDialogSubmit = (value) => {
        console.log("handleDialogSubmit called .... " + value)
        console.log(state)

        if (value === 'yes')
        {
            try {
                if (params.server.status) {
                    eel.create_prep_event(
                        state.selected_product,
                        state.selected_job,
                        state.last_prep,
                        state.tests,
                        params.session.userdata.user_desc
                    )((response) => {
                        console.log(
                            `[PY]: ${JSON.stringify(response, null, 2)}`
                        );
                        try {
                            const function_name = response.function_name;
                            const status = response.status;
                            const message = response.message;
                            const metadata = response.data.metadata;
                            console.log(
                                `${function_name} message got: ${JSON.stringify(
                                    message
                                )} metadata: ${JSON.stringify(metadata)}`
                            );
                            if (status === CONST_SUCCESS) {
                                setState((prevState) => ({
                                    ...prevState,
                                    submitted_list: metadata["submitted_list"],
                                    last_prep: metadata["last_prep"],
                                    prep_qty: metadata["prep_qty"],
                                    target_qty: metadata["target_qty"],
                                    status: CONST_NONE,
                                    all_validated: false
                                }));
                                scanCycleReset();
                                
                            } else {
                                setState((prevState) => ({
                                    ...prevState,
                                    all_validated: false
                                }))
                                scanCycleReset();

                                setTimeout(() => {
                                    alert(`RESPONSE ERROR: ${message}`);
                                }, 200);
                            }
                            
                            
                        } catch (error) {
                            setState((prevState) => ({
                                ...prevState,
                                all_validated: false
                            }))
                            scanCycleReset();

                            setTimeout(() => {
                                alert(`PARSE ${error}`);
                            }, 200);
                        }
                    });
                } else {
                    throw Error(`Connect the server first`);
                }
            } catch (error) {
                alert(`${error}`);
            }
        }


        
        setSelectedValue(value);
    };
    /** */
    // console.log(params);
    const CONST_SUCCESS = "SUCCESS";
    const CONST_FAILURE = "FAILURE";
    const CONST_NONE = "NONE";
    const ACTION_BUTTON_DELETE = "delete";
    const inputRef = useRef(null);
    const handleDeleteItem = (id, rownum, serial) => {
        console.log("handleDeleteItem called ");
        if (
            window.confirm(
                `Confirm delete Row: ${rownum} - ${serial} from below list?`
            )
        ) {
            console.log(state)
            setState((prevState) => {
                const list = state.data.filter((item) => item.id !== id);
                // console.log(`list: ${list}`);
                return { ...prevState, data: list };
            });
        }
    };

    // handle what happens on key press
    const handleKeyPress = useCallback((event) => {
        console.log(`Key pressed: ${event.key}`);
        if (event.keyCode === 32 && event.target === document.body) {
            event.preventDefault();
        }
    }, []);

    useEffect(() => {
        // attach the event listener
        document.addEventListener("keydown", handleKeyPress);

        // remove the event listener
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        console.log("useEffect called #2");
        try {
            if (state.status !== CONST_NONE)
            {
                console.log(state)
                const prep_item = state.nextItem;
                let nextItem = prep_item;
                let all_validated = false;
                const tests = state.tests.map((obj, idx) => {
                    if (obj.item === prep_item) {
                        //TODO: validate
                        const isValid = state.status === CONST_SUCCESS;
                        if (isValid && nextItem === state.tests[state.tests.length - 1]["item"]) 
                        {
                            //Last Item Passed
                            all_validated = true;
                        }
                        else if (isValid) {
                            //Before Last Item
                            nextItem = state.tests[idx + 1]["item"]
                        }
                        else 
                        {
                            //Failed 1 : Mismatch
                            //Failed 2 : Not Unique
                        }
                        return {
                            ...obj,
                            scanned: state.scanned_value,
                            passed: isValid
                        }
                    }
                    else {
                        return obj;
                    }
                })

                setState((prevState) => {
                    return {
                        ...prevState,
                        status: CONST_NONE,
                        tests: tests,
                        nextItem: nextItem,
                        scanned_value: "",
                        all_validated: all_validated }
                })
            }
        } catch (error) {
            alert(`${error}`);
        }
    }, [state.status]);

    useEffect(() => {
        console.log("useEffect called #3");
        try {
            if (params.server.status) {
                eel.get_active_products()((response) => {
                    

                    console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                    try {
                        const function_name = response.function_name;
                        const status = response.status;
                        const message = response.message;
                        const metadata = response.data.metadata;
                        console.log(
                            `${function_name} message got: ${JSON.stringify(
                                message
                            )} metadata: ${JSON.stringify(metadata)}`
                        );
                        if (status === CONST_SUCCESS) {
                            setState((prevState) => ({
                                ...prevState,
                                active_products: [
                                    default_product,
                                    ...metadata.prod_list,
                                ],
                                status: CONST_NONE
                            }));
                        } else {
                            setTimeout(() => {
                                alert(`RESPONSE ERROR: ${message}`);
                            }, 200);
                        }
                    } catch (error) {
                        setTimeout(() => {
                            alert(`PARSE ${error}`);
                        }, 200);
                    }
                });
            } else {
                throw Error(`Connect the server first`);
            }
        } catch (error) {
            alert(`${error}`);
        }

        // return () => {
        //     cleanup
        // }
    }, [eel, params.server.status]);

    const onSelectProduct = (prodId, prodDesc) => {
        const prodObj = state.active_products.filter(
            (prod) => prod.prod_desc === prodDesc
        )[0];
        console.log(
            `onSelectProduct called prodId: ${prodObj?.prod_id} prodDesc: ${prodDesc}`
        );
        console.log('--------------------------------')
        console.log(state)
        setState((prevState) => { return {
                ...prevState,
                prod_id: prodObj?.prod_id,
                selected_product: prodDesc,
                active_jobs: [default_job],
                job_id: 0,
                selected_job: default_job.job_desc,
                nextItem: "",
                all_validated: false,
                tests: [],
                status: CONST_NONE,
                prep_qty: 0,
                target_qty: 0,
                last_prep: "Unknown"
            }}
        );

        if (prodDesc) {
            eel.get_active_prep_by_prod_desc(prodDesc)((response) => {
                console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                try {
                    const function_name = response.function_name;
                    const status = response.status;
                    const message = response.message;
                    const metadata = response.data.metadata;
                    console.log(
                        `${function_name} message got: ${JSON.stringify(
                            message
                        )} metadata: ${JSON.stringify(metadata)}`
                    );
                    if (status === CONST_SUCCESS) {
                        setState((prevState) => ({
                            ...prevState,
                            job_id: 0,
                            active_jobs: [
                                default_job,
                                ...metadata.job_list,
                            ],
                            status: CONST_NONE
                        }));
                    } else {
                        setTimeout(() => {
                            alert(`RESPONSE ERROR: ${message}`);
                        }, 200);
                    }
                } catch (error) {
                    setTimeout(() => {
                        alert(`PARSE ${error}`);
                    }, 200);
                }
            });
        } else {
            throw Error(`Connect the server first`);
        }
    }

    const onSelectJob = (jobId, jobDesc) => {
        const jobObj = state.active_jobs.filter(
            (job) => job.job_desc === jobDesc
        )[0];
        console.log(
            `onSelectJob called jobId: ${jobObj?.job_id} jobDesc: ${jobDesc}`
        );
        console.log(jobObj) 
        setState((prevState) => { 
            return {
                ...prevState,
                job_id: jobObj?.job_id,
                prep_qty: jobObj?.prep_qty,
                target_qty: jobObj?.target_qty,
                selected_job: jobDesc,
                all_validated: false,
                status: CONST_NONE
            }
        });

        if (state.selected_product) {
            eel.get_prep_list_by_prod_desc(state.selected_product, jobDesc)((response) => {
                console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                try {
                    const function_name = response.function_name;
                    const status = response.status;
                    const message = response.message;
                    const metadata = response.data.metadata;
                    console.log(
                        `${function_name} message got: ${JSON.stringify(
                            message
                        )} metadata: ${JSON.stringify(metadata)}`
                    );
                    if (status === CONST_SUCCESS && metadata["prep_list"]) {
                        const otl = []
                        metadata.prep_list.forEach(prep => {
                            otl.push({
                                seq_num: prep.seq_num,
                                item: String(prep.item).replaceAll("_"," ").toUpperCase(),
                                stock_code: prep.stock_code,
                                description: prep.description,
                                flag_unique: prep.flag_unique,
                                scanned: SCANNED_VOID,
                                passed: false
                            })
                        });
                        otl.sort((a, b) => (a.seq_num > b.seq_num) ? 1 : -1)
                        console.log(otl)
                        console.log(state)
                        setState((prevState) => {
                            return {
                                ...prevState,
                                tests: otl,
                                nextItem: otl.length ? otl[0]["item"] : "",
                                all_validated: false,
                                status: CONST_NONE,
                                last_prep: metadata["last_prep"]
                            }
                        });
                    } else {
                        setTimeout(() => {
                            alert(`RESPONSE ERROR: ${message}`);
                        }, 200);
                    }
                } catch (error) {
                    setTimeout(() => {
                        alert(`PARSE ${error}`);
                    }, 200);
                }
            });
        }
        inputRef.current.focus();
    }

    const scanCycleReset = () => {
        inputRef.current.focus();

        const tests = state.tests.map((test) => ({
            ...test,
            scanned: SCANNED_VOID,
            passed: false
        }))
        console.log(state)
        setState((prevState) => { 
            return {
                ...prevState,
                status: CONST_NONE, //each barcode scan status
                scanned_value: "",
                tests: tests,
                nextItem: state.tests.length ? state.tests[0]["item"] : "",
                all_validated: false
            }
        })
    }

    const validateBarcode = (prep_item, stock_code, flag_unique, prep_scanned= "") => {
        console.log(state);
        console.log(`$$$ Validating... ${prep_item} ${prep_scanned} against stock_code: ${stock_code}`)
        if (prep_scanned.startsWith(stock_code) === false) {
            // setTimeout(() => {
            //     alert(`Error: Scanned barcode does not belongs to stock code!`);
            // }, 200);
            console.log(state)
            setState((prevState) => {
                return {
                    ...prevState,
                    status: CONST_FAILURE,
                    scanned_value: prep_scanned
                }
            })
            return;
        }
        if (flag_unique) 
        {
            if (stock_code === prep_scanned) 
            {
                console.log(state)
                setState((prevState) => {
                    return {
                        ...prevState,
                        status: CONST_FAILURE,
                        scanned_value: prep_scanned
                    }
                })
                return;
            }
            //TODO, query database against existing values
            eel.prep_check_duplicate(prep_scanned)((response) => {
                console.log(`[PY]: ${JSON.stringify(response, null, 2)}`);
                try {
                    let status = response.status;
                    let message = response.message;
                    let metadata = response.data.metadata;
                    

                    if (status !== CONST_SUCCESS) 
                    {
                        setTimeout(() => {
                            alert(`${message}`);
                        }, 200);
                    }
                    console.log(state)
                    setState((prevState) => {
                            return {
                                ...prevState,
                                status: status,
                                scanned_value: prep_scanned
                            }
                        }
                    )
                } catch (error) {
                    setTimeout(() => {
                        alert(`PARSE ERROR: ${error}`);
                    }, 200);
                }
            });
        }
        else {
            if (stock_code === prep_scanned) 
            {
                console.log(state)
                setState((prevState) => {
                    return {
                        ...prevState,
                        status: CONST_SUCCESS,
                        scanned_value: prep_scanned
                    }
                })
            }
            else 
            {
                console.log(state)
                setState((prevState) => {
                    return {
                        ...prevState,
                        status: CONST_FAILURE,
                        scanned_value: prep_scanned
                    }
                })
            }
        }
    }

    const handleBarcodeInput = (event) => {
        const scanned_barcode = event.target.value.trim();
        if (scanned_barcode === "") {
            alert("Error: Blank input not accepted!");
                return;
        }

        if (state.prep_qty >= state.target_qty) {
            alert("Error: Job target matched !!!");
                return;
        }

        event.target.value = ""
        console.log(state)
        setState((prevState) => {
            return {
                ...prevState,
                status: CONST_NONE
            }
        })
        // alert(`___${pcb_sn}___`);
        console.log(params);
        
        try {
            if (params.session.active === false) {
                alert("Session not active, Please login first");
                return;
            }

            if (params.server.status) {
                // state.tests.forEach(testname => {
                    const prep_item = state.nextItem
                    state.tests.forEach(obj => {
                        if (obj.item === prep_item) {
                            validateBarcode(obj.item, obj.stock_code, obj.flag_unique, scanned_barcode)
                        }
                    })
            } else {
                throw Error(`Connect the server first`);
            }
            event.target.value = "";
        } catch (error) {
            alert(`ERROR: ${error}`);
        }
    };

    return (
        <div className="absolute flex flex-col w-full mt-2 border-0 border-red-600 h-1/2">
            <div className="flex border-0 border-green-400 border-dashed">
                <div className="flex w-full mx-4 border-0 border-blue-700 border-double rounded-t-lg form-control">
                    <div className="flex border-0 border-red-700 w-full">
                        <div className="flex flex-col flex-1 border-0 border-gray-700">
                            <div className="flex mt-2 border-0 border-red-600">
                                <label className="text-black label w-48">
                                    <span className="text-black label-text">
                                        Select Product:
                                    </span>
                                </label>
                                <select
                                    className="flex select select-sm select-bordered select-primary w-1/3"
                                    disabled=""
                                    onChange={(e) =>
                                        onSelectProduct(
                                            e.target.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    {state?.active_products?.map(
                                        (prod_id_desc, index) => (
                                            <option
                                                disabled={index === 0}
                                                selected={index === 0}
                                                key={
                                                    "product#" +
                                                    prod_id_desc.prod_id
                                                }
                                                id={prod_id_desc.prod_id}
                                            >
                                                {prod_id_desc.prod_desc}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="flex mt-2 border-0 border-red-600">
                                <label className="text-black label w-48">
                                    <span className="text-black label-text">
                                        Select Job:
                                    </span>
                                </label>
                                <select
                                    className="flex select select-sm select-bordered select-primary w-1/3"
                                    disabled=""
                                    onChange={(e) =>
                                        onSelectJob(e.target.id, e.target.value)
                                    }
                                >
                                    {state?.active_jobs?.map(
                                        (job_id_desc, index) => (
                                            <option
                                                selected={index === 0}
                                                key={
                                                    "job#" + job_id_desc.job_id
                                                }
                                                id={job_id_desc.job_id}
                                            >
                                                {job_id_desc.job_desc}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex border-0 border-green-400 shadow">
                            <div className="stat">
                                <div className="stat-title">
                                    Done vs Target
                                </div>
                                <div className="stat-value">{`${state.prep_qty} / ${state.target_qty}`}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title ">
                                    Prep Number
                                </div>
                                <div className="stat-value text-primary">{state.last_prep}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b-2 border-purple-400 border-dashed mb-2 mt-2"></div>

                    <div className="flex gap-8 h-24 border-0 border-yellow-600">
                        <div className="flex flex-1">
                            <label className="text-black label w-48 justify-start">
                                <span className="text-black label-text">
                                    Scan:
                                </span>
                                {/* <span className="mx-2 text-blue label-text font-bold">
                                    {state.nextItem}
                                </span> */}
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder=""
                                className="border-double input input-primary input-sm input-bordered w-1/3"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleBarcodeInput(e)
                                }
                            />
                            <label className="text-black label w-48 justify-start">
                                <span className="mx-2 text-blue label-text font-bold">
                                    {state.nextItem}
                                </span>
                            </label>
                        </div>
                        
                    </div>

                    <div className="border-0 flex flex-col gap-2 border-blue-500 mt-2">
                        <div className="overflow-x-auto">
                            <table className="table table-compact w-full">
                                <thead>
                                    <tr>
                                        <th>Sequence#</th>
                                        <th>Item</th>
                                        <th>User scanned</th>
                                        <th>Stock Code</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.tests.map((prep, index) => (
                                        <tr key={"prep#" + index}>
                                            <th>{prep.seq_num}</th>
                                            <td>{prep.item}</td>
                                            <td>
                                                <div
                                                    className={`p-1 rounded-sm ${
                                                        prep.scanned !==
                                                            SCANNED_VOID &&
                                                        (prep.passed
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-500 text-white")
                                                    }`}
                                                >
                                                    {prep.scanned}
                                                </div>{" "}
                                            </td>
                                            <td>{prep.stock_code}</td>
                                            <td>{prep.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <SimpleDialog
                selectedValue={selectedValue}
                open={state.all_validated}
                onClose={handleDialogSubmit}
            />
        </div>
    );
}

export default TPVPrepStation;
