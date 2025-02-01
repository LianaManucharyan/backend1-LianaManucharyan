import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, require: true },
  price: { type: Number, required: true },
  category: String,
  stock:{ type: Number, require: true },
});

const Product = mongoose.model('Product', productSchema);

export default Product;


