const express = require("express");
const app = express();
const PORT = 5000;

app.listen(5000, () => {
  console.log(`Server started on port ${PORT}`);
});

app.get('/', function(req, res){
    res.send('Hello from backend')    
})