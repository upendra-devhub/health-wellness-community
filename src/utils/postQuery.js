function buildPostQuery(query) {
  return query
    .populate('createdBy', 'name username profilePicture')
    .populate('communityId', 'communityName description communityPhoto noOfActiveMembers')
    .populate('comments.userId', 'name username profilePicture');
}

async function decoratePostsForUser(posts, userId) {
  if (!posts) {
    return posts;
  }

  const postList = Array.isArray(posts) ? posts : [posts];
  if (!postList.filter(Boolean).length) {
    return Array.isArray(posts) ? [] : null;
  }

  const normalizedPosts = postList.map((post) => {
    const normalizedPost = typeof post.toObject === 'function' ? post.toObject() : post;
    const likedBy = normalizedPost.likedBy || [];

    return {
      ...normalizedPost,
      likedByCurrentUser: likedBy.some((likedUserId) => likedUserId.toString() === userId.toString()),
      likedBy: undefined
    };
  });

  return Array.isArray(posts) ? normalizedPosts : normalizedPosts[0];
}

module.exports = {
  buildPostQuery,
  decoratePostsForUser
};
