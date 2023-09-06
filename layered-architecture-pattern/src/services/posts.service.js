// 서비스 -> 하위의 저장소를 연결해서, 데이터를 가져와야 하므로 import
import { PostsRepository } from "../repositories/posts.repository.js";

export class PostsService {
  postsRepository = new PostsRepository();

  /** 1. 전체 조회 */
  findAllPosts = async() => {
    // 저장소(Repository)에게 데이터를 요청해서 가.져.온.것
    const posts = await this.postsRepository.findAllPosts();

    // 호출한 Post들을 가장 최신 게시글 부터 정렬한다
    posts.sort((a,b) => {
      return b.createdAt - a.createdAt
    });

    // 비즈니스 로.직을 수.행한 후 사용자에게 보여줄 데이터를 가공한다
    // pw, content를 뺀 상태로 Controller에게 Response를 전.달 -> return만 있으면 됨. res.~~ ㄴㄴ
    return posts.map((post) => {
      return {
        postId: post.postId,
        nicknmae: post.nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    })
  };
  

  /** 1-2. 상세 조회 */
  findPostById = async(postId) => {
    const post = await this.postsRepository.findPostById(postId);

    return {
      postId: post.postId,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }


  /** 2. 생성 */
  createPost = async(nickname, password, title, content) => {
    // 저장소(Repository)에게 데이터를 요청한다
    // repository의 createPost는 현재 생성되어 있지 않지만 뭐.. 구현할거니까!
    const createdPost = await this.postsRepository.createPost(
      nickname, password, title, content
    )

    // 비즈니스 로직을 수행한 후 사용자에게 보여줄 데이터를 가공한다 -> return만!
    return {
      postId: createdPost.postId,
      nickname: createdPost.nickname,
      title: createdPost.title,
      content: createdPost.content,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
    }
  };

  
  /** 3. 수정 */
  updatePost = async(postId, password, title, content) => {
    // 저장소(Repository)에게 특정 게시글 하나를 요청한다
    const post = await this.postsRepository.findPostById(postId);
    // 여기서 바로 에러를 던진다 -> 에러 미들웨어로 ㄱㄱ
    if (!post) throw new Error('존재하지 않는 게시글입니다'); 

    // 저장소(Repository)에게 데이터 수정을 요청한다
    await this.postsRepository.updatePost(postId, password, title, content);

    // 변경된 데이터를 조회한다 - 저장소를 불러서.
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


  /** 4. 삭제 */
  deletePost = async(postId, password) => {
    // *어? 보니까 findPostById가 서비스에서 여러 api에 사용되네? 아. 이것도 장점이구나 ㄷㄷㄷ;; 중요표시
    const post = await this.postsRepository.findPostById(postId)
    if (!post) throw new Error('존재하지 않는 게시글입니다');

    // 저장소(Repository)에게 데이터 삭제를 요청한다
    await this.postsRepository.deletePost(postId, password);

    return {
      postId: post.postId,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }
  };
}
