import * as fs from "fs";
import {Parser} from "../src";

describe('node hl7 client - parser tests', () => {

  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
  })

  test('... properties of batch Hl7 messages', async () => {

    fs.readFile(`${__dirname}/__data__/batch.hl7`, 'utf8', async (_err, data) => {
      // @ts-ignore
      const message = await parser.processRawData({data})
      expect(parser.getBatchProcess()).toBe(true);
    });
  });

})