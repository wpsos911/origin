import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'

async function disputeOffer(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)

  const tx = contracts.marketplaceExec.methods
    .dispute(listingId, offerId, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from
    })
  return txHelper({
    tx,
    mutation: 'disputeOffer'
  })
}

export default disputeOffer
