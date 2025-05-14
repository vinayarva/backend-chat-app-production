import { GoogleGenAI } from "@google/genai";

const Api_key = process.env.API_KEY

const ai = new GoogleGenAI({
  apiKey: 'YOUR API KEY',
});

const extractInsightsFromText = async (extractedText) => {
  try {
    // prompt
    const prompt = `
    Analyze the following invoice text carefully. Your task is to extract detailed information and structure it as a single, valid JSON object.

Your primary goal is to extract information for the fields listed below. If a field from this list is present in the text, include it in the JSON using a snake_case key. **If a listed field is NOT found in the text, OMIT that key entirely from the JSON output (do not include it with a null value).**

**Primary fields to extract if present:**
- 'vendor_name': The name of the company issuing the invoice.
- 'vendor_address': The full address of the vendor.
- 'vendor_phone': Vendor's phone number.
- 'vendor_email': Vendor's email address.
- 'vendor_website': Vendor's website.
- 'vendor_tax_id': Vendor's tax identification number (e.g., VAT ID, GSTIN).

- 'customer_name': The name of the customer being billed.
- 'customer_address': The full address of the customer.
- 'customer_phone': Customer's phone number.
- 'customer_email': Customer's email address.
- 'customer_tax_id': Customer's tax identification number.

- 'shipping_name': Name for the shipping recipient (if different from customer).
- 'shipping_address': Full shipping address (if different from customer).

- 'invoice_id': The unique invoice number or identifier.
- 'invoice_date': The date the invoice was issued. (Try to format as YYYY-MM-DD).
- 'due_date': The date by which payment is due. (Try to format as YYYY-MM-DD).
- 'purchase_order_number' (or 'po_number'): The purchase order number associated with the invoice.

- 'line_items': An array of objects, where each object represents a line item and contains (only include keys if data is present for them):
    - 'description': Description of the item or service.
    - 'quantity': Quantity of the item (should be a numerical value).
    - 'unit_price': Price per unit of the item (should be a numerical value).
    - 'item_total_amount': Total amount for that line item (quantity * unit_price; should be a numerical value).
    - 'item_tax_rate': Tax rate applied to this item, if specified per item (e.g., "10%").
    - 'item_tax_amount': Tax amount for this item, if specified per item (should be a numerical value).
    - 'sku' (or 'product_code'): Stock Keeping Unit or product code.

- 'subtotal': The total amount before taxes and other charges (should be a numerical value).
- 'total_tax_amount': The total sum of all taxes applied to the invoice (should be a numerical value).
- 'discount_amount': Total discount applied (should be a numerical value).
- 'shipping_amount' (or 'freight_amount'): Cost of shipping (should be a numerical value).
- 'grand_total': The final amount due for the invoice (should be a numerical value).
- 'amount_paid': Amount already paid (should be a numerical value).
- 'balance_due': The remaining amount to be paid (grand_total - amount_paid; should be a numerical value).

- 'currency_code': The currency of the amounts (e.g., "USD", "EUR", "INR"). If the code is not present but a symbol (e.g., $, €, ₹) is, use a 'currency_symbol' field instead.
- 'payment_terms': Any payment terms mentioned (e.g., "Net 30 days").
- 'notes_or_terms': Any additional notes, terms and conditions, or special instructions.

**Inclusion of Other Fields:**
In addition to the fields listed above, if you identify other relevant key-value pairs in the invoice text that seem important for a complete understanding of the document, you **SHOULD include these additional fields** in the JSON output. Use clear, descriptive snake_case keys for these additional fields based on your understanding of the data (e.g., 'custom_field_name').

**Important Formatting Instructions:**
1.  **Newline Handling:** For any string value that contains multiple lines in the original text (like addresses, descriptions, or notes), replace all newline characters ('\n') with a single space. The final string value in the JSON should not contain '\n'.
2.  **Numerical Values:** All monetary values (prices, amounts, totals) and quantities should be extracted as numerical data types in the JSON (e.g., '123.45', not '123.45'). Do not include currency symbols within these numerical values.
3.  **Date Formatting:** If possible, format dates as 'YYYY-MM-DD'. If the original format is different and cannot be easily converted, keep the original date string.
4.  **Accuracy:** Ensure the extracted data accurately reflects the invoice content.

Here is the invoice text:

"${extractedText}"

Return only the valid JSON object as your response, without any introductory text or explanations.
    `;

    // Step 3: Get result from Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = result.candidates[0].content.parts[0].text;

    const cleanedText = responseText.replace(/```json\n|\n```/g, "");

    const jsonContent = JSON.parse(cleanedText);

    return jsonContent;
  } catch (err) {
    console.error("Error parsing JSON:", err);
  }
};

export default extractInsightsFromText;
