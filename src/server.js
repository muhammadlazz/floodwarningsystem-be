const express = require('express');

const app = express();

const port = 5001;
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

