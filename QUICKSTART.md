# Quick Start Guide for Professor

## Accessing the Live System

The LLM-based DBMS is deployed and ready to use:

**Frontend (Web Interface)**: `https://[your-app-name].streamlit.app`

Just open the link in your browser - no installation needed!

## How to Use

### 1. Open the Web Interface

Navigate to the deployment URL. You'll see a clean interface with:
- Query input box
- Model selector (choose GPT-4o-mini Fine-Tuned)
- Execute button

### 2. Write Your Question

Type a natural language question about the sales database. Examples:

**Simple Queries:**
- "List all customers from France"
- "Show me the top 10 products by name"
- "How many orders were placed in 2003?"

**Joins:**
- "List all customers with their order counts"
- "Show products and their total sales revenue"
- "Which employees handle the most orders?"

**Aggregations:**
- "What is the total revenue by country?"
- "Find the average order value per customer"
- "Show monthly sales trends for 2004"

**Complex:**
- "Who are the top 5 customers by total purchase amount in France?"
- "List products that have never been ordered"
- "Show customers who placed more than 10 orders with total spend"

### 3. Execute and View Results

Click "Execute Query" and you'll see:
- **Data View**: Table with query results
- **Visualization**: Automatic charts (bar, line, pie)
- **SQL Trace**: The generated SQL query

### 4. Iterate

Ask follow-up questions or refine your query based on results.

## Database Schema

The system uses a classic sales database with these tables:

**Customers**: `customerNumber`, `customerName`, `contactFirstName`, `contactLastName`, `phone`, `addressLine1`, `city`, `state`, `postalCode`, `country`, `creditLimit`

**Products**: `productCode`, `productName`, `productLine`, `productScale`, `productVendor`, `productDescription`, `quantityInStock`, `buyPrice`, `MSRP`

**Orders**: `orderNumber`, `orderDate`, `requiredDate`, `shippedDate`, `status`, `comments`, `customerNumber`

**OrderDetails**: `orderNumber`, `productCode`, `quantityOrdered`, `priceEach`, `orderLineNumber`

**Employees**: `employeeNumber`, `lastName`, `firstName`, `extension`, `email`, `officeCode`, `reportsTo`, `jobTitle`

**Offices**: `officeCode`, `city`, `phone`, `addressLine1`, `state`, `country`, `postalCode`, `territory`

## Example Session

```
Question: "Show me the top 5 customers by total sales"
Generated SQL:
SELECT 
    c.customerName,
    SUM(od.quantityOrdered * od.priceEach) as totalSales
FROM customers c
JOIN orders o ON c.customerNumber = o.customerNumber
JOIN orderDetails od ON o.orderNumber = od.orderNumber
GROUP BY c.customerNumber, c.customerName
ORDER BY totalSales DESC
LIMIT 5;

Results: [Table showing top 5 customers with their total sales]
```

## Tips for Better Results

1. **Be specific**: "top 5 customers" vs "some customers"
2. **Mention metrics**: "by total sales", "by count", "by revenue"
3. **Specify time ranges**: "in 2003", "last month", "this year"
4. **Use table names**: "Show customer names" vs "Show names"
5. **Try different phrasings**: If one doesn't work, rephrase

## Model Selection

The sidebar shows available models:
- **GPT-4o-mini (Fine-Tuned)**: Best cost/performance (recommended)
- **Llama-3-8B (Fine-Tuned)**: Fast, free, self-hosted
- **Gemma-7B (Fine-Tuned)**: Alternative free option
- **GPT-4 (Baseline)**: Highest accuracy, expensive

## Troubleshooting

**"Could not connect to backend"**
- Backend may be starting up (cold start on free tier)
- Wait 30 seconds and try again

**"Query returned no results"**
- Your question may be too specific
- Check if the data exists (e.g., no orders in 2025)

**SQL looks wrong**
- Try rephrasing your question
- Be more explicit about what you want
- Use simpler language

## Testing the System

Try these benchmark queries to see the system in action:

1. **Simple**: "How many customers do we have?"
2. **Join**: "List customers with their total order count"
3. **Aggregation**: "What is the total revenue by product line?"
4. **Complex**: "Find customers who have spent more than $50,000 total"

## For Development/Local Testing

If you want to run locally:

```bash
# 1. Clone repository
git clone https://github.com/Japyh/llm-based-dbms.git
cd llm-based-dbms

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env with your OpenAI API key

# 4. Start backend
uvicorn backend.api.main:app --reload

# 5. Start frontend (new terminal)
streamlit run frontend/app.py
```

Then open `http://localhost:8501`

## Performance Comparison

Based on our testing (see `docs/research_paper_draft.md`):

| Model | Accuracy | Speed | Cost/1k queries |
|-------|----------|-------|-----------------|
| GPT-4 | 85.4% | Slow | $15.00 |
| GPT-4o-mini (FT) | 83.5% | Fast | $0.30 |
| Llama-3 (FT) | 78.2% | Very Fast | Free |

The fine-tuned GPT-4o-mini model offers the best balance of accuracy and cost.

## Security & Privacy

- All queries are validated for SQL injection
- Read-only access (no data modification)
- Role-based access control (RBAC) enforced
- Queries are logged for audit trails
- No personally identifiable information (PII) is exposed to the LLM

## Support

For issues or questions:
- Check full documentation in `docs/` folder
- See deployment guide: `docs/DEPLOYMENT.md`
- Review research paper: `docs/research_paper_draft.md`
- Open GitHub issue with details

## Next Steps

1. **Try the system**: Execute some test queries
2. **Experiment**: Try different question formats
3. **Read the paper**: Understand the methodology
4. **Provide feedback**: What works? What doesn't?

Enjoy exploring your data with natural language! 🚀
