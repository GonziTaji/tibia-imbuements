import useImbuementStore from '../hooks/useImbuementStore';

export default function ItemPriceList() {
    const { changePrice, itemPrices } = useImbuementStore();

    return (
        <article style={{ width: 'fit-content' }}>
            <h1>Item Prices</h1>

            <ul style={{ margin: 0, padding: 0 }}>
                {Object.entries(itemPrices).map(([item, price]) => (
                    <li
                        key={item}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                        }}
                    >
                        <label htmlFor={item}>{item}&nbsp;</label>
                        <input
                            id={item}
                            type="number"
                            value={price}
                            onChange={(e) => changePrice(item, parseInt(e.currentTarget.value))}
                        />
                    </li>
                ))}
            </ul>
        </article>
    );
}
