import { expect, jest } from '@jest/globals';
import { PostsService } from '../../../src/services/posts.service.js';

// PostsRepository는 아래의 5개 메서드만 지원하고 있다
let mockPostsRepository = { // 여긴 service니, mockPrisma가 아니라 mockRepo!
  findAllPosts: jest.fn(),
  findPostById: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

// postsService의 Repository를 Mock Repository로 의존성을 주입한다
let postsService = new PostsService(mockPostsRepository);

describe('Posts Service Unit Test', () => {
  // 각 test가 실행되기 전에 실행된다
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화한다
  })

  // Test1: findAllPosts의 로직과 mock으로 인한 결과가 같은가
  test('findAllPosts Method', async () => {
    const samplePosts = [
      { // insomnia에서 전체검색해서 샘플데이터 긁어오는게 편함
        "postId": 1,
        "nickname": "gg",
        "title": "gg",
        "createdAt": "2023-09-06T01:55:06.473Z",
        "updatedAt": "2023-09-06T01:55:06.473Z"
      },
      { 
        "postId": 2,
        "nickname": "gg",
        "title": "gg",
        "createdAt": "2023-09-06T02:00:06.473Z",
        "updatedAt": "2023-09-06T02:00:06.473Z"
      },
    ]

    mockPostsRepository.findAllPosts.mockReturnValue(samplePosts);

    const allPosts = await postsService.findAllPosts();

    // test1-1: 내림차순 정렬 되었는가 + return map으로 5개컬럼만 가져왔잖아 그거 잘 가져왔는가
      // 즉, 2가지를 한 꺼번에 여기서 테스트했음 ㅇㅇ.
    expect(allPosts).toEqual(
      samplePosts.sort((a,b) => {
        return b.createdAt - a.createdAt;
      })
    )

    // test1-2: findAllPosts가 몇번 호출?
    expect(mockPostsRepository.findAllPosts).toHaveBeenCalledTimes(1);
  });

  // Test2: Service의 deletePost함수와 로직이 같은가? (repo의 delete함수하교 비교가 아님 주의)
  test('deletePost Method By Success', async () => {
    
    const samplePost = { 
      "postId": 2,
      "nickname": "gg",
      "password": "1234",
      "title": "gg",
      "content": "테스트 코드 용",
      "createdAt": "2023-09-06T02:00:06.473Z",
      "updatedAt": "2023-09-06T02:00:06.473Z"
    }
    // *mock함수 실.행.결.과를 samplePost로 덮어씌운다! (그 반대가 아님 주의!)
      // 그니까, mockDB 생성한 것!
    mockPostsRepository.findPostById.mockReturnValue(samplePost);

    const deletedPost = await postsService.deletePost(2,'1234'); // 매개변수 postId,pw임


    // test2-1(1): findPostById 메서드에 대한 에러 검증1 -> 왜 이것도 해야함?
      // *delete라고, delete만 하면 되는게 아니라, delete함수 안.에 있는 모.든.로직을 테스트해야함!!
    expect(mockPostsRepository.findPostById).toHaveBeenCalledTimes(1);
    // test2-1(2): findPostById 메서드에 대한 에러 검증2
      // calledWith - 어떤 인자를 이용해, mock함수가 호출되었는지 확인
      // service의 delete함수안의 findPostById(postId)니까 아래처럼 쓰면 됨
    expect(mockPostsRepository.findPostById).toHaveBeenCalledWith(samplePost.postId);

    // test2-2(1,2)
    expect(mockPostsRepository.deletePost).toHaveBeenCalledTimes(1);
    expect(mockPostsRepository.deletePost).toHaveBeenCalledWith(samplePost.postId,samplePost.password);

    // test2-3
    expect(deletedPost).toEqual({
      postId: samplePost.postId, // deletPost함수의 마지막 로직인 return값 모양과 똑같이 ㅇㅇ.
      nickname: samplePost.nickname, // 객체로 & 각각의 6개 컬럼들 쓰기
      title: samplePost.title,
      content: samplePost.content,
      createdAt: samplePost.createdAt,
      updatedAt: samplePost.updatedAt,
    })
  });

  // test2-4: 사실, delete에서 빈.게시글인 경우 에러 던지는 경우도 있잖아!
    // (try-catch문 이용해서, 여기의 에러가 다른데로 가지 않도록 마무리)
    // *즉, null게시글을 던졌을 때(deletePost함수 수행), 에.러.가 catch문에서 제대로 넘어가 나오는가?
  test('deletePost Method By Not Found Post Error', async () => {
    const samplePost = null; // 이번엔 없는 경우니, null로
    mockPostsRepository.findPostById.mockReturnValue(samplePost);

    try {
      await postsService.deletePost(1231233, 'sdafafads') // 있을리 없는 id,pw넣어서 삭제 수행시키기
    } catch (err) {
      // 빈 게시글인지 아닌지 체크할때 findPostById쓰니까, 2테스트에서처럼 이거 두개ㄱㄱ
      expect(mockPostsRepository.findPostById).toHaveBeenCalledTimes(1);
      expect(mockPostsRepository.findPostById).toHaveBeenCalledWith(1231233);
      // 단, 바로 위에서 없는 id로 찾았으니, 아래의 deletePost 실행횟수는 0이 되어야 맞음
      expect(mockPostsRepository.deletePost).toHaveBeenCalledTimes(0);
      // posts.service.js의 throw문과 같은 메세지가 나오면 ok
      expect(err.message).toEqual('존재하지 않는 게시글입니다.');
    }

  });
});