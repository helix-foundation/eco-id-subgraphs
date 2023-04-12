import {
  EcoSeason,
  InitializeEcoClaim,
  Claim as ClaimEvent
} from "../generated/EcoSeason/EcoSeason"
import {
    Globals,
    SeasonClaim,
    SeasonContract
} from "../generated/schema";

export function handleInitializeEcoSeason(event: InitializeEcoClaim): void {
    const seasonContract = EcoSeason.bind(event.address);

    const ecoSeason = new SeasonContract(event.address.toHexString());
    ecoSeason.CLAIM_DURATION = seasonContract.CLAIM_DURATION();
    ecoSeason.claimingEndsAt = seasonContract._claimPeriodEnd();
    ecoSeason.initialInflationMultiplier = seasonContract._initialInflationMultiplier();
    ecoSeason.pointsMerkleRoot = seasonContract._pointsMerkleRoot();
    ecoSeason.POINTS_MULTIPLIER = seasonContract.POINTS_MULTIPLIER();
    ecoSeason.trustedVerifier = seasonContract._trustedVerifier();

    ecoSeason.save();

    const globals = Globals.load("0");
    if (globals) {
        globals.ecoSeason = event.address.toHexString();
        globals.save();
    }
}

export function handleClaim(event: ClaimEvent): void {
    const claim = new SeasonClaim(event.params.socialID);
    claim.verifiedClaim = `${event.params.socialID}-${event.params.addr.toHexString()}`;
    claim.recipient = event.params.addr;
    claim.amountEco =  event.params.eco;
    claim.claimTime = event.block.timestamp;

    claim.seasonContract = event.params.addr.toHexString();

    claim.save();
}
