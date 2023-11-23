import {Segment} from "./segment";

export interface ISegment {
  /* Name of the segment */
  name: string;
  /* The data of the segment */
  data: Segment
  /*Content of the HL7 */
  content: string;
}