import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 1. 게시글 생성 API **/
router.post('/posts', authMiddleware, async (req, res, next) => {
  // 1)게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증한다 - authMiddleware
  const { userId } = req.user; // 검증되었고, 'req.user = user'되어있음(authMiddleware에) -> 여기로 가져오기 가능

  const { title, content } = req.body;

  // 2)Posts테이블에 게시글을 생성한다 - prisma import해서 가져와야지
  const post = await prisma.posts.create({
    data: {
      UserId: userId, // 이거는 body가 아님 -> 어디서? req.user에서 가져와야 함 & 참조외래키 뜻하는 '대문자'U
      title,
      content,
    },
  });

  return res.status(201).json({ data: post });
});


/** 2. 게시글 목록 조회 API **/
router.get('/posts', async(req,res,next) => {
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc' // 내림차순
    }
  });

  return res.status(200).json({ data: posts })
});


/** 3. 게시글 상세 조회 API **/
router.get('/posts/:postId', async(req,res,next) => {
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
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


export default router;