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

    nft.claim = tokenClaim.value1;
    nft.recipient = event.params.recipient;
    nft.tokenID = event.params.tokenID;
    nft.tokenURI = nftContract.tokenURI(event.params.tokenID);
    nft.nftContract = event.address.toHexString()
    nft.save();
}

export function handleRegisterClaim(event: RegisterClaimEvent): void {
    let verifiedClaim = VerifiedClaim.load(event.params.claim);
    if (!verifiedClaim) {
        verifiedClaim = new VerifiedClaim(event.params.claim);
        verifiedClaim.nonce = 0;
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
    verifiedClaim.nonce = verifiedClaim.nonce + 1;
    verifiedClaim.save();

    const verifier = new Verifier(`${event.params.claim}-${event.params.verifier.toHexString()}`);
    verifier.revocable = event.params.revocable;
    verifier.address = event.params.verifier;
    verifier.claim = event.params.claim;
    verifier.save();

}

export function handleUnregisterClaim(event: UnregisterClaimEvent): void {
    store.remove("Verifier", `${event.params.claim}-${event.params.verifier.toHexString()}`);

    const verifiedClaim = VerifiedClaim.load(event.params.claim);
    if (verifiedClaim) {
        verifiedClaim.nonce = verifiedClaim.nonce + 1;
        verifiedClaim.save();

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