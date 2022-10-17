import { BigInt } from "@graphprotocol/graph-ts"
import {
  EcoClaim,
  InitializeEcoClaim,
  Claim as ClaimEvent,
  ReleaseVesting
} from "../generated/EcoClaim/EcoClaim"

import { ECO as EcoTemplate } from "../generated/templates";

import {
    TokenClaim,
    Globals,
    ClaimContract,
    Release
} from "../generated/schema"

export function handleInitializeEcoClaim(event: InitializeEcoClaim): void {
    const claimContract = EcoClaim.bind(event.address);

    const ecoClaim = new ClaimContract(event.address.toHexString());
    ecoClaim.CLAIMABLE_PERIOD = claimContract.CLAIMABLE_PERIOD();
    ecoClaim.POINTS_TO_ECOX_RATIO = claimContract.POINTS_TO_ECOX_RATIO();
    ecoClaim.VESTING_PERIOD = claimContract.VESTING_PERIOD();
    ecoClaim.claimingEndsAt = claimContract._claimableEndTime();
    ecoClaim.initialInflationMultiplier = claimContract._initialInflationMultiplier();
    ecoClaim.pointsMerkleRoot = claimContract._pointsMerkleRoot();
    ecoClaim.pointsMultiplier = claimContract._pointsMultiplier();
    ecoClaim.trustedVerifier = claimContract._trustedVerifier();
    ecoClaim.vestingDivider = claimContract._vestingDivider();

    let multiples: BigInt[] = [];
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("0")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("1")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("2")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("3")));
    ecoClaim.vestedMultiples = multiples;

    ecoClaim.save();

    const globals = new Globals("0");
    globals.ecoClaim = ecoClaim.id;
    globals.ecoNFT = claimContract._ecoNft().toHexString();
    globals.eco = claimContract._eco();
    globals.ecox = claimContract._ecoX();
    globals.currentInflationMultiplier = ecoClaim.initialInflationMultiplier;
    globals.save();

    EcoTemplate.create(claimContract._eco());
}

export function handleClaim(event: ClaimEvent): void {
    const claim = new TokenClaim(event.params.socialID);
    claim.verifiedClaim = event.params.socialID;
    claim.recipient = event.params.addr;
    claim.amountEco =  event.params.eco;
    claim.amountEcox = event.params.ecox;

    const claimContract = EcoClaim.bind(event.address);
    const claimBalance = claimContract._claimBalances(event.params.addr);
    claim.points = claimBalance.value0; // points
    claim.claimTime = claimBalance.value1; // claimtime
    claim.claimContract = event.params.addr.toHexString();

    claim.save();
}

export function handleReleaseVesting(event: ReleaseVesting): void {
    const release = new Release(event.transaction.hash.toHexString());

    release.recipient = event.params.addr;
    release.gasPayer = event.params.gasPayer;
    release.amountEco = event.params.ecoBalance;
    release.amountEcox = event.params.vestedEcoXBalance;
    release.feeAmount = event.params.feeAmount;
    release.claimContract = event.address.toHexString();

    release.save();
}
