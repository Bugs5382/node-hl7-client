export interface HL7_MSH {
  /** Sending Application
   * @since 4.0.0 */
  msh_3?: string;
  /** Sending Application
   * @since 4.0.0 */
  sendingApplication?: string;
  /** Sending Facility
   * @since 4.0.0 */
  msh_4?: string;
  /** Sending Application
   * @since 4.0.0 */
  sendingFacility?: string;
  /** Receiving Application
   * @since 4.0.0 */
  msh_5?: string;
  /** Receiving Application
   * @since 4.0.0 */
  receivingApplication?: string;
  /** Receiving Facility
   * @since 4.0.0 */
  msh_6?: string;
  /** Receiving Facility
   * @since 4.0.0 */
  receivingFacility?: string;
  /** Date of Message
   * @remarks Equivalent to 'timeStamp'
   * @defailt Current Date/Time
   * @since 4.0.0 */
  msh_7?: Date;
  /** Date of Message
   * @remarks Equivalent to MSH.7
   * @defailt Current Date/Time
   * @since 4.0.0 */
  timeStamp?: Date;
  /** Security
   * @remarks Optional, String Data
   * @since 4.0.0 */
  msh_8?: string;
  /** Security
   * @remarks Optional, String Data
   * @since 4.0.0 */
  security?: string;
  /** Processing ID
   * @since 1.0.0 */
  msh_11: "P" | "T";
  /** Processing ID
   * @since 4.0.0 */
  processingId: "P" | "T";
}
