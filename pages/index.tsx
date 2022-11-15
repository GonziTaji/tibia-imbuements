import { useEffect } from 'react';
import createStore from 'zustand';
import { immer } from 'zustand/middleware/immer';

const pricesStorageKey = 'ti_item_prices';

enum EquipementSlot {
    Helmet = 'Helmet',
    Armor = 'Armor',
    Weapon = 'Weapon',
    Shield = 'Shield',
    Legs = 'Legs',
    Boots = 'Boots',
}

enum ImbuementPower {
    Basic,
    Intricate,
    Powerfull,
}

enum ImbuementType {
    None = 'None', // For easy blank selection
    Vampirism = 'Vampirism',
    Void = 'Void',
    Strike = 'Strike',
    Bash = 'Bash',
}

enum Item {
    VampireTeeth = 'Vampire Theet',
    BloodyPincers = 'Bloody Pincers',
    DeadBrain = 'Dead Brain',
    RopeBelt = 'Rope Belt',
    SilencerClaws = 'Silencer Claws',
    GrimeeLeechWings = 'GrimeeLeech Wings',
    ProtectiveCharms = 'Protective Charms',
    Sabreteeth = 'Sabreteeth',
    VexclawTalon = 'Vexclaw Talon',
    CyclopsToes = 'Cyclops Toes',
    OgreNoseRing = 'Ogre Norse Ring',
    WarmastersWristguards = 'Warmaster WristGuards',
}

type ImbuementPrice = {
    price: number;
    noFailureFee: number;
};

type ItemData = {
    item: Item;
    quantity: number;
};

type ImbuementTypeData = {
    effectName: string;
    effectValues: { [power in ImbuementPower]: number };
    items: {
        [power in ImbuementPower]: ItemData[];
    };
};

const pricePerPower: {
    [power in ImbuementPower]: ImbuementPrice;
} = {
    [ImbuementPower.Basic]: {
        price: 5000,
        noFailureFee: 10000,
    },
    [ImbuementPower.Intricate]: {
        price: 25000,
        noFailureFee: 25000,
    },
    [ImbuementPower.Powerfull]: {
        price: 100000,
        noFailureFee: 50000,
    },
};

const imbuementsPerSlot: { [slot in EquipementSlot]: ImbuementType[] } = {
    [EquipementSlot.Helmet]: [ImbuementType.Void, ImbuementType.Bash],
    [EquipementSlot.Armor]: [ImbuementType.Vampirism],
    [EquipementSlot.Weapon]: [ImbuementType.Vampirism, ImbuementType.Void, ImbuementType.Strike, ImbuementType.Bash],
    [EquipementSlot.Shield]: [],
    [EquipementSlot.Legs]: [],
    [EquipementSlot.Boots]: [],
};

const imbuementTypesData: { [imbtype in ImbuementType]: ImbuementTypeData } = {
    [ImbuementType.None]: {
        effectName: '',
        effectValues: [0, 0, 0],
        items: [[], [], []],
    },
    [ImbuementType.Vampirism]: {
        effectName: 'Life Leech',
        effectValues: [5, 10, 25],
        items: [
            [{ item: Item.VampireTeeth, quantity: 25 }],
            [{ item: Item.BloodyPincers, quantity: 15 }],
            [{ item: Item.DeadBrain, quantity: 5 }],
        ],
    },
    [ImbuementType.Void]: {
        effectName: 'Mana Leech',
        effectValues: [3, 5, 8],
        items: [
            [{ item: Item.RopeBelt, quantity: 25 }],
            [{ item: Item.SilencerClaws, quantity: 15 }],
            [{ item: Item.GrimeeLeechWings, quantity: 5 }],
        ],
    },
    [ImbuementType.Strike]: {
        effectName: 'Critical damage (prob. 10%)',
        effectValues: [15, 25, 50],
        items: [
            [{ item: Item.ProtectiveCharms, quantity: 20 }],
            [{ item: Item.Sabreteeth, quantity: 25 }],
            [{ item: Item.VexclawTalon, quantity: 5 }],
        ],
    },
    [ImbuementType.Bash]: {
        effectName: 'Club Fighting',
        effectValues: [1, 2, 4],
        items: [
            [{ item: Item.CyclopsToes, quantity: 20 }],
            [{ item: Item.OgreNoseRing, quantity: 15 }],
            [{ item: Item.WarmastersWristguards, quantity: 10 }],
        ],
    },
};

// Add previous power items to next powers
for (const imbuementType in ImbuementType) {
    // @ts-ignore
    const data: ImbuementTypeData = imbuementTypesData[imbuementType];

    data.items[ImbuementPower.Intricate].push(...data.items[ImbuementPower.Basic]);
    data.items[ImbuementPower.Powerfull].push(...data.items[ImbuementPower.Intricate]);
}

// TODO: save/load from localstorage
const baseItemPrices: { [item in Item]: number } = {
    [Item.VampireTeeth]: 1500,
    [Item.BloodyPincers]: 5800,
    [Item.DeadBrain]: 14000,
    [Item.RopeBelt]: 3000,
    [Item.SilencerClaws]: 2500,
    [Item.GrimeeLeechWings]: 1500,
    [Item.ProtectiveCharms]: 2000,
    [Item.Sabreteeth]: 4200,
    [Item.VexclawTalon]: 1400,
    [Item.CyclopsToes]: 150,
    [Item.OgreNoseRing]: 1000,
    [Item.WarmastersWristguards]: 1000,
};

function formatGold(gold: number): string {
    return new Intl.NumberFormat('es-CL').format(gold) + ' gp';
}

type Imbuement = {
    power: ImbuementPower;
    type: ImbuementType;
    items: Array<ItemData>;
    itemsTotal: number;
    total: number;
};

function createImbuement(
    power: ImbuementPower,
    type: ImbuementType,
    itemPrices: { [item in Item]: number }
): Imbuement {
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

    if (imbuement.type === ImbuementType.None) {
        imbuement.total = imbuement.itemsTotal; // Should be 0
    } else {
        const price = pricePerPower[imbuement.power];

        imbuement.total = imbuement.itemsTotal + price.price + price.noFailureFee;
    }

    return imbuement;
}

type ImbuementStore = {
    slots: {
        [slot in EquipementSlot]: {
            imbuements: Imbuement[];
            slotQuantity: number;
        };
    };
    itemPrices: { [item in Item]: number };
    changeImbuement: (slot: EquipementSlot, index: number, power: ImbuementPower, type: ImbuementType) => void;
    changeSlotQuantity: (slot: EquipementSlot, quantity: number) => void;
    changePrice: (item: Item, price: number) => void;
    loadPrices: () => void;
};

const useImbuementsStore = createStore(
    immer<ImbuementStore>((set) => ({
        slots: {
            [EquipementSlot.Helmet]: { imbuements: [], slotQuantity: 2 },
            [EquipementSlot.Armor]: { imbuements: [], slotQuantity: 2 },
            [EquipementSlot.Weapon]: { imbuements: [], slotQuantity: 3 },
            [EquipementSlot.Shield]: { imbuements: [], slotQuantity: 2 },
            [EquipementSlot.Legs]: { imbuements: [], slotQuantity: 2 },
            [EquipementSlot.Boots]: { imbuements: [], slotQuantity: 1 },
        },
        imbuements: [],
        itemPrices: baseItemPrices,
        changeSlotQuantity: (slot, quantity) =>
            set((state) => {
                const currentQuantity = state.slots[slot].imbuements.length;

                if (currentQuantity > quantity) {
                    state.slots[slot].imbuements = state.slots[slot].imbuements.slice(1, quantity + 1);
                } else if (currentQuantity < quantity) {
                    for (let i = currentQuantity; i < quantity; i++) {
                        state.slots[slot].imbuements.push(
                            createImbuement(ImbuementPower.Basic, ImbuementType.None, state.itemPrices)
                        );
                    }
                }

                state.slots[slot].slotQuantity = quantity;
            }),
        changeImbuement: (slot: EquipementSlot, index: number, power: ImbuementPower, type: ImbuementType) =>
            set((state) => {
                const imbuements = state.slots[slot].imbuements;

                const indexOfExisting = imbuements.findIndex((imb) => imb.type === type);

                if (indexOfExisting !== -1 && indexOfExisting !== index) {
                    imbuements.splice(
                        indexOfExisting,
                        1,
                        createImbuement(imbuements[indexOfExisting].power, ImbuementType.None, state.itemPrices)
                    );
                }

                imbuements.splice(index, 1, createImbuement(power, type, state.itemPrices));
            }),
        changePrice: (item: Item, price: number) =>
            set((state) => {
                state.itemPrices[item] = price;

                for (const slot in EquipementSlot) {
                    const slotImbuements = state.slots[slot as EquipementSlot].imbuements;

                    for (let i = 0; i < slotImbuements.length; i++) {
                        const imbuement = slotImbuements[i];
                        const usesItem = imbuementTypesData[imbuement.type].items[ImbuementPower.Powerfull].some(
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
                                state.itemPrices[item as Item] = storageItemPrices[item];
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
    useEffect(() => loadPrices(), []);

    const allImbuements = Object.values(slots).flatMap((slot) => slot.imbuements);

    const changeType = (slot: EquipementSlot, index: number, type: ImbuementType) =>
        changeImbuement(slot, index, slots[slot].imbuements[index].power, type);

    const changePower = (slot: EquipementSlot, index: number, power: ImbuementPower) =>
        changeImbuement(slot, index, power, slots[slot].imbuements[index].type);

    const items: ItemData[] = [];
    let grandTotal = 0;

    for (const imbuement of allImbuements) {
        if (imbuement.type !== ImbuementType.None) {
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

                {Object.entries(imbuementsPerSlot).map(([slot, availableTypes]) => {
                    // help
                    const eqSlot = slot as EquipementSlot;
                    return (
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
                                    onChange={(e) => changeSlotQuantity(slot as any, Number(e.currentTarget.value))}
                                    value={slots[eqSlot].slotQuantity}
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
                                    {slots[eqSlot].imbuements.map((imbuement, i) => (
                                        <tr key={i}>
                                            <td>
                                                <select
                                                    onChange={(e) =>
                                                        changeType(eqSlot, i, e.currentTarget.value as any)
                                                    }
                                                    value={imbuement.type}
                                                >
                                                    <option key={ImbuementType.None} value={ImbuementType.None}>
                                                        -- No selection
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
                                                    onChange={(e) =>
                                                        changePower(eqSlot, i, e.currentTarget.value as any)
                                                    }
                                                >
                                                    {Object.entries(ImbuementPower)
                                                        .filter(([key]) => !isNaN(Number(key))) // enum with no explicit value
                                                        .map(([key, name]) => (
                                                            <option key={key} value={key}>
                                                                {name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </td>

                                            <td>
                                                <span>
                                                    {imbuementTypesData[imbuement.type].effectName}

                                                    {imbuementTypesData[imbuement.type].effectValues[imbuement.power] +
                                                        ' %'}
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
                    );
                })}

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
