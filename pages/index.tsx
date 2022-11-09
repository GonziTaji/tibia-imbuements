import { useState } from "react";
import { EnumType } from "typescript";

enum ImbuementPower {
    Basic = "Basic",
    Intricate = "Intricate",
    Powerfull = "Powerfull",
}
enum ImbuementType {
    Vampirism = "Vampirism",
}

enum Items {
    VampireTeeth = "Vampire Theet",
    BloodyPincers = "Bloody Pincers",
    DeadBrain = "Dead Brain",
}

type ImbuementPrice = {
    price: number;
    noFailureFee: number;
};

type ImbuementTypeData = {
    effectName: string;
    effectValues: { [power in ImbuementPower]: number };
    items: {
        [power in ImbuementPower]: {
            item: Items;
            quantity: number;
        }[];
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
        effectValues: {
            [ImbuementPower.Basic]: 5,
            [ImbuementPower.Intricate]: 10,
            [ImbuementPower.Powerfull]: 25,
        },
        items: {
            [ImbuementPower.Basic]: [
                {
                    item: Items.VampireTeeth,
                    quantity: 25,
                },
            ],
            [ImbuementPower.Intricate]: [
                {
                    item: Items.BloodyPincers,
                    quantity: 15,
                },
            ],
            [ImbuementPower.Powerfull]: [
                {
                    item: Items.DeadBrain,
                    quantity: 5,
                },
            ],
        },
    },
};

// Add previous power items to next powers
for (const imbuementType in ImbuementType) {
    // @ts-ignore
    const data: ImbuementTypeData = imbuementTypesData[imbuementType];

    data.items[ImbuementPower.Intricate].push(...data.items.Basic);
    data.items[ImbuementPower.Powerfull].push(...data.items.Intricate);
}

// TODO: save/load from localstorage
const itemPrices: { [item in Items]: number } = {
    [Items.VampireTeeth]: 2500,
    [Items.BloodyPincers]: 1500,
    [Items.DeadBrain]: 14000,
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
                        {Object.entries(ImbuementPower).map(([key, name]) => (
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
