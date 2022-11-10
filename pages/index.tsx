import createStore from "zustand";
import { immer } from "zustand/middleware/immer";

enum EquipementSlot {
    Helmet = "Helmet",
    Armor = "Armor",
    Weapon = "Weapon",
    Shield = "Shield",
    Legs = "Legs",
    Boots = "Boots",
}

enum ImbuementPower {
    Basic,
    Intricate,
    Powerfull,
}

enum ImbuementType {
    Vampirism = "Vampirism",
    Void = "Void",
}

enum Item {
    VampireTeeth = "Vampire Theet",
    BloodyPincers = "Bloody Pincers",
    DeadBrain = "Dead Brain",
    RopeBelt = "Rope Belt",
    SilencerClaws = "Silencer Claws",
    GrimeeLeechWings = "GrimeeLeech Wings",
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

const imbuementsPerSlot = {
    [EquipementSlot.Helmet]: [EquipementSlot.Helmet],
    [EquipementSlot.Armor]: [ImbuementType.Vampirism],
    [EquipementSlot.Weapon]: [ImbuementType.Vampirism, EquipementSlot.Helmet],
    [EquipementSlot.Shield]: [],
    [EquipementSlot.Legs]: [],
    [EquipementSlot.Boots]: [],
};

const imbuementTypesData: { [imbtype in ImbuementType]: ImbuementTypeData } = {
    [ImbuementType.Vampirism]: {
        effectName: "Life Leech",
        effectValues: [5, 10, 25],
        items: [
            [
                {
                    item: Item.VampireTeeth,
                    quantity: 25,
                },
            ],
            [
                {
                    item: Item.BloodyPincers,
                    quantity: 15,
                },
            ],
            [
                {
                    item: Item.DeadBrain,
                    quantity: 5,
                },
            ],
        ],
    },
    [ImbuementType.Void]: {
        effectName: "Mana Leech",
        effectValues: [3, 5, 8],
        items: [
            [
                {
                    item: Item.RopeBelt,
                    quantity: 25,
                },
            ],
            [
                {
                    item: Item.SilencerClaws,
                    quantity: 15,
                },
            ],
            [
                {
                    item: Item.GrimeeLeechWings,
                    quantity: 5,
                },
            ],
        ],
    },
};

// Add previous power items to next powers
for (const imbuementType in ImbuementType) {
    // @ts-ignore
    const data: ImbuementTypeData = imbuementTypesData[imbuementType];

    data.items[ImbuementPower.Intricate].push(
        ...data.items[ImbuementPower.Basic]
    );
    data.items[ImbuementPower.Powerfull].push(
        ...data.items[ImbuementPower.Intricate]
    );
}

// TODO: save/load from localstorage
const itemPrices: { [item in Item]: number } = {
    [Item.VampireTeeth]: 2500,
    [Item.BloodyPincers]: 1500,
    [Item.DeadBrain]: 14000,
    [Item.RopeBelt]: 2700,
    [Item.SilencerClaws]: 2500,
    [Item.GrimeeLeechWings]: 1700,
};

function formatGold(gold: number): string {
    return new Intl.NumberFormat("es-CL").format(gold) + " gp";
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
    type: ImbuementType
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

    const price = pricePerPower[imbuement.power];

    imbuement.total = imbuement.itemsTotal + price.price + price.noFailureFee;

    return imbuement;
}

type ImbuementStore = {
    imbuements: Imbuement[];
    addImbuement: () => void;
    changeImbuement: (
        index: number,
        power: ImbuementPower,
        type: ImbuementType
    ) => void;
};

const useImbuementsStore = createStore(
    immer<ImbuementStore>((set) => ({
        imbuements: [],
        addImbuement: () =>
            set((state) => {
                state.imbuements.push(
                    createImbuement(
                        ImbuementPower.Basic,
                        ImbuementType.Vampirism
                    )
                );
            }),
        changeImbuement: (
            index: number,
            power: ImbuementPower,
            type: ImbuementType
        ) =>
            set((state) => {
                state.imbuements.splice(index, 1, createImbuement(power, type));
            }),
    }))
);

export default function Home() {
    const { imbuements, addImbuement, changeImbuement } = useImbuementsStore();

    const changeType = (index: number, type: ImbuementType) =>
        changeImbuement(index, imbuements[index].power, type);

    const changePower = (index: number, power: ImbuementPower) =>
        changeImbuement(index, power, imbuements[index].type);

    const items: ItemData[] = [];
    let grandTotal = 0;

    for (const imbuement of imbuements) {
        grandTotal += imbuement.total;

        for (const itemData of imbuement.items) {
            const index = items.findIndex(
                (_item) => _item.item === itemData.item
            );

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
                <button onClick={addImbuement}>+</button>
                <h1>Imbuements</h1>

                <table border={1}>
                    <thead>
                        <tr>
                            <th>Power</th>
                            <th>Type</th>
                            <th>Effect</th>
                            <th>Cost</th>
                            <th>Total Items</th>
                            <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {imbuements.map((imbuement, i) => (
                            <tr key={i}>
                                <td>
                                    <select
                                        onChange={(e) =>
                                            changePower(
                                                i,
                                                e.currentTarget.value as any
                                            )
                                        }
                                    >
                                        {Object.entries(ImbuementPower)
                                            .filter(
                                                ([key]) => !isNaN(Number(key))
                                            ) // enum with no explicit value
                                            .map(([key, name]) => (
                                                <option key={key} value={key}>
                                                    {name}
                                                </option>
                                            ))}
                                    </select>
                                </td>

                                <td>
                                    <select
                                        onChange={(e) =>
                                            changeType(
                                                i,
                                                e.currentTarget.value as any
                                            )
                                        }
                                    >
                                        {Object.entries(ImbuementType).map(
                                            ([key, name]) => (
                                                <option key={key} value={key}>
                                                    {name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </td>

                                <td>
                                    <span>
                                        {
                                            imbuementTypesData[imbuement.type]
                                                .effectName
                                        }

                                        {imbuementTypesData[imbuement.type]
                                            .effectValues[imbuement.power] +
                                            " %"}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        title={
                                            pricePerPower[imbuement.power]
                                                .price +
                                            " + " +
                                            pricePerPower[imbuement.power]
                                                .noFailureFee +
                                            " (100%) "
                                        }
                                    >
                                        {formatGold(
                                            pricePerPower[imbuement.power]
                                                .price +
                                                pricePerPower[imbuement.power]
                                                    .noFailureFee
                                        )}
                                    </span>
                                </td>

                                <td>
                                    <span>
                                        {formatGold(imbuement.itemsTotal)}
                                    </span>
                                </td>

                                <td>
                                    <span>{formatGold(imbuement.total)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2>Total: {formatGold(grandTotal)}</h2>
            </article>

            <article>
                <h1>Items needed</h1>

                <ul style={{ margin: 0, padding: 0 }}>
                    {items.map((itemData, i) => (
                        <li
                            key={i}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "9rem min-content 1fr 1fr",
                            }}
                        >
                            {itemData.item}{" "}
                            <input
                                type="number"
                                value={itemData.quantity}
                                disabled
                            />
                            <input
                                type="number"
                                value={itemPrices[itemData.item]}
                                disabled
                            />
                            <span
                                style={{ display: "block", wordWrap: "normal" }}
                            >
                                =
                                {formatGold(
                                    itemPrices[itemData.item] *
                                        itemData.quantity
                                )}
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

function ImbuementLine({
    total,
    items,
    setItems,
    setTotal,
}: ImbuementLineProps) {}
