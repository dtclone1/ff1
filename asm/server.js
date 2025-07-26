"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var fs = require("fs");
var path = require("path");
var cors_1 = require("cors");
var app = (0, express_1.default)();
var port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/update-user', function (req, res) {
    var newUser = req.body;
    console.log('Received new user:', newUser); // Add this line
    var filePath = path.join(__dirname, 'src', 'assets', 'data', 'user.json');
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading file');
        }
        var users = JSON.parse(data);
        users.push(newUser);
        fs.writeFile(filePath, JSON.stringify(users, null, 2), function (err) {
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
app.listen(port, function () {
    console.log("Server listening at http://localhost:".concat(port));
});
