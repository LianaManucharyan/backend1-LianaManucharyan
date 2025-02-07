import express from 'express';
import Product from '../../models/product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { limit = 5, page = 1, sort = '', query = '' } = req.query;

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

router.post('/', async (req, res) => {
  const { title, description, price, category, stock } = req.body;

  if (!title || !description || !price || !category || !stock) {
    return res.status(400).json({ status: 'error', message: 'Faltan datos para crear el producto' });
  }

  try {
    const newProduct = new Product({
      title,
      description,
      price,
      category,
      stock
    });

    await newProduct.save();

    if (req.io) {
      req.io.emit('newProduct', newProduct);
    }

    res.status(201).json({ status: 'success', message: 'Producto creado exitosamente', product: newProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  console.log("Solicitud DELETE recibida para el id:", id);  

  try {
    const deletedProduct = await Product.findByIdAndDelete(id); 

    if (!deletedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' }); 
    }

    if (req.io) {
      req.io.emit('productDeleted', deletedProduct._id); 
    }

    res.status(200).json({ status: 'success', message: 'Producto eliminado correctamente', product: deletedProduct });
  } catch (error) {
    console.error("Error al eliminar producto:", error); 
    res.status(500).json({ status: 'error', message: error.message });  
  }
});

export default router;