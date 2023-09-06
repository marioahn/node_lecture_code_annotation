import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3019;

// 비밀 키는 외부에 노출되면 안된다!  -> 아래처럼 직접 쓰는건 bad
  // 또한, 두 개를 다르게 설정해야 한다. access토큰이 탈취된다 해도 그걸 바탕으로 refresh를 추측할 가능성 줄이기!
// 그렇기 때문에, '.env' 파일을 이용해 비밀 키를 관리해야 한다
const ACCESS_TOKEN_SECRET_KEY = `HangHae99`; // Access Token의 비밀 키를 정의
const REFRESH_TOKEN_SECRET_KEY = `Sparta`; // Refresh Token의 비밀 키를 정의

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  return res.status(200).send('Hello Token!');
});


/** 1. 엑세스, 리프레시 토큰 발급 API **/
const tokenStorages = {} // 리프레시 토큰을 관리할 객체
app.post('/tokens', async(req,res) => {
  // 0)ID전달
  const { id } = req.body;

  // 1)엑세스,리프레시 토큰을 발급
  const accessToken = jwt.sign({ id: id }, ACCESS_TOKEN_SECRET_KEY, { expiresIn: '10s' });
  const refreshToken = jwt.sign({ id: id }, REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });

  tokenStorages[refreshToken] = { // jwt가 키로 & value값은 객체형식으로 넣기
    id: id, // 사용자에게 전달받은 ID를 저장한다
    ip: req.ip, // 사용자의 IP 정보를 저장한다(ip이렇게 넣음)
    userAgent: req.header['user-agent'], // 사용자가 쓰는 클라이언트(크롬,사파리,모바일크롬..etc)가 무엇인지를 뜻하며, req.header['user-agent'] <- 이렇게 넣으면 됨!
  }

  // 2)클라이언트에게 2종류의 쿠키(토큰)를 할당
  res.cookie('accessToken', accessToken);
  res.cookie('refreshToken', refreshToken);

  return res.status(200).json({ message: 'Token이 정상적으로 발급되었습니다' });
});


/** 2. 엑세스 토큰 검증 API **/
app.get('/tokens/validate', (req,res) => {
  const { accessToken } = req.cookies;
  console.log(accessToken)
  // 1)엑세스 토큰이 존재하는지 확인한다
  if (!accessToken) {
    return res.status(400).json({ errorMessage: 'Access Token이 존재하지 않습니다' })
  };

  // 2)액세스 토큰이 존재한다면, 이제 payload가 있는지 확인! - validateToken함수 이용
  const payload = validateToken(accessToken,ACCESS_TOKEN_SECRET_KEY)
  if (!payload) { // 즉, null이면
    return res.status(401).json({ errorMessage: 'Access Token이 정상적이지 않습니다' })
  };

  // 3)payload가 존재하면, Token검증까지 완료 -> end~
  const { id } = payload;
  return res.status(200).json({ message: `${id}의 Payload를 가진 Token이 정상적으로 인증되었습니다` });

});

// Token을 검증하고, Payload를 조회&'반환'하기 위한 함수! - 매개변수에 token, 비밀키
function validateToken(token, secretKey) {
  // jwt.verify()메서드: 통과하면 Payload 반환!
  try {
    return jwt.verify(token, secretKey); // 통과x면 에러반환하기 때문에 try-catch로!
  } catch (err) {
    return null
  }
};


/** 3. Refresh Token을 이용해서, AccessToken을 '재'발급하는 API **/
  // access,refresh토큰 발급api먼저 실행 후 -> 이 api실행
  // 단, 서버 껐다 킨 후에 바로 3api실행시키면? tokenStorages가 날라갔기 때문에,
  // refresh token의 정보가 서버에 존재치 않는다는 에러메세지 출력!
app.post('/tokens/refresh', async(req,res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ errorMessage: 'refresh토큰이 존재하지 않습니다' })
  };

  const payload = validateToken(refreshToken, REFRESH_TOKEN_SECRET_KEY);
  if (!payload) {
    return res.status(401).json({ errorMessage: 'refresh토큰이 유효하지 않습니다' })
  };

  const userInfo = tokenStorages[refreshToken]; // 지금이야 이렇게 객체로 하지만, 이는 1회용 - 나중에 db로 옮김 -> 노션에 설명있음
  if (!userInfo) {
    return res.status(401).json({ errorMessage: 'refresh토큰의 정보가 서버에 존재하지 않습니다' })
  };

  // 모든 비즈니스 로직 통과!
    // (1)refresh토큰을 크라이언트가 서버에 전달했고,
    // (2)이 refresh토큰은 서버가 전달한 refresh토큰이 맞고(validateToken함수 -> payload)
    // (3)서버에서도 실제 정보(userInfo=클라이언트의 id등의 정보)를 가지고 있다
  const newAccessToken = jwt.sign(userInfo.id, ACCESS_TOKEN_SECRET_KEY);
  // 어. 근데 위 코드 보니, 만료기한이 설정이 안 되어있네..? 맨 위에는 10초인데.. 실수
  // 이런 실수를 예방하기 위해 createdAccessToken함수를 미리 짜는게 좋음.. 리팩토링해서 간결해지고 실수 줄여짐!

  res.cookie('accessToken', newAccessToken); // 쿠키이름은 다시 accessToken으로 발급!
  return res.status(200).json({ message: 'access토큰이 정상적으로 재발급 되었습니다' });

});


app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});