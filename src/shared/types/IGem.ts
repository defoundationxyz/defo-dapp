interface IGem { 
    MintTime: number,
    LastReward: number,
    LastMaintained: number,
    GemType: 0 | 1 | 2, 
    TaperCount: number,
    booster: 0 | 1 | 2, // Node Booster 0 -> None , 1 -> Delta , 2 -> Omega
    claimedReward: number
}

export default IGem