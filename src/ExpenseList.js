// ExpenseList.js
// Lists categories like Repairs, Overheads, Contractors

function ExpenseList({ expenses }) {
  return (
    <div style={{ margin: "2rem" }}>
      <h2>Expenses Breakdown</h2>
      <ul>
        {expenses.map((item, index) => (
          <li key={index}>{item.name}: ${item.amount}</li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseList;
