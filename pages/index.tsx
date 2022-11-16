import { useEffect } from 'react';
import createStore from 'zustand';
import { immer } from 'zustand/middleware/immer';

const pricesStorageKey = 'ti_item_prices';

const EQUIPEMENT_SLOT = {
    Helmet: 'Helmet',
    Armor: 'Armor',
    Weapon: 'Weapon',
    Shield: 'Shield',
    Legs: 'Legs',
    Boots: 'Boots',
};

const IMBUEMENT_POWER = {
    Basic: 0,
    Intricate: 1,
    Powerfull: 2,
};

const IMBUEMENT_TYPE = {
    None: 'None', // For easy blank selection
    Vampirism: 'Vampirism',
    Void: 'Void',
    Strike: 'Strike',
    Bash: 'Bash',
};

const ITEM = {
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

type ImbuementPrice = {
    price: number;
    noFailureFee: number;
};

type ItemData = {
    item: string;
    quantity: number;
};

type ImbuementTypeData = {
    effectName: string;
    effectValues: number[];
    items: ItemData[][];
};

const pricePerPower: {
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

const imbuementsPerSlot: { [slot: string]: string[] } = {
    [EQUIPEMENT_SLOT.Helmet]: [IMBUEMENT_TYPE.Void, IMBUEMENT_TYPE.Bash],
    [EQUIPEMENT_SLOT.Armor]: [IMBUEMENT_TYPE.Vampirism],
    [EQUIPEMENT_SLOT.Weapon]: [
        IMBUEMENT_TYPE.Vampirism,
        IMBUEMENT_TYPE.Void,
        IMBUEMENT_TYPE.Strike,
        IMBUEMENT_TYPE.Bash,
    ],
    [EQUIPEMENT_SLOT.Shield]: [],
    [EQUIPEMENT_SLOT.Legs]: [],
    [EQUIPEMENT_SLOT.Boots]: [],
};

const imbuementTypesData: { [type: string]: ImbuementTypeData } = {
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
            [{ item: ITEM.SilencerClaws, quantity: 15 }],
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
const baseItemPrices: { [item: string]: number } = {
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

function formatGold(gold: number): string {
    return new Intl.NumberFormat('es-CL').format(gold) + ' gp';
}

type Imbuement = {
    power: number;
    type: string;
    items: Array<ItemData>;
    itemsTotal: number;
    total: number;
};

function createImbuement(power: number, type: string, itemPrices: { [item: string]: number }): Imbuement {
    const imbuementTypeData = imbuementTypesData[type];

    const imbuement = {
        power,
        type,
        items: imbuementTypeData.items[power],
        itemsTotal: 0,
        total: 0,
    };

    for (const { item, quantity } of imbuement.items) {
        imbuement.itemsTotal += itemPrices[item] * quantity;
    }

    if (imbuement.type === IMBUEMENT_TYPE.None) {
        imbuement.total = imbuement.itemsTotal; // Should be 0
    } else {
        const price = pricePerPower[imbuement.power];

        imbuement.total = imbuement.itemsTotal + price.price + price.noFailureFee;
    }

    return imbuement;
}

type ImbuementStore = {
    slots: {
        [slot: string]: {
            imbuements: Imbuement[];
            slotQuantity: number;
        };
    };
    itemPrices: { [item: string]: number };
    changeImbuement: (slot: string, index: number, power: number, type: string) => void;
    changeSlotQuantity: (slot: string, quantity: number) => void;
    changePrice: (item: string, price: number) => void;
    loadPrices: () => void;
};

const useImbuementsStore = createStore(
    immer<ImbuementStore>((set) => ({
        slots: {
            [EQUIPEMENT_SLOT.Helmet]: { imbuements: [], slotQuantity: 0 },
            [EQUIPEMENT_SLOT.Armor]: { imbuements: [], slotQuantity: 0 },
            [EQUIPEMENT_SLOT.Weapon]: { imbuements: [], slotQuantity: 0 },
            [EQUIPEMENT_SLOT.Shield]: { imbuements: [], slotQuantity: 0 },
            [EQUIPEMENT_SLOT.Legs]: { imbuements: [], slotQuantity: 0 },
            [EQUIPEMENT_SLOT.Boots]: { imbuements: [], slotQuantity: 0 },
        },
        imbuements: [],
        itemPrices: baseItemPrices,
        changeSlotQuantity: (slot, quantity) =>
            set((state) => {
                const currentQuantity = state.slots[slot].imbuements.length;

                if (currentQuantity > quantity) {
                    state.slots[slot].imbuements = state.slots[slot].imbuements.slice(0, quantity);
                } else if (currentQuantity < quantity) {
                    for (let i = currentQuantity; i < quantity; i++) {
                        state.slots[slot].imbuements.push(
                            createImbuement(IMBUEMENT_POWER.Basic, IMBUEMENT_TYPE.None, state.itemPrices)
                        );
                    }
                }

                state.slots[slot].slotQuantity = quantity;
            }),
        changeImbuement: (slot: string, index: number, power: number, type: string) =>
            set((state) => {
                const imbuements = state.slots[slot].imbuements;

                const indexOfExisting = imbuements.findIndex((imb) => imb.type === type);

                if (indexOfExisting !== -1 && indexOfExisting !== index) {
                    imbuements.splice(
                        indexOfExisting,
                        1,
                        createImbuement(imbuements[indexOfExisting].power, IMBUEMENT_TYPE.None, state.itemPrices)
                    );
                }

                imbuements.splice(index, 1, createImbuement(power, type, state.itemPrices));
            }),
        changePrice: (item: string, price: number) =>
            set((state) => {
                state.itemPrices[item] = price;

                for (const slot in EQUIPEMENT_SLOT) {
                    const slotImbuements = state.slots[slot as string].imbuements;

                    for (let i = 0; i < slotImbuements.length; i++) {
                        const imbuement = slotImbuements[i];
                        const usesItem = imbuementTypesData[imbuement.type].items[IMBUEMENT_POWER.Powerfull].some(
                            (_item) => _item.item === item
                        );

                        if (usesItem) {
                            slotImbuements[i] = createImbuement(imbuement.power, imbuement.type, state.itemPrices);
                        }
                    }
                }

                localStorage.setItem(pricesStorageKey, JSON.stringify(state.itemPrices));
            }),
        loadPrices: () =>
            set((state) => {
                const storageItemPricesStr = localStorage.getItem(pricesStorageKey);

                if (storageItemPricesStr) {
                    try {
                        const storageItemPrices = JSON.parse(storageItemPricesStr);

                        for (const item in baseItemPrices) {
                            if (storageItemPrices[item]) {
                                state.itemPrices[item] = storageItemPrices[item];
                            }
                        }
                    } catch (e) {
                        console.error('UH OH! Item prices from local storage could not be loaded', e);
                        localStorage.removeItem(pricesStorageKey);
                    }
                }
            }),
    }))
);

export default function Home() {
    const { slots, itemPrices, changeImbuement, changeSlotQuantity, changePrice, loadPrices } = useImbuementsStore();

    // Todo: load saved prices outside component or something. Just get rid of this lol
    useEffect(() => loadPrices(), [loadPrices]);

    const allImbuements = Object.values(slots).flatMap((slot) => slot.imbuements);

    const changeType = (slot: string, index: number, type: string) =>
        changeImbuement(slot, index, slots[slot].imbuements[index].power, type);

    const changePower = (slot: string, index: number, power: number) =>
        changeImbuement(slot, index, power, slots[slot].imbuements[index].type);

    const items: ItemData[] = [];
    let grandTotal = 0;

    for (const imbuement of allImbuements) {
        if (imbuement.type !== IMBUEMENT_TYPE.None) {
            grandTotal += imbuement.total;
        }

        for (const itemData of imbuement.items) {
            const index = items.findIndex((_item) => _item.item === itemData.item);

            if (index === -1) {
                items.push({
                    item: itemData.item,
                    quantity: itemData.quantity,
                });
            } else {
                items[index].quantity += itemData.quantity;
            }
        }
    }

    return (
        <main>
            <article>
                <h1>Imbuements</h1>

                {Object.entries(imbuementsPerSlot).map(([slot, availableTypes]) => (
                    <div key={slot} style={{ display: 'flex' }}>
                        <div style={{ border: '1px solid black', marginLeft: '0.2rem', padding: '0.2rem' }}>
                            <span
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    minWidth: '5rem',
                                }}
                            >
                                <b>{slot.toUpperCase()}</b>
                            </span>
                            <label htmlFor="slot-quantity">Slots: </label>
                            <input
                                type="number"
                                min={0}
                                max={3}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => changeSlotQuantity(slot as any, Number(e.currentTarget.value))}
                                value={slots[slot].slotQuantity}
                            />
                        </div>

                        <table style={{ marginBottom: '1rem' }}>
                            <thead>
                                <tr>
                                    <th>Power</th>
                                    <th>Type</th>
                                    <th>Effect</th>
                                    {/* <th>Cost</th>
                                    <th>Item Cost</th>
                                    <th>Total</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {slots[slot].imbuements.map((imbuement, i) => (
                                    <tr key={i}>
                                        <td>
                                            <select
                                                onChange={(e) => changeType(slot, i, e.currentTarget.value as any)}
                                                value={imbuement.type}
                                            >
                                                <option key={IMBUEMENT_TYPE.None} value={IMBUEMENT_TYPE.None}>
                                                    -- None
                                                </option>
                                                {availableTypes.map((value, i) => (
                                                    <option key={i} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <select
                                                onChange={(e) => changePower(slot, i, e.currentTarget.value as any)}
                                            >
                                                {Object.entries(IMBUEMENT_POWER).map(([name, value]) => (
                                                    <option key={name} value={value}>
                                                        {name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <span>
                                                {imbuementTypesData[imbuement.type].effectValues[imbuement.power] +
                                                    '% '}

                                                {imbuementTypesData[imbuement.type].effectName}
                                            </span>
                                        </td>

                                        {/* <td>
                                            <span
                                                title={
                                                    pricePerPower[imbuement.power].price +
                                                    ' + ' +
                                                    pricePerPower[imbuement.power].noFailureFee +
                                                    ' (100%) '
                                                }
                                            >
                                                {formatGold(
                                                    pricePerPower[imbuement.power].price +
                                                        pricePerPower[imbuement.power].noFailureFee
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span>{formatGold(imbuement.itemsTotal)}</span>
                                        </td>

                                        <td>
                                            <span>{formatGold(imbuement.total)}</span>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                <h2>Total: {formatGold(grandTotal)}</h2>
            </article>

            <article>
                <h1>Items needed</h1>

                <ul style={{ margin: 0, padding: 0 }}>
                    {items.map((itemData, i) => (
                        <li
                            key={i}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '9rem min-content 1fr 1fr',
                            }}
                        >
                            {itemData.item} <input type="number" value={itemData.quantity} disabled />
                            <input
                                type="number"
                                value={itemPrices[itemData.item]}
                                onChange={(e) => changePrice(itemData.item, parseInt(e.currentTarget.value))}
                            />
                            <span style={{ display: 'block', wordWrap: 'normal' }}>
                                ={formatGold(itemPrices[itemData.item] * itemData.quantity)}
                            </span>
                        </li>
                    ))}
                </ul>
            </article>
        </main>
    );
}

interface ImbuementLineProps {
    total: number;
    setTotal: (value: number) => void;
    items: ItemData[];
    setItems: (value: ItemData[]) => void;
}

function ImbuementLine({ total, items, setItems, setTotal }: ImbuementLineProps) {}
