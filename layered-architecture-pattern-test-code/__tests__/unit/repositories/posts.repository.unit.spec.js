import { expect, jest } from '@jest/globals';
import { PostsRepository } from '../../../src/repositories/posts.repository';


// 그리고, 실제db가 아닌, mockPrisma를 이용해 가짜 db사용
// (re)repository에서 await prisma.posts.~가 아닌, await this.prisma.posts로 했잖아!
  // Prisma 클라이언트에서는 아래 5개의 메서드만 사용한다
  // 이 메서드들은 repo에서 실제로 사용하는 메서드들을 다 가져온 것
let mockPrisma = {
  posts: {
    findMany: jest.fn(), // jest.fn() = mock객체 만들기
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

let postsRepository = new PostsRepository(mockPrisma); // prisma대신, mock넣었지

describe('Posts Repository Unit Test', () => {

  // 각 test가 실행되기 전에 실행된다
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화한다
  })

  test('findAllPosts Method', async () => {
    const mockReturn = 'findMany String'; // 초기값
    // mockPrisma.posts의 findMany라는 목함수가 실행될때,
    // 리턴값 출력(=mockReturnValue)은 (리턴값=)mockReturn으로 한다
      // 그니까, mockDb에서 찾은 결과를 mockReturn에 담는다
    mockPrisma.posts.findMany.mockReturnValue(mockReturn);

    const posts = await postsRepository.findAllPosts();

    // findMany함수의 반환값은 findAllPosts의 반환값과 같다
      // 즉, mockReturn과 posts의 값은 같.다.
    expect(posts).toBe(mockReturn); // posts와 mockReturn값이 같아야 함ㅇㅇ

    // findMany함수는 최종적으로 1번만 호출된다
      // repo보면 1번만 실행이잖아. 그래서 여기서도 findMany 한 번만 쓴거고
    expect(postsRepository.prisma.posts.findMany).toHaveBeenCalledTimes(1);
  });


  test('createPost Method', async () => {
    // 1. 최종적으로 createPost 메서드의 반한값을 설정한다
    const mockReturn = 'create Post Return String'
    mockPrisma.posts.create.mockReturnValue(mockReturn); // mockReturn에 mock함수 실행결과 담기
    // 2. createPost메서드를 실행하기 위한 nickname, password, title, content데이터를 전달한다
    const createPostParams = {
      nickname: 'createPostNickname',
      password: 'createPostPassword',
      title: 'createPostTitle',
      content: 'createPostContent'
    }

    // 가짜가 아닌, 실제db로, 진짜 함수 실행시켜서 만든 data
    const createPostData = await postsRepository.createPost(
      createPostParams.nickname, // 이건 nickname: posts.nickname이런게 아니라
      createPostParams.password, // repo의 createPost함수가보면 괄호안에 매개변수 말하는 거임
      createPostParams.title, // createPost({ })형식이 아니라, createPost()잖아. 헷갈ㄴㄴ
      createPostParams.content
    );

    // t1: create메서드의 반환값은 Return값과 동일하다
    expect(createPostData).toEqual(mockReturn);
    // t2: create메서드는 1번만 실행된다(repo에서 create 1번만 실행ㅇㅇ)
    expect(mockPrisma.posts.create).toHaveBeenCalledTimes(1);
    // t3: createPost메서드를 실행할 때, create메서드는 전달한 4개 데이터가가 "순서"대로 & "맞게" 전달되는가?
      // t3까지 해줘야 하는 구나 ㄷㄷ;;
    expect(mockPrisma.posts.create).toHaveBeenCalledWith({
      data: {
        nickname: createPostParams.nickname,
        password: createPostParams.password,
        title: createPostParams.title,
        content: createPostParams.content,
      }
      // data: createPostParams로 해도 되겠지!
    });
  });

});