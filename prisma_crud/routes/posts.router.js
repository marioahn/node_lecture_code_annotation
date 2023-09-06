import express from 'express';
// import { PrismaClient } from '@prisma/client'; - 아래 코드로 할거니까 이 코드 삭제
import { prisma } from '../utils/prisma/index.js'

const router = express.Router(); // express.Router()를 이용해 라우터를 생성

// 아래 prisma 선언한 부분을 삭제하고, utils/prisma/index.js에서 한꺼번에 관리할 것임 - 위에 import하나 더 추가해서 가져와야겠지
// const prisma = new PrismaClient({ // PrismaClient를 prisma변수에 할당했기에 prisma도 관련 함수 쓰기 가능!
//   // Prisma를 이용해 데이터베이스를 접근할 때, SQL을 출력
//   log: ['query', 'info', 'warn', 'error'],

//   // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태('pretty)로 출력해
//   errorFormat: 'pretty',
// }); // PrismaClient 인스턴스를 생성

/** 게시글 생성API **/
router.post('/posts', async(req,res,next) => {
  const { title, content, password } = req.body;

  const post = await prisma.posts.create({
    data: { title, content, password } // title: title -> 객구분할 -> title
  });

  return res.status(201).json({ data: post });
});


/** 게시글 전체 조회API **/
router.get('/posts', async(req,res,next) => {
  // 게시글 내용(content)는 빼고 구현 -> 특정 컬럼 지정위해서는 select!
  const posts = await prisma.posts.findMany({
    select: { // 만약, select 안 쓰면 모든 컬럼 조회
      postId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return res.status(200).json({ data: posts });
});


/** 게시글 상세 조회API **/
router.get('/posts/:postId', async(req,res,next) => {
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId }, // +안쓰면 에러뜸 -> 좌측은 스키마보면 int니까 숫자인데, 우측은 내가 입력한 것 -> 문자처리됨 -> +붙이기
    select: {
      postId: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return res.status(200).json({ data: post });
});


/** 게시글 수정API **/
router.put('/posts/:postId', async(req,res,next) => {
  const { postId } = req.params;
  const { title, content, password } = req.body;

  // 특정 조건의 데이터의 경우에만 조회 - findFirst()와 비슷
  const post = await prisma.posts.findUnique({
    where: { postId: +postId }
  });

  if (!post) {
    return res.status(400).json({ errorMessage: "게시글이 존재하지 않습니다" });
  } else if (post.password !== password) {
    return res.status(401).json({ errorMessage: "비번 일치하지 않습니다" });
  }

  // 모든 조건을 통과했다면, update
  await prisma.posts.update({
    data: { title, content }, // 어떤 것을 update? -> title, content
    where: { // 조건 -> and조건임 여기서!
      postId: +postId,
      password // 위에서 했지만, 한번 더 검증해주면 오류나서 위에서 통과해도 여기서 다시 걸러지기 가능!
    }
  });

  return res.status(200).json({ message: "게시글 수정이 완료되었습니다" });
});


/** 게시글 삭제API **/
router.delete('/posts/:postId', async(req,res,next) => {
  const { postId } = req.params;
  const { password } = req.body;

  // 특정 조건의 데이터의 경우에만 조회 - findFirst()와 비슷
  const post = await prisma.posts.findUnique({
    where: { postId: +postId }
  });

  if (!post) {
    return res.status(400).json({ errorMessage: "게시글이 존재하지 않습니다" });
  } else if (post.password !== password) {
    return res.status(401).json({ errorMessage: "비번 일치하지 않습니다" });
  }

  // 모든 조건을 통과했다면, 삭제
  await prisma.posts.delete({
    where: { postId: +postId }
  });

  return res.status(200).json({ message: "게시글 삭제가 완료되었습니다" });
});


export default router;