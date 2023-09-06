// 라우터 -> 컨트롤러 -> 서비스 -> 저장소 순서잖아
// 그럼, 여기의 컨트롤러는 다시 서비스를 불러와야 함 그러기 위해 아래처럼 연결하는 것
import { PostsService } from "../services/posts.service.js";


// Post의 컨트롤러(Controller)역할을 하는 클래스!!
export class PostsController {
  postsService =new PostsService() // Post 서비스를 클래스를 컨트롤러 클래스의 멤버 변수로 할당한다

  /** 1. 게시글 조회 API -> 초 간단 ㄷㄷ */
  getPosts = async(req,res,next) => {
    try {
      // 서비스 계층에 구현된 findAllPosts 로직을 실행한다
      // 또한, 내부변수인 postsService의 메서드를 사용할 것이기에 this도 붙여야지!
      const posts = await this.postsService.findAllPosts();

      return res.status(200).json({ data: posts });
    } catch (err) {
      // app.js보면 맨 마지막에 error처리 미들웨어 있음 -> next: 에러나면 거기로 보낸다는 뜻
      next(err)
    }
  };

  /** 1-2. 게시글 상세 조회 API */ 
  getPostById = async(req,res,next) => {
    try {
      
      const { postId } = req.params;
      // 서비스 계층에 구현된 findPostById 로직을 실행한다
      const post = await this.postsService.findPostById(postId);

      return res.status(200).json({ data: post });
    } catch (err) {
      next(err)
    }
  };

  /** 2. 게시글 생성 API */
  createPost = async(req,res,next) => {
    try { 
      const { nickname, password, title, content } = req.body;

      // 서비스 계층에 구현된 createPost 로직을 실행한다
      const createdPost = await this.postsService.createPost(
        nickname, password, title, content
      );

      return res.status(201).json({ data: createdPost });
    } catch (err) {
      next(err)
    }
  };

  /** 3. 게시글 수정 API */
  updatePost = async(req,res,next) => {
    try {
      const { postId } = req.params;
      const { password, title, content } = req.body;

      const updatedPost = await this.postsService.updatePost(
        postId, password, title, content
      );

      return res.status(200).json({ data: updatedPost });
    } catch (err) {
      next(err)
    }
  };

  /** 4. 게시글 삭제 API */
  deletePost = async(req,res,next) => {
    try {
      const { postId } = req.params;
      const { password } = req.body;

      const deletedPost = await this.postsService.deletePost(postId, password);

      return res.status(200).json({ data: deletedPost });
    } catch (err) {
      next(err);
    }
  };
};
