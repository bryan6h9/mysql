const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');  // Asegúrate de importar path para manejar rutas

const app = express();
const port = 5000;

// Configurar el middleware para archivos estáticos (CSS, JS, imágenes)
// Servir archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, '')));  // Servir desde la raíz de la carpeta


// Configurar el middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de la sesión
app.use(session({
  secret: 'mi_secreto',
  resave: false,
  saveUninitialized: true,
}));

// Conexión con la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'bryan', // Cambia por tus credenciales de MySQL
  password: 'bryan6h9', // Cambia por tu contraseña de MySQL
  database: 'tienda_online' // Cambia por el nombre de tu base de datos
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos: ', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para mostrar la página de registro
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

// Ruta para procesar el registro de usuario
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Validación básica
  if (!name || !email || !password) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  // Verificar si el correo ya está registrado
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Error al verificar el correo: ', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.length > 0) {
      return res.status(400).send('El correo ya está registrado');
    }

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error al encriptar la contraseña: ', err);
        return res.status(500).send('Error del servidor');
      }

      // Insertar el nuevo usuario en la base de datos
      const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(query, [name, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Error al registrar el usuario: ', err);
          return res.status(500).send('Error del servidor');
        }

        res.redirect('/login');
      });
    });
  });
});

// Ruta para mostrar la página de inicio de sesión
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta para procesar el inicio de sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validación de campos
  if (!email || !password) {
    return res.status(400).send('Correo y contraseña son requeridos');
  }

  // Verificar si el correo existe
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al verificar el correo: ', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.length === 0) {
      return res.status(400).send('Correo o contraseña incorrectos');
    }

    // Comparar la contraseña ingresada con la almacenada
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar la contraseña: ', err);
        return res.status(500).send('Error del servidor');
      }

      if (!isMatch) {
        return res.status(400).send('Correo o contraseña incorrectos');
      }

      // Iniciar sesión y guardar el usuario en la sesión
      req.session.user = results[0];
      res.redirect('/home');
    });
  });
});

// Ruta para la página principal (home) después de iniciar sesión
app.get('/home', (req, res) => {
  if (!req.session.user) {
    // Si no hay sesión, redirige a la página de login
    return res.redirect('/login');
  }
  
  // Si hay sesión, muestra el archivo home.html
  res.sendFile(path.join(__dirname, 'home.html'));
});


// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión: ', err);
      return res.status(500).send('Error del servidor');
    }
    res.redirect('/login');  // Redirige al login
  });
});
























// Ruta para la página principal (home) o página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Puedes cambiar a tu página de inicio si es diferente
});







// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

