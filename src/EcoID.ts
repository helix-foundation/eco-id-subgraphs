import { BigInt, store } from "@graphprotocol/graph-ts";
import {
  EcoID,
  InitializeEcoID,
  Mint as MintEvent,
  RegisterClaim as RegisterClaimEvent,
  Transfer as TransferEvent,
  UnregisterClaim as UnregisterClaimEvent
} from "../generated/EcoID/EcoID"
import {
    NFT,
    NFTContract,
    VerifiedClaim,
    Claim,
    Verifier
} from "../generated/schema"


export function handleInitializeEcoID(event: InitializeEcoID): void {
    const ecoID = new NFTContract(event.address.toHexString());

    const nftContract = EcoID.bind(event.address);

    ecoID.META_LIMIT = nftContract.META_LIMIT();
    ecoID.NFT_IMAGE_URL = nftContract.NFT_IMAGE_URL();
    ecoID.EXTERNAL_IMAGE_URL = nftContract.NFT_EXTERNAL_URL();
    ecoID.name = nftContract.name();
    ecoID.symbol = nftContract.symbol();

    ecoID.save();
}

export function handleMint(event: MintEvent): void {
    const nftContract = EcoID.bind(event.address);
    const tokenClaim = nftContract._tokenClaimIDs(event.params.tokenID);

    const nft = new NFT(event.params.tokenID.toString());

    nft.verifiedClaim = `${tokenClaim.value1}-${tokenClaim.value0.toHexString()}`;
    nft.recipient = event.params.recipient;
    nft.tokenID = event.params.tokenID;
    nft.tokenURI = nftContract.tokenURI(event.params.tokenID);
    nft.nftContract = event.address.toHexString()
    nft.save();
}

export function handleRegisterClaim(event: RegisterClaimEvent): void {
    const claimID = `${event.params.claim}-${event.params.recipient.toHexString()}`;

    // load claim string and update nonce
    let claim = Claim.load(event.params.claim);
    if (!claim) {
        claim = new Claim(event.params.claim);
        claim.nonce = 0;
    }
    claim.nonce = claim.nonce + 1;
    claim.save();

    let verifiedClaim = VerifiedClaim.load(claimID);
    if (!verifiedClaim) {
        verifiedClaim = new VerifiedClaim(claimID);
    }
    else if (verifiedClaim.nft) {
        const nft = NFT.load(verifiedClaim.nft!);
        // update nft tokenURI with new verifier (registrations that happen after mint)
        if (nft) {
            const nftContract = EcoID.bind(event.address);
            nft.tokenURI = nftContract.tokenURI(nft.tokenID);
            nft.save();
        }
    }
    verifiedClaim.feeAmount = event.params.feeAmount;
    verifiedClaim.recipient = event.params.recipient;
    verifiedClaim.claim = event.params.claim;
    verifiedClaim.save();

    const verifier = new Verifier(`${claimID}-${event.params.verifier.toHexString()}`);
    verifier.revocable = event.params.revocable;
    verifier.address = event.params.verifier;
    verifier.verifiedClaim = claimID;
    verifier.save();
}

export function handleUnregisterClaim(event: UnregisterClaimEvent): void {
    const claimID = `${event.params.claim}-${event.params.recipient.toHexString()}`;
    store.remove("Verifier", `${claimID}-${event.params.verifier.toHexString()}`);
    const verifiedClaim = VerifiedClaim.load(claimID);
    if (verifiedClaim) {
        // update nonce for claim string
        const claim = Claim.load(event.params.claim);
        if (claim) {
            claim.nonce = claim.nonce + 1;
            claim.save();
        }
        if (verifiedClaim.nft) {
            const nft = NFT.load(verifiedClaim.nft!);
            // update nft tokenURI without verifier
            if (nft) {
                const nftContract = EcoID.bind(event.address);
                nft.tokenURI = nftContract.tokenURI(nft.tokenID);
                nft.save();
            }
        }
    }
}