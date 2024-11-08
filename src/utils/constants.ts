/** @internal */
export const PROTOCOL_MLLP_HEADER = Buffer.from([0x0B])

/** @internal */
export const PROTOCOL_MLLP_END = Buffer.from([0x1C])

/** @internal */
export const PROTOCOL_MLLP_FOOTER = Buffer.from([0x0D])

/** @internal */
export const NAME_FORMAT = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/ //eslint-disable-line
