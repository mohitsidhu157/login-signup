const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const { loginSchema, registerSchema, updateUserSchema } = require('./schemas');
const { serverError, userNotFound } = require('./utils');

// Create mysql connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
});

const app = express();
app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const validationResult = loginSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(400).send({
        message: validationResult.error.details[0].message,
        success: flase,
      });
    }

    const query = `SELECT password from users where email='${req.body.email}'`;

    db.query(query, async (err, result) => {
      if (err) {
        throw new Error(err);
      }

      if (!result.length) {
        return userNotFound(res);
      }

      const isValid = await bcrypt.compare(
        req.body.password,
        result[0].password
      );

      if (!isValid) {
        return res
          .status(400)
          .send({ message: 'Invalid Credentials', success: false });
      }
      return res.send({ message: 'Login Successful', success: true });
    });
  } catch (error) {
    return serverError(res);
  }
});

app.post('/register', async (req, res) => {
  try {
    const validationResult = registerSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(400).send({
        message: validationResult.error.details[0].message,
        success: false,
      });
    }

    const query = `SELECT id from users WHERE email='${req.body.email}'`;
    db.query(query, async (err, result) => {
      if (err) {
        throw err;
      }

      if (result.length) {
        return userNotFound(res);
      }

      const body = { ...req.body };
      body.password = await bcrypt.hash(body.password, 8);

      const insertQuery = `INSERT into users SET?;`;
      db.query(insertQuery, body, (err, response) => {
        if (err) {
          throw new Error(err);
        }

        return res.send({
          message: 'User created successfully.',
          success: true,
        });
      });
    });
  } catch (err) {
    return serverError(res);
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = `SELECT * from users WHERE id='${id}'`;
    db.query(query, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      if (!result.length) {
        return userNotFound(res);
      }
      delete result[0].password;
      return res.send(result);
    });
  } catch (error) {
    return serverError(res);
  }
});

app.post('/update/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const validationResult = updateUserSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(400).send({
        message: validationResult.error.details[0].message,
        success: false,
      });
    }

    const selectQuery = `SELECT id from users where id='${id}'`;
    db.query(selectQuery, (error, result) => {
      if (error) {
        throw new Error(error);
      }

      if (!result.length) {
        return userNotFound(res);
      }

      const query = `UPDATE users SET ? WHERE id='${id}'`;

      db.query(query, req.body, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        return res.send({
          message: 'Details updated successfully.',
          success: true,
        });
      });
    });
  } catch (error) {
    return serverError(res);
  }
});

app.delete('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = `DELETE from users where id='${id}'`;
    db.query(query, (err, result) => {
      if (err) {
        throw new Error(err);
      }

      if (!result.affectedRows) {
        return userNotFound(res);
      }

      return res.send({ message: 'User Deleted successfully', success: true });
    });
  } catch (error) {
    return serverError(res);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port: ', listener.address().port);
});
