import Product from '../models/product.js'; 

class ProductManager {
  async getProducts({ limit, page, sort, query }) {
    const filters = query ? { category: query } : {};
    const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    const products = await Product.find(filters)
      .skip((page - 1) * limit) 
      .limit(Number(limit)) 
      .sort(sortOptions);

    return products;
  }

  async countProducts(query) {
    const filters = query ? { category: query } : {};
    return await Product.countDocuments(filters);
  }
}

export default ProductManager;