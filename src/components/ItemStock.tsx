import useImbuementStore from '../hooks/useImbuementStore';

export default function ItemStock() {
    const { changeStock, itemStock } = useImbuementStore();

    return (
        <article style={{ width: 'fit-content' }}>
            <h1 style={{ marginBottom: 0 }}>Items In Inventory</h1>
            <p>set the items you have in your inventory to remove them from the total calculation</p>

            <ul style={{ margin: 0, padding: 0 }}>
                {Object.entries(itemStock).map(([item, stock]) => (
                    <li
                        key={item}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                        }}
                    >
                        <label htmlFor={'stock_' + item}>{item}&nbsp;</label>
                        <input
                            id={'stock_' + item}
                            type="number"
                            value={stock}
                            onChange={(e) => changeStock(item, parseInt(e.currentTarget.value))}
                        />
                    </li>
                ))}
            </ul>
        </article>
    );
}
