import express from 'express';
import Product from '../../models/product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort = '', query = '' } = req.query;

  const filters = {};
  if (query) {
    filters.category = query; 
  }

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

    const totalCount = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/api/products?page=${page - 1}&limit=${limit}&query=${query}&sort=${sort}` : null,
      nextLink: page < totalPages ? `/api/products?page=${page + 1}&limit=${limit}&query=${query}&sort=${sort}` : null,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;