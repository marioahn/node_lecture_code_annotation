// import { PostsRepository } from '../repositories/posts.repository.js'; 삭제

export class PostsService {
  // postsRepository = new PostsRepository(); -> 이거 대신에
  constructor(postsRepository) { 
    this.postsRepository = postsRepository
  }

  findAllPosts = async () => {
    // 저장소(Repository)에게 데이터를 요청합니다.
    const posts = await this.postsRepository.findAllPosts();

    // 호출한 Post들을 가장 최신 게시글 부터 정렬합니다.
    posts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    // 비즈니스 로직을 수행한 후 사용자에게 보여줄 데이터를 가공합니다.
    return posts.map((post) => {
      return {
        postId: post.postId,
        nickname: post.nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });
  };

  findPostById = async (postId) => {
    // 저장소(Repository)에게 특정 게시글 하나를 요청합니다.
    const post = await this.postsRepository.findPostById(postId);

    return {
      postId: post.postId,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  };

  createPost = async (nickname, password, title, content) => {
    // 저장소(Repository)에게 데이터를 요청합니다.
    const createdPost = await this.postsRepository.createPost(
      nickname,
      password,
      title,
      content,
    );

    // 비즈니스 로직을 수행한 후 사용자에게 보여줄 데이터를 가공합니다.
    return {
      postId: createdPost.postId,
      nickname: createdPost.nickname,
      title: createdPost.title,
      content: createdPost.content,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
    };
  };

  updatePost = async (postId, password, title, content) => {
    // 저장소(Repository)에게 특정 게시글 하나를 요청합니다.
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new Error('존재하지 않는 게시글입니다.');

    // 저장소(Repository)에게 데이터 수정을 요청합니다.
    await this.postsRepository.updatePost(postId, password, title, content);

    // 변경된 데이터를 조회합니다.
    const updatedPost = await this.postsRepository.findPostById(postId);

    return {
      postId: updatedPost.postId,
      nickname: updatedPost.nickname,
      title: updatedPost.title,
      content: updatedPost.content,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
    };
  };

  deletePost = async (postId, password) => {
    // 저장소(Repository)에게 특정 게시글 하나를 요청합니다.
    const post = await this.postsRepository.findPostById(postId); // 1로직
    if (!post) throw new Error('존재하지 않는 게시글입니다.'); // 4로직

    // 저장소(Repository)에게 데이터 삭제를 요청합니다.
    await this.postsRepository.deletePost(postId, password); // 2로직

    return { // 3로직
      postId: post.postId, 
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  };
}
