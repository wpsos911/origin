import Users from '../src/resources/users'
import { Attestations } from '../src/resources/attestations'
import AttestationObject from '../src/models/attestation'
import ContractService from '../src/services/contract-service'
import IpfsService from '../src/services/ipfs-service'
import { expect } from 'chai'
import Web3 from 'web3'

const issuerPrivatekey =
  '0000000000000000000000000000000000000000000000000000000000000001'

const generateAttestation = async ({
  identityAddress,
  web3,
  topic,
  data
}) => {
  data = Web3.utils.soliditySha3(data)
  const msg = Web3.utils.soliditySha3(identityAddress, topic, data)
  const signing = web3.eth.accounts.sign(msg, issuerPrivatekey)
  const signature = signing.signature
  return new AttestationObject({ topic, data, signature })
}

const invalidAttestation = new AttestationObject({
  topic: 123,
  data: Web3.utils.sha3('gibberish'),
  signature:
    '0x4e8feba65cbd88fc246013da8dfb478e880518594d86349f54af9c8d5e2eac2b223222c4c6b93f18bd54fc88f4342f1b02a8ea764a411fc02823a3420574375c1c'
})

describe('User Resource', function() {
  this.timeout(10000) // default is 2000
  let users
  let phoneAttestation
  let emailAttestation
  let facebookAttestation
  let twitterAttestation
  // let airbnbAttestation

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()
    const contractService = new ContractService({ web3 })
    await contractService.deployed(contractService.contracts.OriginIdentity)
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    const attestations = new Attestations({ contractService })
    users = new Users({ contractService, ipfsService })

    // clear user before each test because blockchain persists between tests
    // sort of a hack to force clean state at beginning of each test
    const userRegistry = await contractService.deployed(
      contractService.contracts.V00_UserRegistry
    )
    await userRegistry.methods.clearUser().send({ from: accounts[0] })

    const identityAddress = await attestations.getIdentityAddress(accounts[0])
    phoneAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 10,
      data: 'phone verified'
    })
    emailAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 11,
      data: 'email verified'
    })
    facebookAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 3,
      data: 'facebook verified'
    })
    twitterAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 4,
      data: 'twitter verified'
    })
    // airbnbAttestation = await generateAttestation({
    //   identityAddress,
    //   web3,
    //   topic: 5,
    //   data: 'airbnb verified'
    // })
  })

  describe('set', () => {
    it('should be able to deploy new identity', async () => {
      await users.set({
        profile: { claims: { name: 'Wonder Woman' } }
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(0)
      expect(user.profile.claims.name).to.equal('Wonder Woman')
    })

    it('should be able to update profile and claims after creation', async () => {
      await users.set({
        profile: { claims: { name: 'Iron Man' } }
      })
      let user = await users.get()

      expect(user.attestations.length).to.equal(0)
      expect(user.profile.claims.name).to.equal('Iron Man')

      await users.set({
        profile: { claims: { name: 'Black Panther' } },
        attestations: [phoneAttestation]
      })
      user = await users.get()

      expect(user.attestations.length).to.equal(1)
      expect(user.profile.claims.name).to.equal('Black Panther')

      await users.set({
        profile: { claims: { name: 'Batman' } }
      })
      user = await users.get()

      expect(user.attestations.length).to.equal(1)
      expect(user.profile.claims.name).to.equal('Batman')

      await users.set({
        attestations: [phoneAttestation, emailAttestation]
      })
      user = await users.get()

      expect(user.attestations.length).to.equal(2)
      expect(user.profile.claims.name).to.equal('Batman')
    })

    it('should be able to deploy new identity with 2 presigned claims', async () => {
      // This is actually 2 claims because profile info is 1 claim
      await users.set({
        profile: { claims: { name: 'Black Widow' } },
        attestations: [phoneAttestation]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(1)
      expect(user.profile.claims.name).to.equal('Black Widow')
    })

    it('should be able to deploy new identity with 3 presigned claims', async () => {
      await users.set({
        profile: { claims: { name: 'Black Widow' } },
        attestations: [phoneAttestation, emailAttestation]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(2)
      expect(user.profile.claims.name).to.equal('Black Widow')
    })

    it('should be able to deploy new identity with 4 presigned claims', async () => {
      await users.set({
        profile: { claims: { name: 'Black Widow' } },
        attestations: [phoneAttestation, emailAttestation, facebookAttestation]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(3)
      expect(user.profile.claims.name).to.equal('Black Widow')
    })

    it('should be able to deploy new identity with 5 presigned claims', async () => {
      await users.set({
        profile: { claims: { name: 'Black Widow' } },
        attestations: [
          phoneAttestation,
          emailAttestation,
          facebookAttestation,
          twitterAttestation
          // TODO support additional attestations. Currently can't handle more than 5
        ]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(4)
      expect(user.profile.claims.name).to.equal('Black Widow')
    })

    it('should ignore invalid claims', async () => {
      await users.set({
        profile: { claims: { name: 'Deadpool' } },
        attestations: [phoneAttestation, emailAttestation, invalidAttestation]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(2)
      expect(user.profile.claims.name).to.equal('Deadpool')
    })
  })

  describe('get', () => {
    it('should reflect the current state of the user', async () => {
      await users.set({
        profile: { claims: { name: 'Groot' } }
      })
      let user = await users.get()

      expect(user.attestations.length).to.equal(0)
      expect(user.profile.claims.name).to.equal('Groot')

      await users.set({
        profile: { claims: { name: 'Baby Groot' } },
        attestations: [phoneAttestation]
      })
      user = await users.get()

      expect(user.attestations.length).to.equal(1)
      expect(user.profile.claims.name).to.equal('Baby Groot')
    })
  })
})
