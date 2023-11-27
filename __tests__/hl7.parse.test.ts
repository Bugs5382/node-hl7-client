import {Parser} from "../src";
import {
/*  rep_sample_hl7, */
  sample_bad_batch,
  sample_bad_batch1,
 /* sample_bad_file,
  sample_bad_file1,
  sample_bad_file2,
  sample_bad_file3,*/
  sample_batch,
  sample_batch1,
  sample_batch2,
  /*  sample_file,
    sample_file1,
    sample_file2,
    sample_file3,
    sample_file4,
    sample_file5,
    sample_file6,*/
  sample_hl7
} from "./__data__/sample_messages";


describe('node hl7 client - parser tests', () => {

  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('sanity test', () => {

    test.skip('error - no data passed', async () => {
      try {
        await parser.processRawData({data: ""})
      } catch (e: any) {
        expect(e.message).toBe('data object not passed or not defined.');
      }

    })

    test.skip('error - no data object', async () => {
      try {
        // @ts-expect-error no data object
        await parser.processRawData()
      } catch (e: any) {
        expect(e.message).toBe('data object needs to be defined.');
      }

    })

  })

  describe('actual test', () => {

    describe('batch tests', () => {

      test.skip('...non batch HL7 message', async () => {

        for (const hl7_message of [
          sample_hl7
        ]) {
          await parser.processRawData({data: hl7_message})
          const batch = await parser.getBatchProcess()
           expect(batch).toBe(false);
        }
      })

      test.skip('... batch HL7 messages', async () => {

        for (const hl7_message of [
          sample_batch,
          sample_batch1,
          sample_batch2
        ]) {
          await parser.processRawData({data: hl7_message})
          const batch = await parser.getBatchProcess()
          expect(batch).toBe(true);
        }
      });

      test.skip('... bad batch HL7 messages', async () => {

        for (const hl7_message of [
          sample_bad_batch,
          sample_bad_batch1
        ]) {
          await parser.processRawData({data: hl7_message})
          // @ts-ignore
          const batch = await parser.getBatchProcess()
        }

      })


    })

  })

})