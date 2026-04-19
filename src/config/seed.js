const Community = require('../models/Community');

const starterCommunities = [
  {
    communityName: 'Fitness',
    description: 'Daily movement, workout consistency, and practical fitness accountability.',
    noOfActiveMembers: 142,
    communityPhoto: ''
  },
  {
    communityName: 'Mental Health',
    description: 'Supportive conversations around stress, resilience, therapy, and emotional care.',
    noOfActiveMembers: 126,
    communityPhoto: ''
  },
  {
    communityName: 'Nutrition',
    description: 'Simple meal ideas, balanced eating habits, recipes, and sustainable nutrition tips.',
    noOfActiveMembers: 118,
    communityPhoto: ''
  },
  {
    communityName: 'Yoga',
    description: 'Gentle flows, flexibility work, breath-led movement, and accessible practice notes.',
    noOfActiveMembers: 104,
    communityPhoto: ''
  },
  {
    communityName: 'Meditation',
    description: 'Mindfulness, breathwork, focus rituals, and quiet routines for daily grounding.',
    noOfActiveMembers: 98,
    communityPhoto: ''
  },
  {
    communityName: 'Running',
    description: 'Training plans, pacing, recovery, race prep, and motivation for every runner.',
    noOfActiveMembers: 111,
    communityPhoto: ''
  },
  {
    communityName: 'Weight Loss',
    description: 'Healthy weight goals, habit tracking, meal planning, and steady progress support.',
    noOfActiveMembers: 95,
    communityPhoto: ''
  },
  {
    communityName: 'Sleep Health',
    description: 'Better sleep routines, wind-down habits, recovery, and rest-focused experiments.',
    noOfActiveMembers: 89,
    communityPhoto: ''
  },
  {
    communityName: 'Hydration',
    description: 'Water goals, electrolyte habits, hydration reminders, and simple daily tracking.',
    noOfActiveMembers: 76,
    communityPhoto: ''
  },
  {
    communityName: 'Recovery',
    description: 'Mobility, soreness management, rest days, injury prevention, and comeback stories.',
    noOfActiveMembers: 82,
    communityPhoto: ''
  },
  {
    communityName: 'Strength Training',
    description: 'Lifting technique, progressive overload, gym routines, and strength milestones.',
    noOfActiveMembers: 109,
    communityPhoto: ''
  },
  {
    communityName: 'General Wellness',
    description: 'Everyday habits, routines, small wins, and whole-person wellness support.',
    noOfActiveMembers: 134,
    communityPhoto: ''
  }
];

async function seedCommunities() {
  await Promise.all(
    starterCommunities.map((community) => Community.updateOne(
      { communityName: community.communityName },
      { $setOnInsert: community },
      { upsert: true }
    ))
  );
}

module.exports = {
  seedCommunities
};
