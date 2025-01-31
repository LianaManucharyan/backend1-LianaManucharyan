import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  availability: { type: Boolean, default: true },
  image: String,
});

const Product = mongoose.model('Product', productSchema);

export default Product;


