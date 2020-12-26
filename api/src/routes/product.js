const server = require('express').Router();
const { Product, Category, Strain } = require('../db.js');
// const { Sequelize } = require('sequelize');
const categoryRouter = require('./category.js');

// [FLAVIO] SIEMPRE RETORNAR UN STATUS DE CUALQUIER METODO QUE SE LE HACE A LA API:
// PUEDE SER DE 3 maneras (desconozco si habra otra manera de hacerlo):
// 1. return res.status(XXX).send(`CON O SIN CONTENIDO)
// 2. return res.send(xxx,`CON O SON CONTENIDO`)
// 3. return res.sendStatus(XXX)
// Cualquiera de las formas es correcta, pero, res.status(XXX) NO DEVUELVE NADA -- OJO -- cambié el color del comentario por la demo

server.use('/category', categoryRouter);

server.get('/', (req, res, next) => {
  //  console.log('Traigo todos los productos - GET a /products');
  Product.findAll().then((products) => {
    res.send(products);
  });
});

server.get('/', (req, res) => {});

server.get('/:id', (req, res) => {
  let { id } = req.params;
  // console.log('Filtro productos por id - GET a /products/:id');
  if (!id) return res.status(404).send('No existe el producto');
  Product.findByPk(id).then((product) => {
    return res.status(200).send(product);
  });
});

server.get('/productsByCategory/:category', (req, res) => {
  let { category } = req.params;
  // console.log('Productos con la :category - GET a /products/productsByCategory/:category')
  if (!category) return res.status(404).send('Se necesita categoría');

  Category.findAll({
    where: { taste: category },
    include: { model: Product },
  }).then((s) => {
    res.json(s);
  });
});

server.put('/:id', (req, res) => {
  let { id } = req.params;
  let {
    name,
    price,
    description,
    yearHarvest,
    image,
    stock,
    categories,
  } = req.body;
  let oldCategories;
  // console.log('Modifico producto - PUT a /products/:id');
  if (!id) return res.status(400).send('El producto no existe');

  Product.update(
    { name, price, description, yearHarvest, image, stock },
    { where: { id } }
  );
  Category.findAll({
    include: {
      model: Product,
      where: { id },
    },
  })
    .then((categories) => {
      oldCategories = categories;
      console.log(oldCategories);
      return Product.findByPk(id);
    })
    .then((product) => {
      oldCategories.forEach((category) => {
        product.removeCategory(category);
      });
      return product;
    })
    .then((product) => {
      categories.forEach((categoryId) => {
        Category.findByPk(categoryId).then((category) =>
          product.addCategory(category)
        );
      });
    })
    .then(() => {
      return res.status(200).send('El producto ha sido actualizado');
    });
});

server.delete('/:id', (req, res) => {
  let { id } = req.params;
  // console.log('Elimino un producto - DELETE a /products/:id');
  if (!id) return res.status(400).send('No se encontró el producto a eliminar');

  Product.destroy({
    where: {
      id,
    },
  }).then(() => {
    return res.status(200).send(`Producto borrado ${id}`);
  });
});

server.delete('/:idProduct/category/:idCategory', (req, res) => {
  const { idProduct, idCategory } = req.params;
  // console.log('Borro categoría de producto - DELETE a /products/:idProduct/category/:idCategory')
  if (!idProduct || idCategory)
    return res.status(400).send('No existe el producto o la categoría');

  Product.findOne({
    where: { id: idProduct },
  })
    .then((prod) => {
      prod.removeCategory([idCategory]);
      res.sendStatus(200);
    })
    .catch((e) => console.log(e));
});

server.post('/', async (req, res, next) => {
  let {
    name,
    price,
    description,
    yearHarvest,
    image,
    stock,
    categories,
    strain,
  } = req.body;

  try {
    let product = await Product.create({
      name,
      price,
      description,
      yearHarvest,
      image,
      stock,
      strainId: strain,
    });
    await categories.forEach((categoryId) => {
      Category.findByPk(categoryId).then((category) =>
        product.addCategory(category)
      );
    });
    return res.status(200).send(product);
  } catch (error) {
    console.error(error);
  }

  // console.log('Creo nuevo producto - POST a /products');
  // let strain_row = await Strain.findByPk(strain);
  // console.log('ROW', strain_row);

  // console.log('PROD', product);
  // let strain_name = await Strain.findByPk(strain);
  // console.log('STRAIN_NAME', strain_name.dataValues.name);
  // let data = await Strain.findAll({
  //   where: { id: strain },
  //   include: { model: Product },
  // });
  // console.log('DATA', data[0]);
  // console.log('DATA', data[0].dataValues);
  // console.log('DATA', data[0].dataValues.products);
  // console.log('DATA', data[0].dataValues.products.product);
  // await categories.forEach(async (categoryId) => {
  //       let category = await findByPk(categoryId)
  //       product.addCategory(category)
  // });

  // .then((product) => {
  //   console.log(product);
  //   categories.forEach((categoryId) => {
  //     Category.findByPk(categoryId).then((category) =>
  //       product.addCategory(category)
  //     );
  //   });
  //   console.log(product);
  //   // Strain.findByPk(strain).then((strain) => product.addStrain(strain));
  //   // console.log(product);
  // })
  // .then(() => res.status(200).send(prod))
  // .catch(next);
});

server.post('/:idProduct/category', (req, res) => {
  let { idProduct } = req.params;
  let { Category } = req.body;

  if (!idProduct || Category)
    return res.status(400).send('No se puede agregar la categoría');

  Product.findByPk(idProduct).then((product) => {
    product.addCategory(Category);
    return res.send('Se agregó la categoría');
  });
});

module.exports = server;
