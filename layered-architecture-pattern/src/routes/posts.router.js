import express from 'express';
// controller와 router를 연결하기 위해! - (router하위에 controller)
import { PostsController } from '../controllers/posts.controller.js';

const router = express.Router();
// PostsController를 인스턴스화 시킨다 -> postsController도 P의 메서드 가져올 수 있지!
const postsController = new PostsController(); 

/** 1. 게시글 생성 API */
  // 이제는, asycn(req,res,next) => 라는 콜백함수가 아니라,
  // postController의 특정 메서드를 실행하도록 구현할 것이다
router.post('/', postsController.createPost);

/** 1-2. 게시글 상세 조회 API */
router.get('/:postId', postsController.getPostById);

/** 2. 게시글 조회 API */
  // 정리하면, 라우터에서 URL과 (컨트롤러의)메서드를 전달받으면 -> 
  // 컨트롤러의 메서드에서 다시 서비스의 메서드 호출하고, 서비스는 DB에서 결과 처리
  // 그리고 그걸 다시 거꾸로해서 전달받아오는 방식이다
router.get('/', postsController.getPosts);

/** 3. 게시글 수정 API */
router.put('/:postId', postsController.updatePost);

/** 4. 게시글 삭제 API */
router.delete('/:postId', postsController.deletePost);


export default router;
