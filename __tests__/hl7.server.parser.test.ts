// These are functions that exist within the node-hl7-server NPM package
// that are tested here for diag purposes.

import { describe, expect, test } from 'vitest';
import {Message} from "../src";
import {_createAckMessage} from "./__utils__/server";

describe('hl7 module tests', () => {

  describe('sendResponse', () => {

    test('adt siu', async () => {

      const messageString = `MSH|^~\\&|||||20220304102435|ESBCKGRND|SIU^S12|521
SCH||60014711||||Sch|||5|MIN|^^5^20220218153000^20220218153500|ESEOD^CADENCE^EOD^PROCESSING||||ESEOD^CADENCE^EOD^PROCESSING||||ESEOD^CADENCE^EOD^PROCESSING|||||Sch
PID|1||3002505^^^MRN^MRN||CHILD^AMB^^^^^D||20150122|F|||123 STREET^^BROOKLYN^^11233^^L||(718)250-0000^P^H^^^718^2500000~^NET^Internet^cool@gmail.com|||SINGLE||60014711|111-52-5454||One^Mother^^|||||||||N
ZPD|Cent Amer In|MYCH|||||||||||||||||||||N|F
PD1||||9454^KOTHARI^VIPUL^^^^^^PROVID^^^^PROVID
PV1||OUTPATIENT|GGEVAC^^^^^^^^^^EDEP||||||||||||||||60014711|||||||||||||||||||||||||20220218||||||60014711
RGS|1||10008938^MAIN CAMPUS COVID
AIS|1|||||||||Sch
AIG|1||^COVID-19 VACCINE|2^RESOURCE||||20220218153000|0|MIN|5|MIN`

      const message = new Message({ text: messageString})

      const ackMessage = _createAckMessage("AA", message)
      expect(ackMessage.get('MSH.9.1').toString()).toEqual('ACK')
      expect(ackMessage.get('MSA.9.2').toString()).not.toBeUndefined()
      expect(ackMessage.get('MSA.1').toString()).toEqual('AA')

    })

  })

})