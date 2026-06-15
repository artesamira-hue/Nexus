type Column<T> = {
    header: string;
    accessor: keyof T;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type TableProps<T> = {
    columns: Column<T>[];
    data: T[];
    scroll?: boolean;
};

const Table = <T extends Record<string, unknown>>({
    columns,
    data,
    scroll,
}: TableProps<T>) => {
    return (
        <div className={scroll ? "table-container" : ""}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={String(column.accessor)}>{column.header}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column) => (
                                <td key={String(column.accessor)}>
                                    {column.render
                                        ? column.render(row[column.accessor], row)
                                        : String(row[column.accessor] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table