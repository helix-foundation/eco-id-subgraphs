import { BigInt, log } from "@graphprotocol/graph-ts"
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
    TokenRelease
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
    ecoClaim.POINTS_MULTIPLIER = claimContract.POINTS_MULTIPLIER();
    ecoClaim.trustedVerifier = claimContract._trustedVerifier();
    ecoClaim.VESTING_DIVIDER = claimContract.VESTING_DIVIDER();

    let multiples: BigInt[] = [];
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("0")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("1")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("2")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("3")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("4")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("5")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("6")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("7")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("8")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("9")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("10")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("11")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("12")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("13")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("14")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("15")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("16")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("17")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("18")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("19")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("20")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("21")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("22")));
    multiples.push(claimContract._vestedMultiples(BigInt.fromString("23")));
    ecoClaim.vestedMultiples = multiples;

    ecoClaim.save();

    const globals = new Globals("0");
    globals.ecoClaim = ecoClaim.id;
    globals.ecoID = claimContract._ecoID().toHexString();
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
    const claimBalance = claimContract._claimBalances(event.params.socialID);
    claim.points = claimBalance.value1; // points
    claim.claimTime = claimBalance.value2; // claimtime
    claim.claimContract = event.params.addr.toHexString();

    claim.save();
}

export function handleReleaseVesting(event: ReleaseVesting): void {
    let index = event.transaction.input.toString().indexOf("twitter");
    if (index < 0) {
        index = event.transaction.input.toString().indexOf("discord");
    }
    const socialID = event.transaction.input.toString().substring(index);

    const release = new TokenRelease(event.transaction.hash.toHexString());
    release.verifiedClaim = socialID;
    release.recipient = event.params.addr;
    release.gasPayer = event.params.gasPayer;
    release.amountEco = event.params.ecoBalance;
    release.amountEcox = event.params.vestedEcoXBalance;
    release.feeAmount = event.params.feeAmount;
    release.claimTime = event.block.timestamp;
    release.claimContract = event.address.toHexString();
    
    release.save();
}