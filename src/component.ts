import Node from './node';
import Delimiters from "./delimiters";
import ValueNode from "./valueNode";
import SubComponent from "./subComponent";
import NodeBase from './nodeBase';

export default class Component extends ValueNode {

    constructor(parent: NodeBase, key: string, text: string) {
        super(parent, key, text, Delimiters.SubComponent);
    }

    read(path: string[]): Node {

        return this.children[parseInt(path.shift())-1];
    }

    protected writeCore(path: string[], value: string): Node {

        return this.writeAtIndex(path, value, parseInt(path.shift())-1);
    }

    protected createChild(text: string, index: number): Node {

        return new SubComponent(this, (index + 1).toString(), text);
    }
}