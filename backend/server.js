const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: axios } = require("axios");
const PORT = 5000;

const process = require("node:process");

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

let userData = [
  {
      "id": 1,
      "email": "pablo@atratopago.com",
      "phone": "+523333333333",
      "name": "Pablo",
      "middleName": null,
      "fLastName": "Perez",
      "sLastName": "Ramirez",
      "birthday": "1990-04-23",
      "status": "PENDIENTE",
      "assignedAnalyst": "David",
      "cardInfo": {
          "number": "5188267468566250",
          "type": "Mastercard",
          "cvv": "944",
          "pin": "2319",
          "expiration": "2025-09-26T22:19:25.7460359+00:00"
      }
  },
  {
      "id": 2,
      "email": "monica@atratopago.com",
      "phone": "+52332140563",
      "name": "Monica",
      "middleName": "Maria",
      "fLastName": "Flores",
      "sLastName": "Herrera",
      "birthday": "1998-02-12",
      "status": "EN_PROCESO",
      "assignedAnalyst": "David",
      "cardInfo": {
          "number": "5180007462214558",
          "type": "Visa",
          "cvv": "123",
          "pin": "0824",
          "expiration": "2023-02-20T20:20:23.7460359+00:00"
      }
  },
  {
      "id": 3,
      "email": "david@atratopago.com",
      "phone": "+523213453090",
      "name": "David",
      "middleName": null,
      "fLastName": "Perez",
      "sLastName": "Navarro",
      "birthday": "1980-01-02",
      "status": "PENDIENTE",
      "assignedAnalyst": "David",
      "cardInfo": {
          "number": "5154321433561250",
          "type": "Mastercard",
          "cvv": "499",
          "pin": "1309",
          "expiration": "2025-07-01T22:19:25.7460359+00:00"
      }
  }
]

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function(req, res){
    res.send('Hello from backend')    
})

app.get('/users', (req, res) => {
    res.send(userData)
})

app.post('/user', async (req, res) => {
    const { name, lastname, email, telephone, birthday, status, assignedAnalyst } = req.body;

    // Check if user already exists by email
    const userExists = userData.find(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'Ya existe un usuario con el mismo correo' });
    }

    // Get the random data from the API
    // GET 'https://randommer.io/api/Card' --header 'X-Api-Key: f3b80c8d2c6a478e89445e919e625fff'
    const { data } = await axios.get('https://randommer.io/api/Card', {
      headers: {
        'X-Api-Key': 'f3b80c8d2c6a478e89445e919e625fff'
      }
    });
    const { cardNumber, type, cvv, pin, expiration } = data;

    const nameParts = name.split(' ');
    const lastnameParts = lastname.split(' ');

    const user = {
        id: userData.length + 1,
        name: nameParts[0],
        middleName: nameParts[1],
        fLastName: lastnameParts[0],
        sLastName: lastnameParts[1],
        email,
        telephone,
        birthday,
        status: status || 'PENDIENTE',
        assignedAnalyst,
        cardInfo: {
            number: cardNumber,
            type,
            cvv,
            pin,
            expiration
        }
    }

    userData.push(user);

    return res.status(200).json({ message: 'User created successfully', user });
})

app.put('/user', async (req, res) => {
  const { id, name, lastname, email, birthday, status, assignedAnalyst, creditInfo } = req.body;

  const userExists = userData.find(user => user.id === id);
  if (!userExists) {
    return res.status(404).json({ message: 'User not found' });
  }

  const nameParts = name.split(' ');
  const lastnameParts = lastname.split(' ');

  userExists.name = nameParts[0];
  userExists.middleName = nameParts[1];
  userExists.fLastName = lastnameParts[0];
  userExists.sLastName = lastnameParts[1];
  userExists.email = email;
  userExists.birthday = birthday;
  userExists.status = status || 'PENDIENTE';
  userExists.assignedAnalyst = assignedAnalyst;
  userExists.cardInfo = creditInfo;

  return res.status(200).json({ message: 'User updated successfully', user: userExists });
})

app.delete('/users', async (req, res) => {
  // Delete all users by id
  const { ids } = req.body;
  // Transform the ids string array to number array
  const idsNumber = ids.map(id => Number(id));
  const removeUsers = userData.filter(user => !idsNumber.includes(user.id));
  userData = removeUsers;

  return res.status(200).json({ message: 'Users deleted ' + ids });
})

app.listen(5000, () => {
  console.log(`Server started on port ${PORT}`);
});