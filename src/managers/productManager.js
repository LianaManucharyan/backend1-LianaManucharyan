import Product from '../models/product.js';

class ProductManager {
  async getProducts({ limit, page, sort, query }) {
    const filters = query ? { category: query } : {}; 

    const sortOptions = {};
    if (sort === 'asc') {
      sortOptions.price = 1; 
    } else if (sort === 'desc') {
      sortOptions.price = -1; 
    }

    try {
      const products = await Product.find(filters)
        .skip((page - 1) * limit) 
        .limit(Number(limit))  
        .sort(sortOptions);  

      return products;
    } catch (error) {
      throw new Error('Error al obtener los productos: ' + error.message);
    }
  }

  async countProducts(query) {
    const filters = query ? { category: query } : {};
    
    try {
      const count = await Product.countDocuments(filters);
      return count;
    } catch (error) {
      throw new Error('Error al contar los productos: ' + error.message);
    }
  }
}

export default new ProductManager();