import * as fs from "fs";
import {Parser} from "../src";

describe('node hl7 client - parser tests', () => {

  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('sanity test', () => {

    test('error - no data passed', async () => {
      try {
        await parser.processRawData({data: ""})
      } catch (e: any) {
        expect(e.message).toBe('data object not passed or not defined.');
      }

    })

    test('error - no data object', async () => {
      try {
        // @ts-expect-error no data object
        await parser.processRawData()
      } catch (e: any) {
        expect(e.message).toBe('data object not passed or not defined.');
      }

    })

  })

  test('...non batch Hl7 message', async () => {
    const data = fs.readFileSync( `${__dirname}/__data__/adt.hl7`, "utf-8" );
    await parser.processRawData({data})
    const batch = await parser.getBatchProcess()

    // first test
    expect(batch).toBe(false);
  })

  test('... batch Hl7 messages', async () => {
    const data = fs.readFileSync( `${__dirname}/__data__/batch.hl7`, "utf-8" );
    await parser.processRawData({data})
    const batch = await parser.getBatchProcess()

    // first test
    expect(batch).toBe(true);
  });

  describe('segment retrieval tests', () => {

    beforeEach(async () => {
      const data = fs.readFileSync(`${__dirname}/__data__/adt.hl7`, "utf-8");
      await parser.processRawData({data})

      // @todo MSG Header Tests - Make sure that we are setting the field operators from the HL7 message we get
    })

    test('get first, single segment', async () => {
      const segment = await parser.getSegment('MSH.1')
      expect(segment.constructor.name).toBe("Segment")
      expect(segment._name).toBe("MSH")
    })

    test.todo('get all segments')

    test.todo('get a particular segment value')

  })

})