const Resource = require('../models/Resource');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

function normalizeCommunityCategory(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function shuffle(items) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
  }

  return shuffledItems;
}

const getWellnessPicks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('communitiesJoined')
    .populate('communitiesJoined', 'communityName')
    .lean();

  const joinedCategories = [...new Set(
    (user?.communitiesJoined || [])
      .map((community) => normalizeCommunityCategory(community?.communityName))
      .filter(Boolean)
  )];

  if (!joinedCategories.length) {
    res.json({
      success: true,
      data: []
    });
    return;
  }

  const resources = await Resource.find({
    category: { $in: joinedCategories }
  })
    .select('title description category source readTime url priority createdAt')
    .lean();

  if (!resources.length) {
    res.json({
      success: true,
      data: []
    });
    return;
  }

  const resourcesByCategory = shuffle(resources).reduce((groups, resource) => {
    if (!groups.has(resource.category)) {
      groups.set(resource.category, []);
    }

    groups.get(resource.category).push(resource);
    return groups;
  }, new Map());

  const selectedResources = shuffle(joinedCategories)
    .flatMap((category) => (resourcesByCategory.get(category) || []).slice(0, 2));

  res.json({
    success: true,
    data: shuffle(selectedResources).slice(0, 10)
  });
});

module.exports = {
  getWellnessPicks
};
