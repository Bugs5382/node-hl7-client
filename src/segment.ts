import {Delimiters} from "./delimiters";
import { Node } from "./node";

export class Segment extends Node {

  constructor(parent: Node, text: string) {
    super(parent, text, Delimiters.Field);
  }

}