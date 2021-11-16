-- DSD
SELECT stb_num, pe.pcb_num, dsd.cdsn_iuc as cdsn_iuc, pro.prod_id, pro.prod_desc, pe.id_status, status_desc, carton_num, pallet_num
FROM stb_production.dbo.production_event pe
    INNER JOIN stb_production.dbo.status st ON st.id_status = pe.id_status
    INNER JOIN stb_production.dbo.device_state_dsd_4140 dsd ON dsd.id_production_event = pe.id_production_event
    INNER JOIN stb_production.dbo.product pro ON pro.prod_id = pe.prod_id
WHERE pcb_num  = '309793000004' or stb_num = 'S0530000060' 
-- WHERE pcb_num  = '309793000003' or stb_num = 'S0530000052' 

-- OTT
SELECT stb_num, pe.pcb_num, snr.Field2 as cdsn_iuc, pro.prod_id, pro.prod_desc, pe.id_status, status_desc, carton_num, pallet_num
FROM stb_production.dbo.production_event pe
    INNER JOIN stb_production.dbo.status st ON st.id_status = pe.id_status
    INNER JOIN NEWDB.dbo.SNRecord snr ON snr.SN = pe.stb_num
    INNER JOIN stb_production.dbo.product pro ON pro.prod_id = pe.prod_id
WHERE pcb_num  = '999999999999' or stb_num = 'FAKESN9999999999'