import fs from 'fs';

class ProductManager {
  constructor(io) {
    this.io = io;
    this.filePath = 'src/db/products.json'; 
  }

async getProducts() {
  try {
    const data = await fs.promises.readFile(this.filePath, 'utf-8');
    const products = JSON.parse(data);
    
    if (Array.isArray(products)) {
      return products;
    } else {
      console.error('Los productos no están en formato de array');
      return [];
    }
  } catch (error) {
    console.error("Error al leer productos:", error);
    return []; 
  }
}

  async saveProducts(products) {
  try {
    const data = JSON.stringify(products, null, 2);
    await fs.promises.writeFile(this.filePath, data, 'utf-8');
    console.log('Productos guardados:', products);
    return true;
  } catch (error) {
    console.error("Error al guardar productos:", error);
    return false;
  }
}

  async createProduct(productData) {
    const products = await this.getProducts();
    productData.id = Math.floor(Math.random() * 10000); 

    if (!productData.title || !productData.price || !productData.stock || !productData.category) {
      throw new Error('Todos los campos son requeridos');
    }

    products.push(productData);
    const isSaved = await this.saveProducts(products);
    if (isSaved) {
      this.io.emit('product-updated', products);
      return productData;
    } else {
      throw new Error('No se pudo guardar el producto');
    }
  }

  async updateProduct(productId, productData) {
    const products = await this.getProducts();
    let product = products.find(p => p.id === productId);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    product = { ...product, ...productData };
    const isSaved = await this.saveProducts(products);
    if (isSaved) {
      this.io.emit('product-updated', products);
      return product;
    } else {
      throw new Error('No se pudo actualizar el producto');
    }
  }

  async deleteProduct(productId) {
    const products = await this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
  
    if (productIndex === -1) {
      throw new Error('Producto no encontrado');
    }
  
    products.splice(productIndex, 1);  
  
    const isSaved = await this.saveProducts(products);  
    if (isSaved) {
      this.io.emit('product-updated', products);  
      return true;
    } else {
      throw new Error('No se pudo eliminar el producto');
    }
  }  
}

export default ProductManager;
