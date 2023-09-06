// 이제, 여기 저장소 와서야 prisma를 사용!(ORM)
import { prisma } from '../utils/prisma/index.js';

export class PostsRepository {
  findAllPosts = async() => {
    // ORM인 Prisma에서 Posts 모델의 findMany 메서드를 사용해 데이터를 요청한다
    const posts = await prisma.posts.findMany(); // findMany = prisma 메서드!
    return posts; // 이게 끝임. 딱 2줄. 초~간단 - findMany는 내장메서드임. 따로 커스텀 구현ㄴㄴ
  };

  findPostById = async(postId) => { // 와 이 메서드 서비스에서 여러api에 공통으로 쓰임 ㄷㄷ
    const post = await prisma.posts.findUnique({
      where: { postId: +postId }
    });
    return post
  };

  createPost = async(nickname, password, title, content) => {
    const createdPost = await prisma.posts.create({
      data: {
        nickname, password, title, content
      }
    });
    return createdPost;
  };

  updatePost = async(postId, password, title, content) => {
    const updatedPost = await prisma.posts.update({
      data: { title, content },
      // bycrpt로 패스워드 검증하는게 더 좋다!!!!
      where: { postId: +postId, password: password }
    });
    return updatedPost;
  };

  deletePost = async(postId, password) => {
    const deletedPost = await prisma.posts.delete({
      where: { postId: +postId, password: password },
    });
    return deletedPost;
  };
}
