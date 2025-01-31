viewsRouter.get('/realtimeproducts', async (req, res) => {
  const { limit = 10, page = 1, sort = '', query = '' } = req.query;

  try {
    const products = await productManager.getProducts({ limit, page, sort, query });
    const totalCount = await productManager.countProducts(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.render('realtimeproducts', {
      title: 'Productos en Tiempo Real',
      products,
      totalPages,
      currentPage: page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      prevLink: page > 1 ? `/realtimeproducts?page=${page - 1}&limit=${limit}&query=${query}&sort=${sort}` : null,
      nextLink: page < totalPages ? `/realtimeproducts?page=${page + 1}&limit=${limit}&query=${query}&sort=${sort}` : null
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});
