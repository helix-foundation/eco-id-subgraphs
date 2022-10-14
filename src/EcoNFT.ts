import { store, crypto } from "@graphprotocol/graph-ts";
import {
  EcoNFT,
  InitializeEcoNFT,
  Mint as MintEvent,
  RegisterClaim as RegisterClaimEvent,
  Transfer as TransferEvent,
  UnregisterClaim as UnregisterClaimEvent
} from "../generated/EcoNFT/EcoNFT"
import {
    NFT,
    NFTContract,
    VerifiedClaim,
    Verifier
} from "../generated/schema"


export function handleInitializeEcoNFT(event: InitializeEcoNFT): void {
    const ecoNFT = new NFTContract(event.address.toHexString());

    const nftContract = EcoNFT.bind(event.address);

    ecoNFT.META_LIMIT = nftContract.META_LIMIT();
    ecoNFT.NFT_IMAGE_URL = nftContract.NFT_IMAGE_URL();
    ecoNFT.EXTERNAL_IMAGE_URL = nftContract.NFT_EXTERNAL_URL();
    ecoNFT.name = nftContract.name();
    ecoNFT.symbol = nftContract.symbol();

    ecoNFT.save();
}

export function handleMint(event: MintEvent): void {
    const nftContract = EcoNFT.bind(event.address);
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
    }
    verifiedClaim.feeAmount = event.params.feeAmount;
    verifiedClaim.recipient = event.params.recipient;
    verifiedClaim.claim = event.params.claim;
    verifiedClaim.save();

    const verifier = new Verifier(`${event.params.claim}-${event.params.verifier.toHexString()}`);
    verifier.revocable = event.params.revocable;
    verifier.address = event.params.verifier;
    verifier.claim = event.params.claim;
    verifier.save();

}

export function handleUnregisterClaim(event: UnregisterClaimEvent): void {
    store.remove("Verifier", `${event.params.claim}-${event.params.verifier.toHexString()}`);
}