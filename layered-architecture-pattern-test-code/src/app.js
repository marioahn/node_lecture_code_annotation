import express from 'express';
import router from './routes/index.js';
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const port = 4000;

app.use(LogMiddleware);
app.use(express.json());
app.use('/api', router);
app.use(ErrorHandlingMiddleware);

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});
