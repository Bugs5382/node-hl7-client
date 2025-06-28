export interface HL7_DG1 {
  /** Diagnosis Id
   * @since 4.0.0 */
  dg1_1?: string;
  /** Diagnosis Id
   * @since 4.0.0 */
  diagnosisId?: string;
  /** Diagnosis Coding Method
   * @since 4.0.0 */
  dg1_2: string;
  /** Diagnosis Coding Method
   * @since 4.0.0 */
  diagnosisCodingMethod?: string;
  /** Diagnosis Code
   * @since 4.0.0 */
  dg1_3?: string;
  /** Diagnosis Code
   * @since 4.0.0 */
  diagnosisCode?: string;
  /** Diagnosis Description
   * @since 4.0.0 */
  dg1_4?: string;
  /** Diagnosis Description
   * @since 4.0.0 */
  diagnosisDescription?: string;
  /** Diagnosis Timestamp
   * @default Uses current new Date()
   * @since 4.0.0 */
  dg1_5?: Date;
  /** Diagnosis Timestamp
   * @default Uses current new Date()
   * @since 4.0.0 */
  timeStamp?: Date;
  /** Diagnosis Type
   * @since 4.0.0 */
  dg1_6?: string;
  /** Diagnosis Type
   * @since 4.0.0 */
  diagnosisType?: string;
  /** Diagnosis Major Category
   * @since 4.0.0 */
  dg1_7?: string;
  /** Diagnosis Major Category
   * @since 4.0.0 */
  diagnosisMajorCategory?: string;
  /** Diagnosis Related Group
   * @since 4.0.0 */
  dg1_8?: string;
  /** Diagnosis Related Group
   * @since 4.0.0 */
  diagnosisRelatedGroup?: string;
  /** Diagnosis Approval Indicator
   * @since 4.0.0 */
  dg1_9?: string;
  /** Diagnosis Approval Indicator
   * @since 4.0.0 */
  diagnosisApprovalIndicator?: string;
  /** Diagnosis Grouper Review Code
   * @since 4.0.0 */
  dg1_10?: string;
  /** Diagnosis Grouper Review Code
   * @since 4.0.0 */
  diagnosisGrouperReviewCode?: string;
  /** Diagnosis Outlier Type
   * @since 4.0.0 */
  dg1_11?: string;
  /** Diagnosis Outlier Type
   * @since 4.0.0 */
  diagnosisOutlierType?: string;
  /** Diagnosis Outlier Days
   * @since 4.0.0 */
  dg1_12?: string;
  /** Diagnosis Outlier Days
   * @since 4.0.0 */
  diagnosisOutlierDays?: string;
  /** Diagnosis Outlier Cost
   * @since 4.0.0 */
  dg1_13?: string;
  /** Diagnosis Outlier Cost
   * @since 4.0.0 */
  diagnosisOutlierCost?: string;
  /** Diagnosis Grouper Version and Type
   * @since 4.0.0 */
  dg1_14?: string;
  /** Diagnosis Grouper Version and Type
   * @since 4.0.0 */
  diagnosisGrouperVersionAndType?: string;
}
