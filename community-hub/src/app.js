import express from 'express';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import expressMySQLSession from 'express-mysql-session';
import dotEnv from 'dotenv';
import UsersRouter from './routes/users.router.js';
import PostsRouter from './routes/posts.router.js';
import CommentsRouter from './routes/comments.router.js';
import logMiddleware from './middlewares/log.middleware.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
// import { compare } from 'bcrypt';

// 이 함수를 실행시키면: .env에 있는 여러 값들을, process.env 객체 안에 추가해준다
dotEnv.config(); // 함수 실행

const app = express();
const PORT = 3018;

const MySQLStroage = expressMySQLSession(expressSession);
const sessionStore = new MySQLStroage({ // 우리가 어떤 MySQL을 사용할지를 설정
  user: process.env.DATABASE_USERNAME,// root대신
  password: process.env.DATABASE_PASSWORD, // aaa4321 대신
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24,
  createDatabaseTable: true, // true: Sessions라는 테이블을 자동으로 생성할 것이다
});

app.use(logMiddleware); // 제일 처음에
app.use(express.json()); // body-parser
app.use(cookieParser()); // cookie-parser
app.use(expressSession(
  {
    secret: process.env.SESSION_SECRET_KEY,// 'customized_secret_key',대신
    resave: false, // 서버 코스트 줄이기 위해 2개 다 false, false
    saveUninitialized: false, 
    store: sessionStore, // express-mysql-session사용할때 여기 추가해야 함 - 위에서 만든 세션스토어 입력
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  }
));
app.use('/api', [UsersRouter, PostsRouter, CommentsRouter]); // 해당 라우터를 전역 미들웨어에 등록
app.use(errorHandlingMiddleware); // 제일 마지막에

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});