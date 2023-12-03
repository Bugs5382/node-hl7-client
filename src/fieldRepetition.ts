import {Component} from "./component.js";
import {Delimiters} from "./decorators/enum/delimiters.js";
import {Node} from  "./decorators/interfaces/node.js"
import {HL7FatalError} from "./exception.js";
import {NodeBase} from "./nodeBase.js";
import {ValueNode} from "./valueNode.js";

/**
 * Create a Field Repetition in an HL7 message segment
 * @since 1.0.0
 * @extends ValueNode
 */
export class FieldRepetition extends ValueNode {

    /**
     * @since 1.0.0
     * @param parent
     * @param key
     * @param text
     */
    constructor(parent: NodeBase, key: string, text: string) {
        super(parent, key, text, Delimiters.Component);
    }

    /**
     * Read Path
     * @since 1.0.0
     * @param path
     */
    read(path: string[]): Node {
        let component = this.children[parseInt(<string>path.shift())-1];
        return component && path.length > 0 ? component.read(path) : component;
    }

    /**
     * Write Core
     * @since 1.0.0
     * @param path
     * @param value
     * @protected
     */
    protected writeCore(path: string[], value: string): Node {
        return this.writeAtIndex(path, value, parseInt(<string>path.shift())-1);
    }

    /**
     * Get Path Core
     * @since 1.0.0
     * @protected
     */
    protected pathCore(): string[] {
        if (this.parent == null) {
            throw new HL7FatalError(500, "this.parent must not be null.")
        }
        return this.parent.path;
    }

    /**
     * Create child of a field repetition
     * @since 1.0.0
     * @param text
     * @param index
     * @see {@link Component}
     * @protected
     */
    protected createChild(text: string, index: number): Node {
        return new Component(this, (index + 1).toString(), text);
    }
}