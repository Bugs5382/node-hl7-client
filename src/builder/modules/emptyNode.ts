import { HL7Node } from "../interface/hL7Node";

/**
 * Empty Node
 * @since 1.0.0
 */
export class EmptyNode implements HL7Node {
  get name(): string {
    throw new Error("Method not implemented");
  }

  get length(): number {
    return 0;
  }

  get(_path: string | number): HL7Node {
    return this;
  }

  set(_path: string | number, _value?: any): HL7Node {
    return this;
  }

  exists(_path: string | number): boolean {
    return false;
  }

  forEach(_callback: (value: HL7Node, index: number) => void): void {
    throw new Error("Method not implemented");
  }

  toString(): string {
    return "";
  }

  toFile(_name: string, _newLine?: boolean, _location?: string): void {
    throw new Error("Method not implemented.");
  }

  toRaw(): string {
    throw new Error("Method not implemented");
  }

  toArray(): HL7Node[] {
    return [];
  }

  isEmpty(): boolean {
    return true;
  }

  toDate(): Date {
    throw new Error("Method not implemented");
  }

  toInteger(): number {
    throw new Error("Method not implemented");
  }

  toFloat(): number {
    throw new Error("Method not implemented");
  }

  toBoolean(): boolean {
    throw new Error("Method not implemented");
  }

  read(_path: string[]): HL7Node {
    throw new Error("Method not implemented");
  }

  write(_path: string[], _value: string): HL7Node {
    return this;
  }

  get path(): string[] {
    throw new Error("Method not implemented");
  }
}
