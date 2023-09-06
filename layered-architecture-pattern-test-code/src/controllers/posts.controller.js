import { PostsService } from '../services/posts.service.js';

// Post의 컨트롤러(Controller)역할을 하는 클래스
export class PostsController {
  // postsService = new PostsService(); -> 삭제
  constructor(postsService) { // 컨트롤러계층도 서비스 계층을 주입받음!
    this.postsService = postsService;
  };

  getPosts = async (req, res, next) => {
    try {
      // 서비스 계층에 구현된 findAllPosts 로직을 실행합니다.
      const posts = await this.postsService.findAllPosts();

      return res.status(200).json({ data: posts });
    } catch (err) {
      next(err);
    }
  };

  getPostById = async (req, res, next) => {
    try {
      const { postId } = req.params;

      // 서비스 계층에 구현된 findPostById 로직을 실행합니다.
      const post = await this.postsService.findPostById(postId);

      return res.status(200).json({ data: post });
    } catch (err) {
      next(err);
    }
  };

  createPost = async (req, res, next) => {
    try {
      const { nickname, password, title, content } = req.body;
      // 아래 throw error추가 이유: prisma.schema보면 아래 4개가 필수잖아(not null)
      if (!nickname || !password || !title || !content) {
        throw new Error('InvalidParamsError') // 이 에러는 catch문의 err로 가고, next로 넘어감
      }

      // 서비스 계층에 구현된 createPost 로직을 실행합니다.
      const createdPost = await this.postsService.createPost(
        nickname,
        password,
        title,
        content,
      );

      return res.status(201).json({ data: createdPost });
    } catch (err) {
      next(err);
    }
  };

  updatePost = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { password, title, content } = req.body;

      // 서비스 계층에 구현된 updatePost 로직을 실행합니다.
      const updatedPost = await this.postsService.updatePost(
        postId,
        password,
        title,
        content,
      );

      return res.status(200).json({ data: updatedPost });
    } catch (err) {
      next(err);
    }
  };

  deletePost = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { password } = req.body;

      // 서비스 계층에 구현된 deletePost 로직을 실행합니다.
      const deletedPost = await this.postsService.deletePost(postId, password);

      return res.status(200).json({ data: deletedPost });
    } catch (err) {
      next(err);
    }
  };
}
