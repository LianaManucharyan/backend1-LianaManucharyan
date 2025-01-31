import express from 'express';
import Product from '../../models/product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;
  const filters = query ? { category: query } : {};
  const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

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
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
