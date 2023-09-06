import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cookieParser());

// 'res.cookie()'를 이용하여 쿠키를 할당하는 API
app.get("/set-cookie", (req, res) => {
  let expires = new Date();
  expires.setMinutes(expires.getMinutes() + 60); // 만료 시간을 60분으로 설정

  res.cookie('name', 'sparta', {
    expires: expires
  });
  return res.end();
});


// 'req.headers.cookie'를 이용하여 클라이언트의 모든 쿠키를 조회하는 API
app.get('/get-cookie', (req, res) => {
  // const cookie = req.headers.cookie;
  // console.log(cookie); // name=sparta <-형식으로 나옴

  const cookie = req.cookies;
  console.log(cookie); // { name: 'sparta' }
  return res.status(200).json({ cookie }); 
});


let session = {}; // 빈 session 선언하고
app.get('/set-session', function (req, res, next) {
  // 현재는 sparta라는 이름으로 저장하지만, 나중에는 복잡한 사용자의 정보로 변경될 수 있다
  const name = 'sparta';
  const uniqueInt = Date.now(); // 세션에 사용자의 시간 정보 저장
  
	// session객체에: 위에서 만든 uniqueInt를 키로하고, 밸류에는 name을 집어넣기
  session[uniqueInt] = { name };

	// 응답할때: 쿠키를 발급할건데(=사용자에게 반환) - sessionKey라는 이름으로!
		// 그리고, sessionKey안에는 uniqueInt라는 정보가 담겨있다
    // 이 쿠키가 아래 get-session할때 req.cookies에서 쓰임 ㅇㅇ.
  res.cookie('sessionKey', uniqueInt);
  return res.status(200).end();
});


app.get('/get-session', function (req, res, next) {
  const { sessionKey } = req.cookies;

  // set실행후 get실행하면 -> { '1693453894891': { name: 'sparta' } }
  console.log(session) // 즉, 이 1693..라는 시간정보가 '세션키'이며, 이걸로 세션 정보, 즉 {name: 'sparta'}를 조회!
  

  // 클라이언트의 쿠키에 저장된 세션키로 서버의 세션 정보를 조회한다
  const name = session[sessionKey];
  return res.status(200).json({ name });
});

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});