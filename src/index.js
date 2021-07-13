const express = require('express');
const bcrypt = require('bcrypt');

require('./db');
const User = require('./model/user');
const { loginSchema, registerSchema, updateUserSchema } = require('./utils');

const app = express();
app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const validationResult = loginSchema.validate(req.body);

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

    if (!isValid) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    user = user.toObject();
    delete user.password;
    return res.send(user);
  } catch (error) {
    return res
      .status(500)
      .send({ message: 'Internal server error. Please try again later' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const validationResult = registerSchema.validate(req.body);

    if (validationResult.error) {
      return res
        .status(400)
        .send({ message: validationResult.error.details[0].message });
    }
    const currentUser = await User.findOne({ email: req.body.email });
    if (currentUser) {
      return res.status(400).send({ message: 'Email already exist.' });
    }

    const body = { ...req.body };
    body.password = await bcrypt.hash(body.password, 8);

    const user = new User(body);
    await user.save();

    const tempUser = user.toObject();
    delete tempUser.password;

    return res.send(tempUser);
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Internal server error. Please try again later' });
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const tempUser = user.toObject();
    delete tempUser.password;
    return res.send(tempUser);
  } catch (error) {
    return res
      .status(500)
      .send({ message: 'Internal server error. Please try again later' });
  }
});

app.post('/update/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const validationResult = updateUserSchema.validate(req.body);

    if (validationResult.error) {
      return res
        .status(400)
        .send({ message: validationResult.error.details[0].message });
    }

    const user = await User.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
      new: true,
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const tempUser = user.toObject();
    delete tempUser.password;
    return res.send(tempUser);
  } catch (error) {
    return res
      .status(500)
      .send({ message: 'Internal server error. Please try again later' });
  }
});

app.delete('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const tempUser = user.toObject();
    delete tempUser.password;
    return res.send(tempUser);
  } catch (error) {
    return res
      .status(500)
      .send({ message: 'Internal server error. Please try again later' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port: ', listener.address().port);
});
