import { Globals } from "../generated/schema";

import { NewInflationMultiplier, ECO } from "../generated/templates/ECO/ECO";

export function handleNewInflationMultiplier(event: NewInflationMultiplier): void {
    const ecoContract = ECO.bind(event.address);

    let globals = Globals.load("0");
    if (globals) {
        globals.currentInflationMultiplier = ecoContract.getPastLinearInflation(event.block.number);
        globals.save();
    }
}