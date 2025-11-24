function validatePaymentRequest(amount, slot, products) {
  const errors = [];
  
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (amount < 0.100) {
    errors.push('Amount must be at least 0.100 KWD');
  }
  
  if (!slot || !Number.isInteger(Number(slot))) {
    errors.push('Slot must be a valid integer');
  }
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    errors.push('Products must be a non-empty array');
  } else {
    products.forEach((product, index) => {
      if (!product.slot || !Number.isInteger(Number(product.slot))) {
        errors.push(`Product ${index + 1}: slot must be a valid integer`);
      }
      if (!product.name || typeof product.name !== 'string') {
        errors.push(`Product ${index + 1}: name must be a non-empty string`);
      }
      if (!product.quantity || !Number.isInteger(Number(product.quantity)) || product.quantity <= 0) {
        errors.push(`Product ${index + 1}: quantity must be a positive integer`);
      }
    });
  }
  
  return errors;
}

module.exports = {validatePaymentRequest}