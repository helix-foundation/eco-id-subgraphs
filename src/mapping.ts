import { BigInt } from "@graphprotocol/graph-ts"
import {
  EcoClaim,
  Claim,
  OwnershipTransferred,
  ReleaseVesting
} from "../generated/EcoClaim/EcoClaim"
import { ExampleEntity } from "../generated/schema"

export function handleClaim(event: Claim): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.socialID = event.params.socialID
  entity.addr = event.params.addr

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.CLAIMABLE_PERIOD(...)
  // - contract.POINTS_TO_ECOX_RATIO(...)
  // - contract.VESTING_PERIOD(...)
  // - contract._claimBalances(...)
  // - contract._claimableEndTime(...)
  // - contract._claimedBalances(...)
  // - contract._deployTimestamp(...)
  // - contract._eco(...)
  // - contract._ecoNft(...)
  // - contract._ecoX(...)
  // - contract._initialInflationMultiplier(...)
  // - contract._pointsMerkleRoot(...)
  // - contract._pointsMultiplier(...)
  // - contract._trustedVerifier(...)
  // - contract._vestedMultiples(...)
  // - contract._vestingDivider(...)
  // - contract.owner(...)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleReleaseVesting(event: ReleaseVesting): void {}
