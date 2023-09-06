import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();


/** 1. 사용자 회원가입 API **/
router.post('/sign-up', async (req,res,next) => {
  try {
    // 아래코드 주석풀면 에러처리 미들웨어가 제대로 작동하는지 확인 가능
    // throw new Error('에러처리 미들웨어 테스트 용입니다');
    const { email, password, name, age, gender, profileImage } = req.body;

    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10); 

    // MySQL과 연결된 Prisma 클라이언트를 통해 트랜잭션을 실행
    const [user, userInfo] = await prisma.$transaction(
      async(tx) => {
        // 1.*Users테이블*에 'email', 'password'를 이용해 '사용자'를 추가한다
        const user = await tx.users.create({
          data: { 
            email,
            password: hashedPassword
          }
        }); 
    
        // 2. *UserInfos*테이블에 'name,age,gender,profileImage'를 필드로 가지는 '사용자 정보'를 추가한다
        const userInfo = await tx.userInfos.create({
          data: {
            UserId: user.userId, 
            name,
            age,
            gender: gender.toUpperCase(),
            profileImage
          }
        });
        return [user, userInfo];
      }, { // 격리수준까지 설정!
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted 
      }
    );

    return res.status(201).json({ message: '회원가입이 완료되었습니다' });
  } catch (err) {
    next(err);
  }
});


/** 2. 사용자 로그인 API **/
router.post('/sign-in', async (req,res,next) => {
  // 1. email, password를 body로 전달받는다
  const { email, password } = req.body;
  // 2. 전달 받은 email에 해당하는 사용자가 있는지 확인한다
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: '존재하지 않는 이메일입니다' });
  }
  // 3. 전달 받은 password와 데이터베이스에 저장된 password를 bcrypt를 이용해 검증한다
  if (!await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다' });
  }
    // (여기까지 왔다면? = 로그인 성공!)
  // 4. 로그인에 성공한다면, 사용자의 userId를 바탕으로 토큰을 생성한다(=사용자에게 JWT를 발급한다)
  // const token = jwt.sign( 
  //   { userId: user.userId },
  //   'customized_secret_key'
  // )
  // res.cookie('authorization', `Bearer ${token}`); 
  req.session.userId = user.userId; // 위 코드 대신에, express-session이용해서 한 줄로!

  return res.status(200).json({ message: '로그인에 성공했습니다' });
});


/** 3. 사용자 정보 조회 API **/
  // 첫 줄 로직: '/users'경로로 get 요청 -> authMiddleware수행(=검증) -> ok면 그 다음 async(req~)함수 부분이 실행 되는 것
  // 즉, 이 API가 실행되기 위해서는 가운데의 authMiddleware가 정상적으로 동작해야지만 우측의 콜백함수가 실행된다!
  // 다.시 말하면, 먼저 로.그.인api가 성공적으로 수행되어야 이 api도 수행되는 것!
  // 다시: 로그인api 수행 -> jwt 발급 -> 사용자정보조회api시작 -> 먼저, authMiddleware가 실행 -> 합격? -> 이 api 수행완료 및 사용자 정보가 조회된다!
router.get('/users', authMiddleware, async(req,res,next) => {
  // 1) 클라이언트가 로그인된 사용자인지 검증한다
    // auth.middleware.js에 있는 인증 미들웨어에서 req.user에 '옳게'조회된 사용자 정보 담았었지
    // 위 첫줄에서 authMiddleware가 수행이 되었기에, 그대로 활용가능한 것(req에)
  const { userId } = req.user; // 그 중에서, userId만 전달받자!
  
  // 2) 사용자를 조회할 때, 1:1 관계를 맺고 있는 Users와 UserInfos 테이블을 조회한다
  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: { // 특정 컬럼만 조회
      userId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      UserInfos: { // 대문자로. UserInfos테이블도 같이 조회 - join
        select: { // -> select 필수!
          name: true,
          age: true,
          gender: true,
          profileImage: true,
        }
      }
    }
  });

  // 3) 조회한 사용자의 상세한 정보를 클라이언트에게 반환한다
  return res.status(200).json({ data: user });
});


/** 4. 사용자 정보 변경 API **/
router.patch('/users', authMiddleware, async(req,res,next) => {
  // 1)게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증
  const { userId } = req.user;
  
  // 2)변경할 사용자 정보를 body로 전달받는다
  const updatedData = req.body; // const { name,age,...  } 이렇게 하기보단, updatedData선언해서 비교할 것

  // 3)사용자 정보(UserInofes) 테이블에서 사용자의 정보들을 수정한다
    // 단, 수정되기 전 사용자의 정보 데이터 조회해서 변경된 부분을 히스토리에 저장하는게 우선이다!
  const userInfo = await prisma.userInfos.findFirst({ // user's 수정 전 데이터 조회
    where: { UserId: +userId },
  });

  await prisma.$transaction(async (tx) => { // 수정과 히스토리테이블에 저장은 transaction으로 한꺼번에 처리!
    // 사용자 정보를 수정
    await tx.userInfos.update({
      data: { // body로 입력받은(=수정할 내용들) updatedData를 객체 안에다 한꺼번에 풀어줌
        ...updatedData 
      },
      where: { UserId: +userId } // 조건- id가 맞는 경우만 수정
    });

    // 4)사용자의 변경된 정보 이력을 UserHistories테이블에 저장한다
    for (let key in updatedData) { // key: name,age,gender....
      if (userInfo[key] !== updatedData[key]) { // 변경됨
        // UserId Int @map("UserId")
        // changedField String @map("changedField")
        // oldValue String? @map("oldValue") 
        // newValue String @map("newValue") 
        await tx.userHistories.create({
          data: {
            UserId: +userId,
            changedField: key,
            oldValue: String(userInfo[key]), // key가 age이면 Int타입이잖아(userInfo테이블보셈)
            newValue: String(updatedData[key]) // 근데, 위에 old,new는 String이므로 String화 시켜줘야 함!
          }
        });
      }
    }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
  });

  // 5)사용자 정보 변경 API를 완료
  return res.status(200).json({ message: '사용자 정보 변경에 성공하였습니다' });
});


export default router;
