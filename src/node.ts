import {Delimiters} from "./delimiters";

interface INode {

  set(path: string | number, value?: any): Node;

  write(path: string[], value: string): Node;

  path: string[];
}

export class Node implements INode {

  _path: string[]

  // @ts-ignore
  constructor( parent: Node | null, text: string, delimiter: Delimiters = undefined) {

  }

  set(path: string | number, value?: any): Node {

    // If there is only one argument we make sure the path exists and return it
    if (arguments.length == 1) {
      return this.ensure(path);
    }

    if (typeof path === "string") {

      if (Array.isArray(value)) {
        // If the value is an array, write each item in the array using the index of the item as an additional
        // step in the path.
        for (let i = 0, l = value.length; i < l; i++) {
          this.set(path + "." + (i + 1), value[i]);
        }
      }
      else {
        this.write(this.preparePath(path), this.prepareValue(value));
      }

      return this;
    } else if (typeof path === "number") {

      if (Array.isArray(value)) {
        // If the value is an array, write each item in the array using the index of the item as an additional
        // step in the path.
        let child = this.ensure(path);
        for (let i = 0, l = value.length; i < l; i++) {
          child.set(i, value[i]);
        }
        return this;
      }
      else {
         // this.setChild(this.createChild(this.prepareValue(value), path), path);
      }

      return this;
    }

    throw new Error("Path must be a string or number.");
  }

  // @ts-ignore
  protected ensure(path: string | number): Node {

  }

  write(path: string[], value: string): Node {
    this.setDirty();
    return this.writeCore(path, value == null ? "" : value);
  }

  // @ts-ignore
  protected writeCore(path: string[], value: string): Node {

  }

  protected setDirty(): void {

  }

  // @ts-ignore
  protected preparePath(path: string): string[] {
    let parts = path.split(".");
    if (parts[0] == "") {
      parts.shift();
      parts = this.path.concat(parts);
    }

    if (!this._isSubPath(parts)) {
      throw new Error("'" + parts.toString() + "' is not a sub-path of '" + this.path.toString() + "'");
    }

    return this._remainderOf(parts);
  }

  private _isSubPath(other: string[]): boolean {

    if(this.path.length >= other.length) return false;

    var path = this.path;
    for(var i = 0, l = path.length; i < l; i++) {
      if(path[i] != other[i]) return false;
    }

    return true;
  }

  private _remainderOf(other: string[]): string[] {

    var path = this.path;
    return other.slice(path.length);
  }

  get path(): string[] {

    if (this._path) {
      return this._path;
    }
    return this._path = this.pathCore();
  }

  protected pathCore(): string[] {
    throw new Error("Not implemented");
  }

  // @ts-ignore
  protected prepareValue(value: any): string {
    console.log(value)
  }

  protected addChild(text: string): Node {
    console.log(text)
    return this
  }


}