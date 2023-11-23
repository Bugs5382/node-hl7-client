import EventEmitter from "events";



export class Field extends EventEmitter {
  /** @internal */
  _data: string | string[] | {}
  /** @internal */
  _dataType?: any;
  /** @internal */
  _internalName: string
  /** @internal */
  _name?: string;

  /**
   *
   * @since 1.0.0
   * @param data
   * @param name */
  constructor(data: string | string[] | {}, name: string) {
    super();

    this._data = data
    this._internalName = name

    // @todo Assign Long name based of field and HL7 Standards Types
    // @todo Assign Field types

  }

  /**
   * Get Name of Field based off HL7 Spec being used.
   * @description This is not fully implemented yet.
   * @example is_patient_name
   * @since 1.0.0*/
  // async getName(): Promise<string> {
  //
  // }

  /**
   * Get field Data Type
   * @description This is not fully implemented yet.
   *  */
  // async getDataType(): Promise<any> {
  //
  // }

  /** Get Value of Field
   * @since 1.0.0*/
  async getValue(): Promise<string | string[] | {}> {
    this.emit('field.getValue')
    return this._data
  }


}