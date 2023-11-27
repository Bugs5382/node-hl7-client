// Sample HL7 Messages
// Gotten from: https://github.com/johnpaulett/python-hl7/blob/6d85f25d678e366d2617690d4ee1216bb8027db1/tests/samples.py

export const sample_hl7 =
    [
      "MSH|^~\\&|GHH LAB|ELAB-3|GHH OE|BLDG4|200202150930||ORU^R01|CNTRL-3456|P|2.4",
      "PID|||555-44-4444||EVERYWOMAN^EVE^E^^^^L|JONES|196203520|F|||153 FERNWOOD DR.^^STATESVILLE^OH^35292||(206)3345232|(206)752-121||||AC555444444||67-A4335^OH^20030520",
      "OBR|1|845439^GHH OE|1045813^GHH LAB|1554-5^GLUCOSE|||200202150730||||||||555-55-5555^PRIMARY^PATRICIA P^^^^MD^^LEVEL SEVEN HEALTHCARE, INC.|||||||||F||||||444-44-4444^HIPPOCRATES^HOWARD H^^^^MD",
      "OBX|1|SN|1554-5^GLUCOSE^POST 12H CFST:MCNC:PT:SER/PLAS:QN||^182|mg/dl|70_105|H|||F",
      "OBX|2|FN|1553-5^GLUCOSE^POST 12H CFST:MCNC:PT:SER/PLAS:QN||^182|mg/dl|70_105|H|||F\r",
    ].join("\r")

export const rep_sample_hl7 =
    [
      "MSH|^~\\&|GHH LAB|ELAB-3|GHH OE|BLDG4|200202150930||ORU^R01|CNTRL-3456|P|2.4",
      "PID|Field1|Component1^Component2|Component1^Sub-Component1&Sub-Component2^Component3|Repeat1~Repeat2",
      "",
    ].join("\r")


export const sample_batch =
    [
      "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
      "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
      "EVN|A04|20060705000000",
      "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
      "PD1||2",
      "NK1|1||1||||||||||||||||||2",
      "PV1|1|O||||^^^^^1",
      "BTS|1",
      "",
    ].join("\r")


export const sample_batch1 =
  [
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778891|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|2",
    "",
  ].join("\r")


export const sample_batch2 =
  [
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "",
].join("\r")

export const sample_bad_batch =
  [
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "",
 ].join("\r")

export const sample_bad_batch1 =
  [
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123402||||abchs20070101123401-1",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "",
 ].join("\r")

// Source: http://www.health.vic.gov.au/hdss/vinah/2006-07/appendix-a-export const sample-messages.pdf
  export const sample_file =
    [
      "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
      "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
      "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
      "EVN|A04|20060705000000",
      "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
      "PD1||2",
      "NK1|1||1||||||||||||||||||2",
      "PV1|1|O||||^^^^^1",
      "BTS|1",
      "FTS|1",
      "",
    ].join("\r")

export const sample_file1 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778891|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|2",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-2",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "FTS|2",
    "",
 ].join("\r")

export const sample_file2 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778891|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_file3 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "",
 ].join("\r")

export const sample_file4 =
  [
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_file5 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_file6 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_bad_file =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_bad_file1 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123402||||abchs20070101123401-1",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_bad_file2 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "BHS|^~\\&||ABCHS||AUSDHSV|20070101123401||||abchs20070101123401-1",
    "MSH|^~\\&||ABCHS||AUSDHSV|20070101112951||ADT^A04^ADT_A01|12334456778890|P|2.5|||NE|NE|AU|ASCII",
    "EVN|A04|20060705000000",
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123402|||abchs20070101123401.hl7|",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "BTS|1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_bad_file3 =
  [
    "FHS|^~\\&||ABCHS||AUSDHSV|20070101123401|||abchs20070101123401.hl7|",
    "EVN|A04|20060705000000",
    "PID|1||0000112234^^^100^A||XXXXXXXXXX^^^^^^S||10131113|1||4|^^RICHMOND^^3121||||1201||||||||1100|||||||||AAA",
    "PD1||2",
    "NK1|1||1||||||||||||||||||2",
    "PV1|1|O||||^^^^^1",
    "FTS|1",
    "",
 ].join("\r")

export const sample_msh =
  [
    "MSH|^~\\&|HNAM_PM|HNA500|AIG||20131017140041||ADT^A01|Q150084616T145947960|P|2.3",
    "PID|1|2148790^^^MSH_MRN^MR|2148790^^^MSH_MRN^MR~162840^^^MSH_EMPI^CM|3722^0^^MSH_DTC^REFE~184737^0^^IID^DONOR ~Q2147670^0^^MSQ_MRN|RUFUSS^MELLODIAL^^^^^CURRENT||19521129|F|RUFUSS^MELLODIAL^^^^^PREVIOUS|OT|221 CANVIEW AVENUE^66-D^BRONX^NY^10454^USA^HOME^^058||3472444150^HOME~(000)000-0000^ALTERNATE||ENGLISH|M|PEN|O75622322^^^MSH_FIN_NBR^FIN NB|125544697|||HIS|||0",
    'PV1|0001|I|MBN1^MBN1^06|4| 863968||03525^FARP^YONAN|03525^FARP^YONAN|""|NUR|||N|5|| U|03525^FARP^YONAN|I|01|T22~SLF|||||||||||||||||||E||AC|||20140210225300|""',
    'DG1|0001|I9|440.21^ATHEROSCLEROSIS W/INT CLAUDCTN^I9|ATHEROSCLEROSIS W/INT CLAUDCTN|""|A|||||||.00||9',
    'IN1|0001|A10A|A10|HIP COMP MCAID|PO BOX 223^""^NEW YORK^NY^10116^US^^^""|HIP ON LINE|""|""|""|||""|""|25892261^""^""|C|BENNETT^NELLY|4^SELF|10981226|322-10 GOODLIN AVE^APT B31^FLUSHING^NY^11355^US^^^61|Y|""||||||Y||""|||||||-JNJ45517',
    'IN2||062420044|""|||""|||||||||||||||||||60094|""|||||||||||||||||||||||||||||||',
    'IN1|0002|GMED|""|MEDICAID|""|""|""|""|""|||""|""||X|BENNETT^NELLY|4^SELF|10981226|322-10 GOODLIN AVE^APT B31^FLUSHING^NY^11355^US^^^61|""|""||||||""||||||',
    'IN2||062420044|""|||""|||||||||||||||||||""|""||||||||||||||||||||||||||||||||""',
    'IN1|0003|SLFJ|""|SELF-PAY|""|""|""|""|""|||""|""||P|BENNETT^NELLY|4^SELF|10981226|322-10 GOODLIN AVE^APT B31^FLUSHING^NY^11355^US^^^61|""|""||||||""||||||',
    "",
 ].join("\r")
