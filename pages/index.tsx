import { useState } from "react";

enum ImbuementPower {
    Basic,
    Intricate,
    Powerfull,
}

enum ImbuementType {
    Vampirism = "Vampirism",
    Void = "Void",
}

enum Items {
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
    item: Items;
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

const imbuementTypesData: { [imbtype in ImbuementType]: ImbuementTypeData } = {
    [ImbuementType.Vampirism]: {
        effectName: "Life Leech",
        effectValues: [5, 10, 25],
        items: [
            [
                {
                    item: Items.VampireTeeth,
                    quantity: 25,
                },
            ],
            [
                {
                    item: Items.BloodyPincers,
                    quantity: 15,
                },
            ],
            [
                {
                    item: Items.DeadBrain,
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
                    item: Items.RopeBelt,
                    quantity: 25,
                },
            ],
            [
                {
                    item: Items.SilencerClaws,
                    quantity: 15,
                },
            ],
            [
                {
                    item: Items.GrimeeLeechWings,
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
const itemPrices: { [item in Items]: number } = {
    [Items.VampireTeeth]: 2500,
    [Items.BloodyPincers]: 1500,
    [Items.DeadBrain]: 14000,
    [Items.RopeBelt]: 2700,
    [Items.SilencerClaws]: 2500,
    [Items.GrimeeLeechWings]: 1700,
};

function formatGold(gold: number): string {
    return new Intl.NumberFormat("es-CL").format(gold) + " gp";
}

export default function Home() {
    const [imbuementPower, setImbuementPower] = useState<ImbuementPower>(
        ImbuementPower.Basic
    );
    const [imbuementType, setImbuementType] = useState<ImbuementType>(
        ImbuementType.Vampirism
    );

    const priceData = pricePerPower[imbuementPower];

    const imbuementTypeData = imbuementTypesData[imbuementType];

    const items = imbuementTypeData.items[imbuementPower];

    let totalItemPrice = 0;

    for (const { item, quantity } of items) {
        totalItemPrice += itemPrices[item] * quantity;
    }

    return (
        <main>
            <article>
                <h1>Imbuements</h1>

                <div
                    style={{
                        display: "flex",
                    }}
                >
                    <select
                        onChange={(e) =>
                            setImbuementPower(e.currentTarget.value as any)
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

                    <select
                        onChange={(e) =>
                            setImbuementType(e.currentTarget.value as any)
                        }
                    >
                        {Object.entries(ImbuementType).map(([key, name]) => (
                            <option key={key} value={key}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        style={{ width: "80px" }}
                        value={imbuementTypesData[imbuementType].effectName}
                        disabled
                    />

                    <input
                        type="text"
                        style={{ width: "80px" }}
                        value={
                            imbuementTypesData[imbuementType].effectValues[
                                imbuementPower
                            ] + " %"
                        }
                        disabled
                    />
                    <input
                        type="text"
                        style={{ width: "80px" }}
                        value={formatGold(priceData.price)}
                        disabled
                    />
                    <input
                        type="text"
                        style={{ width: "80px" }}
                        value={formatGold(priceData.noFailureFee)}
                        disabled
                    />

                    <input
                        type="text"
                        style={{ width: "80px" }}
                        value={formatGold(totalItemPrice)}
                        disabled
                    />
                </div>
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
