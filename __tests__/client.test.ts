import { Client } from '../src'

describe('node hl7 client', () => {

  describe('sanity tests - client class', () => {

    test(`error - hostname has to be string`, async  () => {
      try {
        // @ts-expect-error this is not a string
        new Client({hostname: 351123})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not valid string.')
      }
    })

    test(`error - ipv4 and ipv6 both can not be true exist`, async  () => {
      try {
        new Client({hostname: '5.8.6.1', ipv6: true, ipv4: true})
      } catch (err: any) {
        expect(err.message).toBe('ipv4 and ipv6 both can\'t be set to be both used exclusively.')
      }
    })

    test(`error - ipv4 not valid address`, async  () => {
      try {
        new Client({hostname: "123.34.52.455", ipv4: true})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not a valid IPv4 address.')
      }
    })

    test(`error - ipv4 valid address`, async  () => {
      try {
        new Client({hostname: "123.34.52.45", ipv4: true})
      } catch (err: any) {
        expect(err.message).toBeUndefined()
      }
    })

    test(`error - ipv6 not valid address`, async  () => {
      try {
        new Client({hostname: "2001:0db8:85a3:0000:zz00:8a2e:0370:7334", ipv6: true})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not a valid IPv6 address.')
      }
    })

    test(`error - ipv6 valid address`, async  () => {
      try {
        new Client({hostname: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", ipv6: true})
      } catch (err: any) {
        expect(err.message).toBeUndefined()
      }
    })

    test(`properties exist`, async  () => {
      const client = new Client({ hostname: 'hl7.server.com'})
      expect(client).toHaveProperty("connectToListener")
      expect(client).toHaveProperty("sendMessage")
    })

  })

  describe('sanity tests - listener class', () => {

    let client: Client

    beforeEach(() => {
      client = new Client({hostname: 'localhost'})
    })

    test('error - no port specified', async () => {

      try {
        // @ts-expect-error port is not specified
        client.connectToListener()
      } catch (err: any) {
        expect(err.message).toBe('port is not defined.')
      }

    })

    test('error - port not a number', async  () => {
      try {
        // @ts-expect-error port is not specified as a number
        client.connectToListener({ port: "12345"}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port is not valid number.')
      }
    })

    test('error - port less than 0', async () => {
      try {
        client.connectToListener({ port: -1}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port must be a number (0, 65353).')
      }
    })

    test('error - port greater than 65353', async () => {
      try {
        client.connectToListener({ port: 65354}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port must be a number (0, 65353).')
      }
    })

  })

  describe('basic listener tests', () => {

    test.todo('... should not be able to connect to the same port')

    test.todo('... two different ports')

  })

  describe('end to end testing', () => {

    test.todo('... send HL7 and get response back')

  })

})