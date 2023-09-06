import { prisma } from '../utils/prisma/index.js';

// 인증 middleware는 구현에 express가 필요 없으므로, 바로 'export default async 함수' 형식!
export default async function (req,res,next) {
  try {
    const { userId } = req.session;
    if (!userId) throw new Error('로그인이 필요합니다');

    // 4. JWT의 `userId`를 이용해 사용자를 조회한다
    const user = await prisma.users.findFirst({
      where: { userId: +userId }, // 좌측: type보면 int고, 우측의 userId는 바로 문자열이다
    })
    if (!user) {
      throw new Error('토큰 사용자가 존재하지 않습니다'); // catch로 에러 던지기!
    }

    // 5. `req.user` 에 조회된 사용자 정보를 할당한다 -> 사용자 정보 조회API에서 사용할 것!
      // 조회가 되었다? = 검증완료
    req.user = user;

    // 6. 다음 미들웨어를 실행한다
    next();

  } catch (error) { 
    switch(error.name) { // error: switch문으로 구현도 가능!
      default:
        // 위에 '토큰타입 일치하지 않습니다'에러는 이 경우로 들어오겠지
          // 문법 아래처럼! -> error.message(에러의 메세지)가 존재한다면 그 메세지 출력하고, (??왼쪽)
          // error.message가 없다면 '비정상적인 요청'이 출력! (??오른쪽)
        return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다' });
    }
  };
  
};