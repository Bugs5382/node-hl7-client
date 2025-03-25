import { describe, expect, test } from "vitest";
import { Message } from "../src";

describe("hl7 parser tests", () => {
  describe('field separations', () => {
    test("...field separation ... part 1", () => {
      const hl7_field_seperation: string =
        "MSH|^~\\&|HUBWS|46355||DAL|202412091132||ORM^O01|MZ54932|P|2.3\rPID|1|999-99-9999|CHART^^^CID~MEDICAL^^^MRN||PTLASTNAME^PTFIRSTNAME^||19750825|F|||4690 MAIN STREET^^MASON^OH^45040||^^^^^513^5550124||||||999654321||";

      const message = new Message({ text: hl7_field_seperation });
      expect(message.get("PID.1").toString()).toBe("1");
      expect(message.get("PID.2").toString()).toBe("999-99-9999");
      expect(message.get("PID.3").get(0).get(0).toString()).toBe("CHART");
      expect(message.get("PID.3").get(0).get(3).toString()).toBe("CID");
      expect(message.get("PID.3").get(1).get(0).toString()).toBe("MEDICAL");
      expect(message.get("PID.3").get(1).get(3).toString()).toBe("MRN");
      expect(message.get("PID.5.1").toString()).toBe("PTLASTNAME");
    });

    test("...field separation ... part 2", () => {
      const hl7_field_seperation_2: string =
        'MSH|^~\\&|ZIS|Testziekenhuis^Capelle ad IJssel|||20080917161411||ADT^A08^ADT_A01|CLV1-1649|P|2.4|||AL|NE|NLD|8859/1|NL\rEVN|A08|20080917161412\rPID|1||7137542^^^^PI~123456782^^^NLMINBIZA^NNNLD^^20080917~AA1234567^^^NLMINBIZA^PPN^^20080917||van Testpatiënt-van het Hek&van&Testpatiënt&van het&Hek^Jeanet^L M G^^^^L~^Jannie^^^^^N||19600101|F|||Dorpsweg 16&Dorpsweg&16^^Groningen^^9737AA^NL^M||050-1234567^PRN^PH|||M|||||||Assen|N|||||""|N ROL|1|UP|PP^Primary Care Provider|01001234^Huisarts^H^^^^^^Vektis^L|||||01^Huisartsen^Vektis||Straatweg 2&Straatweg&2^^Groningen^^9723AA^^O|050-3134102^WPN^PH~^NET^X.400^800013630\rPV1|1|I|6-SCU^6^1^Neurologie|R|||041623^Specialist&&Specialist^S^^^^^^^L||||||||||043213^Opnamearts&&Opnamearts^O^^^^^^^L||12344321|||||||||||||||||||||||||20080917161412\rPV2|||E75.4^Neuronal ceroid lipofuscinosis^I9||||||20080919 IN1|1|^Zorg-op-maat polis^LOCAL|123456^^^Vektis|CZ-GROEP|POSTBUS 90152&POSTBUS&12^^TILBURG^^5200LD^^O||010-2881600^WPN^PH|||||20010101 ';

      const message = new Message({ text: hl7_field_seperation_2 });
      expect(message.get("PID.3").get(1).get(0).toString()).toBe("123456782");
    });

    test("...field separation ... part 3", () => {
      const hl7_field_seperation_3: string =
        "MSH|^~\\&|1.2||||20250126162659||ADT^A03^ADT_A03||P|2.5^FRA^2.5|||||FRA|8859/1|||\n" +
        "PID|||0001^^^MCK&1.2&L^PI~7777^^^ASIP-SANTE-INS-C&1.3&ISO^INS-C^^|";

      const message = new Message({ text: hl7_field_seperation_3 });
      expect(message.get("PID.3").get(1).get(0).toString()).toBe("7777");
    });
  })
});
