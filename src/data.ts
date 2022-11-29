import { ImbuementPrice, ImbuementTypeData } from './types';

export const EQUIPEMENT_SLOT = {
    Helmet: 'Helmet',
    Armor: 'Armor',
    Weapon: 'Weapon',
    Shield: 'Shield',
    // Legs: 'Legs', // No legs with imbuement
    Boots: 'Boots',
};

export const IMBUEMENT_POWER = {
    Basic: 0,
    Intricate: 1,
    Powerfull: 2,
};

export const IMBUEMENT_TYPE = {
    None: 'None', // For easy blank selection
    Vampirism: 'Vampirism',
    Void: 'Void',
    Strike: 'Strike',
    Bash: 'Bash',
};

export const ITEM = {
    VampireTeeth: 'Vampire Theet',
    BloodyPincers: 'Bloody Pincers',
    DeadBrain: 'Dead Brain',
    RopeBelt: 'Rope Belt',
    SilencerClaws: 'Silencer Claws',
    GrimeeLeechWings: 'GrimeeLeech Wings',
    ProtectiveCharms: 'Protective Charms',
    Sabreteeth: 'Sabreteeth',
    VexclawTalon: 'Vexclaw Talon',
    CyclopsToes: 'Cyclops Toes',
    OgreNoseRing: 'Ogre Norse Ring',
    WarmastersWristguards: 'Warmaster WristGuards',
};

export const pricePerPower: {
    [power: string]: ImbuementPrice;
} = {
    [IMBUEMENT_POWER.Basic]: {
        price: 5000,
        noFailureFee: 10000,
    },
    [IMBUEMENT_POWER.Intricate]: {
        price: 25000,
        noFailureFee: 25000,
    },
    [IMBUEMENT_POWER.Powerfull]: {
        price: 100000,
        noFailureFee: 50000,
    },
};

export const imbuementsPerSlot: { [slot: string]: string[] } = {
    [EQUIPEMENT_SLOT.Helmet]: [IMBUEMENT_TYPE.Void, IMBUEMENT_TYPE.Bash],
    [EQUIPEMENT_SLOT.Armor]: [IMBUEMENT_TYPE.Vampirism],
    [EQUIPEMENT_SLOT.Weapon]: [
        IMBUEMENT_TYPE.Vampirism,
        IMBUEMENT_TYPE.Void,
        IMBUEMENT_TYPE.Strike,
        IMBUEMENT_TYPE.Bash,
    ],
    [EQUIPEMENT_SLOT.Shield]: [],
    [EQUIPEMENT_SLOT.Boots]: [],
};

export const imbuementTypesData: { [type: string]: ImbuementTypeData } = {
    [IMBUEMENT_TYPE.None]: {
        effectName: '',
        effectValues: [0, 0, 0],
        items: [[], [], []],
    },
    [IMBUEMENT_TYPE.Vampirism]: {
        effectName: 'Life Leech',
        effectValues: [5, 10, 25],
        items: [
            [{ item: ITEM.VampireTeeth, quantity: 25 }],
            [{ item: ITEM.BloodyPincers, quantity: 15 }],
            [{ item: ITEM.DeadBrain, quantity: 5 }],
        ],
    },
    [IMBUEMENT_TYPE.Void]: {
        effectName: 'Mana Leech',
        effectValues: [3, 5, 8],
        items: [
            [{ item: ITEM.RopeBelt, quantity: 25 }],
            [{ item: ITEM.SilencerClaws, quantity: 25 }],
            [{ item: ITEM.GrimeeLeechWings, quantity: 5 }],
        ],
    },
    [IMBUEMENT_TYPE.Strike]: {
        effectName: 'Critical damage (prob. 10%)',
        effectValues: [15, 25, 50],
        items: [
            [{ item: ITEM.ProtectiveCharms, quantity: 20 }],
            [{ item: ITEM.Sabreteeth, quantity: 25 }],
            [{ item: ITEM.VexclawTalon, quantity: 5 }],
        ],
    },
    [IMBUEMENT_TYPE.Bash]: {
        effectName: 'Club Fighting',
        effectValues: [1, 2, 4],
        items: [
            [{ item: ITEM.CyclopsToes, quantity: 20 }],
            [{ item: ITEM.OgreNoseRing, quantity: 15 }],
            [{ item: ITEM.WarmastersWristguards, quantity: 10 }],
        ],
    },
};

// Add previous power items to next powers
for (const imbuementType in IMBUEMENT_TYPE) {
    // @ts-ignore
    const data: ImbuementTypeData = imbuementTypesData[imbuementType];

    data.items[IMBUEMENT_POWER.Intricate].push(...data.items[IMBUEMENT_POWER.Basic]);
    data.items[IMBUEMENT_POWER.Powerfull].push(...data.items[IMBUEMENT_POWER.Intricate]);
}

// TODO: save/load from localstorage
export const baseItemPrices: { [item: string]: number } = {
    [ITEM.VampireTeeth]: 1500,
    [ITEM.BloodyPincers]: 5800,
    [ITEM.DeadBrain]: 14000,
    [ITEM.RopeBelt]: 3000,
    [ITEM.SilencerClaws]: 2500,
    [ITEM.GrimeeLeechWings]: 1500,
    [ITEM.ProtectiveCharms]: 2000,
    [ITEM.Sabreteeth]: 4200,
    [ITEM.VexclawTalon]: 1400,
    [ITEM.CyclopsToes]: 150,
    [ITEM.OgreNoseRing]: 1000,
    [ITEM.WarmastersWristguards]: 1000,
};
