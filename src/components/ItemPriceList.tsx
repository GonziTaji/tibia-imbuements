import { useMemo, useState } from 'react';
import { ITEM } from '../data';
import useImbuementStore from '../hooks/useImbuementStore';

export default function ItemPriceList() {
    const { changePrice, itemPrices, itemsNeeded } = useImbuementStore();
    const [seeAllItems, setSeeAllItems] = useState(true);

    const items = useMemo(() => {
        if (seeAllItems) {
            return Object.values(ITEM);
        }

        return [ITEM.GoldToken, ...itemsNeeded.map((data) => data.item)];
    }, [itemsNeeded, seeAllItems]);

    return (
        <article style={{ width: 'fit-content' }}>
            <h1>Item Prices</h1>

            <div style={{ paddingBottom: '0.5rem' }}>
                <label htmlFor="seeAllCheckbox">List all items</label>
                <input
                    id="seeAllCheckbox"
                    type="checkbox"
                    checked={seeAllItems}
                    onChange={(ev) => setSeeAllItems(ev.currentTarget.checked)}
                />
                <br />
                <small>If unchecked, only the items needed for the imbuement selected will be listed</small>
            </div>

            <ul style={{ margin: 0, padding: 0 }}>
                {items.map((item) => (
                    <li
                        key={item}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                        }}
                    >
                        <label htmlFor={'price_' + item}>{item}&nbsp;</label>
                        <input
                            id={'price_' + item}
                            type="number"
                            value={itemPrices[item]}
                            onChange={(e) => changePrice(item, parseInt(e.currentTarget.value))}
                        />
                    </li>
                ))}
            </ul>
        </article>
    );
}
