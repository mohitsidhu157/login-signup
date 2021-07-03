const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
require('./db');
const User = require('./model/user');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/login', async (req, res) => {
  const schema = Joi.object({
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
      .required(),
    email: Joi.string()
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      }),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    return res
      .status(400)
      .send({ message: validationResult.error.details[0].message });
  }

  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send({ message: 'user not found' });
  }

  const isValid = await bcrypt.compare(req.body.password, user.password);
  console.log(isValid, user.password);
  if (!isValid) {
    return res.status(400).send({ message: 'Invalid credentials' });
  }

  user = user.toObject();
  delete user.password;
  res.send(user);
});

app.post('/register', async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    email: Joi.string()
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      }),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    return res
      .status(400)
      .send({ message: validationResult.error.details[0].message });
  }
  const body = { ...req.body };
  body.password = await bcrypt.hash(body.password, 8);
  const user = new User(body);
  await user.save();
  const tempUser = user.toObject();
  delete tempUser.password;
  res.send(tempUser);
});

app.get('/user/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.send(user);
});

app.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false,
    new: true,
  });

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.send(user);
});

app.delete('/user/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.send(user);
});

app.listen(port, () => {
  console.log('Server is running on port 3000');
});
