const status = [
	{
		"id_status" : 0,
		"status_desc" : "False"
	},
	{
		"id_status" : 1,
		"status_desc" : "True"
	},
	{
		"id_status" : 2,
		"status_desc" : "Open"
	},
	{
		"id_status" : 3,
		"status_desc" : "Closed"
	},
	{
		"id_status" : 4,
		"status_desc" : "Active"
	},
	{
		"id_status" : 5,
		"status_desc" : "Inactive"
	},
	{
		"id_status" : 6,
		"status_desc" : "Created"
	},
	{
		"id_status" : 7,
		"status_desc" : "Printed"
	},
	{
		"id_status" : 8,
		"status_desc" : "Flash Programming"
	},
	{
		"id_status" : 9,
		"status_desc" : "SFDC Flash Programming"
	},
	{
		"id_status" : 10,
		"status_desc" : "Bottom Side"
	},
	{
		"id_status" : 11,
		"status_desc" : "Top Side"
	},
	{
		"id_status" : 12,
		"status_desc" : "Repairs"
	},
	{
		"id_status" : 13,
		"status_desc" : "PCBA Test Passed"
	},
	{
		"id_status" : 14,
		"status_desc" : "SFDC Test Jigs"
	},
	{
		"id_status" : 15,
		"status_desc" : "AOI Test Passed"
	},
	{
		"id_status" : 16,
		"status_desc" : "Mechanical"
	},
	{
		"id_status" : 17,
		"status_desc" : "Base Label Print"
	},
	{
		"id_status" : 18,
		"status_desc" : "CA Test Passed"
	},
	{
		"id_status" : 19,
		"status_desc" : "Giftbox Pairing"
	},
	{
		"id_status" : 20,
		"status_desc" : "Carton Packaging"
	},
	{
		"id_status" : 21,
		"status_desc" : "Carton Verified"
	},
	{
		"id_status" : 22,
		"status_desc" : "OQC Test Passed"
	},
	{
		"id_status" : 23,
		"status_desc" : "Pallet Check"
	},
	{
		"id_status" : 24,
		"status_desc" : "Dispatch"
	},
	{
		"id_status" : 28,
		"status_desc" : "In Stores"
	},
	{
		"id_status" : 29,
		"status_desc" : "Out Stores"
	},
	{
		"id_status" : 30,
		"status_desc" : "Duplication Process"
	},
	{
		"id_status" : 31,
		"status_desc" : "Return To Stores"
	},
	{
		"id_status" : 32,
		"status_desc" : "HDD Pairing"
	},
	{
		"id_status" : 33,
		"status_desc" : "Voucher Pairing"
	},
	{
		"id_status" : 34,
		"status_desc" : "Voucher Verification"
	},
	{
		"id_status" : 35,
		"status_desc" : "Customer Return File"
	},
	{
		"id_status" : 36,
		"status_desc" : "Locking Test Passed"
	},
	{
		"id_status" : 38,
		"status_desc" : "Loose Label Print"
	},
	{
		"id_status" : 39,
		"status_desc" : "Blacklisted"
	},
	{
		"id_status" : 40,
		"status_desc" : "Shipped"
	},
	{
		"id_status" : 41,
		"status_desc" : "Returned for Rework"
	},
	{
		"id_status" : 42,
		"status_desc" : "Component Changer"
	},
	{
		"id_status" : 43,
		"status_desc" : "Scrapped"
	},
	{
		"id_status" : 44,
		"status_desc" : "Repair Checked Out PCBA"
	},
	{
		"id_status" : 45,
		"status_desc" : "Repair Checked Out Mechanical"
	},
	{
		"id_status" : 46,
		"status_desc" : "Component Changed PCBA"
	},
	{
		"id_status" : 47,
		"status_desc" : "Component Changed Mechanical"
	},
	{
		"id_status" : 48,
		"status_desc" : "PCBA Test Failed"
	},
	{
		"id_status" : 49,
		"status_desc" : "CA Test Failed"
	},
	{
		"id_status" : 50,
		"status_desc" : "OQC Test Failed"
	},
	{
		"id_status" : 51,
		"status_desc" : "Locking Test Failed"
	},
	{
		"id_status" : 52,
		"status_desc" : "Repairs Quarantine"
	},
	{
		"id_status" : 53,
		"status_desc" : "Shipped Erroneously"
	},
	{
		"id_status" : 54,
		"status_desc" : "GDL Reworked"
	},
	{
		"id_status" : 56,
		"status_desc" : "GDL Reworked TSC Generated"
	},
	{
		"id_status" : 57,
		"status_desc" : "Soak Test"
	},
	{
		"id_status" : 58,
		"status_desc" : "QR Code Printed"
	},
	{
		"id_status" : 59,
		"status_desc" : "Special Shipment"
	},
	{
		"id_status" : 65,
		"status_desc" : "AOI Test Failed"
	},
	{
		"id_status" : 66,
		"status_desc" : "Repair Checked Out PCB Label Duplication"
	},
	{
		"id_status" : 67,
		"status_desc" : "Component Changed PCB Label Duplication"
	},
	{
		"id_status" : 68,
		"status_desc" : "Repair Checked Out AOI"
	},
	{
		"id_status" : 69,
		"status_desc" : "Component Changed AOI"
	},
	{
		"id_status" : 70,
		"status_desc" : "SDTV Approved"
	},
	{
		"id_status" : 71,
		"status_desc" : "Submitted for Shipping Approval"
	},
	{
		"id_status" : 72,
		"status_desc" : "Netstar PCBA Retest"
	},
	{
		"id_status" : 73,
		"status_desc" : "Awaiting OQC Test"
	},
	{
		"id_status" : 74,
		"status_desc" : "Awaiting QC Buy-Off PCBA Test"
	},
	{
		"id_status" : 77,
		"status_desc" : "Soak Test Passed"
	},
	{
		"id_status" : 78,
		"status_desc" : "Soak Test Failed"
	},
	{
		"id_status" : 79,
		"status_desc" : "CW Fuse Incorrectly Blown"
	},
	{
		"id_status" : 80,
		"status_desc" : "Giftbox Pairing Verified"
	},
	{
		"id_status" : 81,
		"status_desc" : "Reworked To New Variant"
	},
	{
		"id_status" : 82,
		"status_desc" : "Reverified Pallet"
	},
	{
		"id_status" : 83,
		"status_desc" : "PCB Label Verified"
	},
	{
		"id_status" : 84,
		"status_desc" : "Blacklisted PCB Labels"
	},
	{
		"id_status" : 85,
		"status_desc" : "Assembly Received"
	},
	{
		"id_status" : 86,
		"status_desc" : "Wireless Test Passed"
	},
	{
		"id_status" : 87,
		"status_desc" : "Wireless Test Failed"
	},
	{
		"id_status" : 88,
		"status_desc" : "Key Test Passed"
	},
	{
		"id_status" : 89,
		"status_desc" : "Key Test Failed"
	},
	{
		"id_status" : 90,
		"status_desc" : "QR Code Verified"
	},
	{
		"id_status" : 91,
		"status_desc" : "Reworked for RCU Issues"
	}
];

export default status;
