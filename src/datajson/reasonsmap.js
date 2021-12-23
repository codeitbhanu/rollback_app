/* <option selected="selected" value="Select a Reason">Select a Reason</option>
<option value="Repairs BGA/Flash Replace">Repairs BGA/Flash Replace</option>
<option value="Barcode Misprint at Mechanical">Barcode Misprint at Mechanical</option>
<option value="Barcode Misprint at Base Panel">Barcode Misprint at Base Panel</option>
<option value="Carton Barcode failed QC Label Test">Carton Barcode failed QC Label Test</option>
<option value="Barcode Misprint at Carton Packaging">Barcode Misprint at Carton Packaging</option>
<option value="Barcode Misprint at Smartcard Pairing">Barcode Misprint at Smartcard Pairing</option>
<option value="Supplier Reject">Supplier Reject</option>
<option value="On Line Reject">On Line Reject</option>
<option value="TV Test Failure">TV Test Failure</option> */

// const status = [
//     {
//         id_status: 0,
//         status_desc: "Select a Reason",
//     },
//     {
//         id_status: 1,
//         status_desc: "Repairs BGA/Flash Replace",
//     },
//     {
//         id_status: 2,
//         status_desc: "Barcode Misprint at Mechanical",
//     },
//     {
//         id_status: 3,
//         status_desc: "Barcode Misprint at Base Panel",
//     },
//     {
//         id_status: 4,
//         status_desc: "Carton Barcode failed QC Label Test",
//     },
//     {
//         id_status: 5,
//         status_desc: "Barcode Misprint at Carton Packaging",
//     },
//     {
//         id_status: 6,
//         status_desc: "Barcode Misprint at Smartcard Pairing",
//     },
//     {
//         id_status: 7,
//         status_desc: "Supplier Reject",
//     },
//     {
//         id_status: 8,
//         status_desc: "On Line Reject",
//     },
//     {
//         id_status: 9,
//         status_desc: "TV Test Failure",
//     },
//     // KEEP THIS AT THE END
//     {
//         id_status: 9999,
//         status_desc: "Other - Enter Manually",
//     },
// ];

const status = [
    {
        id_status: -1,
        status_desc: "Select a Reason",
    },
    {
        id_status: 2,
        status_desc: "Barcode Misprint at QR Code",
    },
    {
        id_status: 4,
        status_desc: "Barcode Misprint at Mechanical",
    },
    {
        id_status: 6,
        status_desc: "Barcode Misprint at Giftbox Pairing",
    },
    {
        id_status: 10,
        status_desc: "OQC Test Failed",
    }
    // KEEP THIS AT THE END
    // {
    //     id_status: 9999,
    //     status_desc: "Other - Enter Manually",
    // },
];

export default status;
