import express from 'express'
import fs from 'fs'


const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 8080;

app.use(express.json());

// rutas de los pokemon
const productsRouter = express.Router();
const productsFile = './products.json';

// agregar middleware
const errorHandler = (err, req, res, next) => {
    console.error(err);
    const errorMessage = err.message || 'error';
    const statusCode = err.statusCode || 500;
    const errorDetails = err.details || null;
    res.status(statusCode).json({ error: errorMessage, details: errorDetails });
  };
// lista de los pokemons
productsRouter.get('/', async (req, res, next) => {
  try {
    const data = await fs.readFile(productsFile, 'utf8');
    const products = JSON.parse(data);
    res.send(products);
  } catch (err) {
    next(err);
  }
});

// obtener un pokemon por su numero de id
productsRouter.get('/:pid', async (req, res, next) => {
  try {
    const productId = req.params.pid;
    const data = await fs.readFile(productsFile, 'utf8');
    const products = JSON.parse(data);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.send(product);
  } catch (err) {
    next(err);
  }
});

// agregar un nuevo pokemon
productsRouter.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
  
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).send('error');
    }
  
    fs.readFile(productsFile, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('error');
      }
  
      const products = JSON.parse(data);
      const id = uuidv4(); 
  
      const newProduct = {
        id,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
      };
  
      products.push(newProduct);
  
      fs.writeFile(productsFile, JSON.stringify(products), err => {
        if (err) {
          console.error(err);
          return res.status(500).send('error');
        }
  
        res.send(newProduct);
      });
    });
  });


// actualizar un pokemon al carrito
productsRouter.put('/:pid', async (req, res, next) => {
    try {
      const productId = req.params.pid;
      const { id, ...fieldsToUpdate } = req.body; 
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).send('error');
      }
  
      const data = await fs.readFile(productsFile, 'utf8');
      const products = JSON.parse(data);
      const productIndex = products.findIndex(p => p.id === productId);
  
      if (productIndex === -1) {
        return res.status(404).send('error');
      }
  
      const updatedProduct = { ...products[productIndex], ...fieldsToUpdate };
      products[productIndex] = updatedProduct;
      await fs.writeFile(productsFile, JSON.stringify(products));
  
      res.status(200).send(updatedProduct);
    } catch (err) {
      next(err);
    }
  });
    
  
  
  
// eliminar un pokemon del carrito
productsRouter.delete('/:pid', (req, res) => {
    const productId = req.params.pid;
  
    fs.readFile(productsFile, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('error');
      }
  
      const products = JSON.parse(data);
      const productIndex = products.findIndex(p => p.id === productId);
  
      if (productIndex === -1) {
        return res.status(404).send('error pokemon no encontrado');
      }
  
      products.splice(productIndex, 1);
  
      fs.writeFile(productsFile, JSON.stringify(products), err => {
        if (err) {
          console.error(err);
          return res.status(500).send('error');
        }
  
        res.send('el pokemon fue eliminado de tu carrito');
      });
    });
  });
  
