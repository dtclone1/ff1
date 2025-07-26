import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/update-user', (req, res) => {
  const newUser = req.body;
  console.log('Received new user:', newUser); // Add this line
  const filePath = path.join(__dirname, 'src', 'assets', 'data', 'user.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading file');
    }

    let users = JSON.parse(data);
    users.push(newUser);

    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error writing to file');
      }
      res.status(200).send('File updated successfully');
      return;
    });
    return;
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
