import * as fs from "fs";
import {Parser} from "../src";

describe('node hl7 client - parser tests', () => {

  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
  })

  test('...adt Hl7 message', async () => {
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

})