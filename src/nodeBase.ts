import {EmptyNode} from "./emptyNode.js";
import {HL7FatalError} from "./exception.js";
import * as Util from "./utils.js";
import {Delimiters} from "./decorators/enum/delimiters.js";
import { Node } from "./decorators/interfaces/node.js";
import {Message} from "./message.js";

/**
 * Node Base
 * @since 1.0.0
 * @internal
 */
export class NodeBase implements Node {

    protected parent: NodeBase | null;

    private _name: string;
    private _text: string;
    private readonly _delimiter: Delimiters | undefined;
    private _delimiterText: string;
    private _children: Node[];
    private _message: Message | undefined;
    private _path: string[];
    private _dirty: boolean;

    constructor(parent: NodeBase | null, text: string = "", delimiter: Delimiters | undefined = undefined) {

        this.parent = parent

        this._children = []
        this._delimiter = delimiter
        this._delimiterText = ""
        this._dirty = false
        this._message = undefined
        this._name = ""
        this._path = []
        this._text = text
    }


    static empty = new EmptyNode();

    get(path: string | number): Node {

        let ret: any;

        if (typeof path === "number") {
            if (path >= 0 && path < this.children.length) {
                 ret = this.children[path];
            }
        } else if (path !== "") {
            ret = this.read(this.preparePath(path));
        }

        return ret || NodeBase.empty as Node;
    }

    set(path: string | number, value?: any): Node {

        /** If there is only one argument, we make sure the path exists and return it. */
        if (arguments.length == 1) {
            return this.ensure(path);
        }

        if (typeof path === "string") {

            if (Array.isArray(value)) {
                /** If the value is an array, write each item in the array using the index of the item as an additional
                step in the path. */
                for (let i = 0, l = value.length; i < l; i++) {
                    this.set(path + "." + (i + 1), value[i]);
                }
            } else {
                this.write(this.preparePath(path), this.prepareValue(value));
            }

            return this;
        } else if (Util.isNumber(path)) {

            if (Array.isArray(value)) {
                /** If the value is an array, write each item in the array using the index of the item as an additional
                step in the path. */
                let child = this.ensure(path);
                for (let i = 0, l = value.length; i < l; i++) {
                    child.set(i, value[i]);
                }
                return this;
            } else {
                this.setChild(this.createChild(this.prepareValue(value), path), path);
            }

            return this;
        }

        throw new HL7FatalError(500, "Path must be a string or number.");
    }

    get name(): string {
        if(this._name !== undefined) return this._name;
        return this._name = this.path.join(".");
    }

    get length(): number {
        return this.children.length;
    }

    toDate(): Date {
        throw new Error("Method not implemented.");
    }
    toInteger(): number {
        throw new Error("Method not implemented.");
    }
    toFloat(): number {
        throw new Error("Method not implemented.");
    }
    toBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    toString(): string {
        return this.toRaw();
    }

    toRaw(): string {
        if (!this._dirty) {
            return this._text || "";
        }
        this._dirty = false;
        return this._text = this.children.map(x => x.toRaw()).join(this.delimiter);
    }

    toArray(): Node[] {
        // @review This has been changed from: return [].concat(this.children);
        return this.children;
    }

    forEach(callback: (value: Node, index: number) => void): void {
        let children = this.children;
        for(let i = 0, l = children.length; i < l; i++) {
            callback(children[i], i);
        }
    }

    exists(path: string | number): boolean {
        let value = this.get(path);
        if (value == null) {
            return false;
        }
        return !value.isEmpty();
    }

    isEmpty(): boolean {
        return this.children.length == 0;
    }

    protected ensure(path: string | number): Node {
        let ret = this.get(path);
        if (ret != NodeBase.empty) {
            return ret;
        }
        if (typeof path === "number") {
            return this.setChild(this.createChild("", path), path);
        } else if (Util.isString(path)) {
            return this.write(this.preparePath(path), "");
        }
        throw new HL7FatalError(500, "There seems to be a problem.")
    }

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

    protected prepareValue(value: any): string {

        if(value == null) return "";

        if(typeof value === "string") {
            if (typeof this.message !== 'undefined') {
                return this.message.escape(value);
            }
        }

        if(typeof value === "number") {
            return value.toString();
        }

        if(typeof value === "boolean") {
            return value ? "Y" : "N";
        }

        if(value instanceof Date) {
            return this._formatDateTime(value);
        }

        return value.toString();
    }

    protected get message(): Message | undefined {
        if(this._message) return this._message;
        this._message = this.parent ? this.parent.message : <any>this;
        return this._message
    }

    read(_path: string[]): Node {
        throw new Error("Method not implemented.");
    }

    write(path: string[], value: string): Node {
        this.setDirty();
        return this.writeCore(path, value == null ? "" : value);
    }

    protected writeCore(_path: string[], _value: string): Node {
        throw new Error("Method not implemented.");
    }

    protected writeAtIndex(path: string[], value: string, index: number, emptyValue = ""): Node {

        let child: Node;

        if (path.length == 0) {
            child = this.createChild(value || emptyValue, index);
        } else {
            // check if we already have a child at that index
            if (index < this.children.length) {
                child = this.children[index];
            } else {
                // if not, create a new one
                child = this.createChild(emptyValue, index);
            }
        }

        this.setChild(child, index);

        if (path.length != 0) {
            return child.write(path, value);
        }

        return child;
    }

    get path(): string[] {
        if(this._path) return this._path;
        return this._path = this.pathCore();
    }

    protected pathCore(): string[] {
        throw new Error("Method not implemented.");
    }

    protected get delimiter(): string {
        if (this._delimiterText) {
            return this._delimiterText;
        }
        if (typeof this._delimiter == 'undefined') {
            throw new HL7FatalError(500, "this._delimiter is somehow undefined.")
        }

        if (typeof this.message == "undefined") {
            throw new Error("this.message is not defined.")
        }

        this._delimiterText = this.message.delimiters[this._delimiter];
        return this._delimiterText
    }

    protected get children(): Node[] {
        if (this._text !== ''  && this._children.length === 0) {
            let parts = this._text.split(this.delimiter);
            let children = new Array(parts.length);
            for (let i = 0, l = parts.length; i < l; i++) {
                children[i] = this.createChild(parts[i], i);
            }
            this._children = children;
        }
        return this._children;
    }

    protected addChild<T extends Node>(text: string): T {
        this.setDirty();
        let child = <T>this.createChild(text, this.children.length);
        this.children.push(child);
        return child;
    }

    protected createChild(_text: string, _index: number): Node {
        throw new Error("Method not implemented.");
    }

    protected setChild(child: Node, index: number): Node {
        this.setDirty();
        let children = this.children;
        /** if we already have a child at that index, then replace it. */
        if (index < children.length) {
            children[index] = child;
            return child;
        }
        /** otherwise, fill the @children array with empty children for any indexes between the end of the list
         and the specified index. */
        for (let i = children.length; i < index; i++) {
            children.push(this.createChild("", i));
        }
        children.push(child);
        return child;
    }

    protected setDirty(): void {
        if (!this._dirty) {
            this._dirty = true;
            if (this.parent) {
                this.parent.setDirty();
            }
        }
    }

    private _isSubPath(other: string[]): boolean {
        if (this.path.length >= other.length) {
            return false;
        }
        let path = this.path;
        for (let i = 0, l = path.length; i < l; i++) {
            if (path[i] != other[i]) {
                return false;
            }
        }
        return true;
    }

    private _remainderOf(other: string[]): string[] {
        let path = this.path;
        return other.slice(path.length);
    }

    private _formatDateTime(date: Date): string {
        // check if there is a time component
        if (date.getHours() != 0 || date.getMinutes() != 0 || date.getSeconds() != 0 || date.getMilliseconds() != 0) {
            return this._formatDate(date) + Util.pad(date.getHours(), 2) + Util.pad(date.getMinutes(), 2) + Util.pad(date.getSeconds(), 2);
        }
        return this._formatDate(date);
    }

    private _formatDate(date: Date): string {
        return date.getFullYear().toString() + Util.pad(date.getMonth() + 1, 2) + Util.pad(date.getDate(), 2);
    }
}