import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router()


/** 1. 댓글 생성 API **/
router.post('/posts/:postId/comments', authMiddleware, async(req,res,next) => {
  const { userId } = req.user; // 이 부분은 authMiddleware에서 온거지 ㅎㅎ
  const { postId } = req.params;
  const { content } = req.body;

  const post = await prisma.posts.findFirst({ where: { postId: +postId } });
  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다' });
  };

  const comment = await prisma.comments.create({
    data: { // 단, comment는 user와 post테이블 2개에 1:N관계 가지고 있으므로 관련 내용 적어줘야지(+대문자)
      content,
      UserId: +userId,
      PostId: +postId,
    }
  });

  return res.status(201).json({ data: comment })
});


/** 2. 댓글 조회 API **/
router.get('/posts/:postId/comments', async(req,res,next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findFirst({
    where: { postId: +postId }
  });
  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다' })
  };

  const comments = await prisma.comments.findMany({
    where: { PostId: +postId }, // 외래키니 PostId 대문자로 ㅎㅎ
    orderBy: { createdAt: 'desc' }
  });

  return res.status(200).json({ data: comments });
});


export default router;