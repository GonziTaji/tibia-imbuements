import useImbuementStore from '../hooks/useImbuementStore';
import { formatGold } from '../utils';

export default function ItemsNeeded() {
    const { itemsNeeded, itemPrices } = useImbuementStore();

    return (
        <article>
            <h1>Items needed</h1>

            <ul style={{ margin: 0, padding: 0 }}>
                {itemsNeeded.map((itemData, i) => (
                    <li
                        key={i}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '9rem min-content 1fr 1fr',
                        }}
                    >
                        {itemData.item}
                        <input
                            type="text"
                            value={'' + itemData.quantity + ' x ' + itemPrices[itemData.item]}
                            disabled
                            readOnly
                        />
                        <span style={{ display: 'block', wordWrap: 'normal' }}>
                            &nbsp;=&nbsp;{formatGold(itemPrices[itemData.item] * itemData.quantity)}
                        </span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
