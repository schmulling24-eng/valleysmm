require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Service = require('./backend/models/Service');

const services = [
  // INSTAGRAM
  { serviceId:'IG-FOL-001', platform:'Instagram', category:'Followers', name:'Instagram Followers – Real Looking', rate:45, minOrder:100, maxOrder:50000, description:'High quality followers, gradual delivery, safe for your account.', refill:true, cancel:false },
  { serviceId:'IG-FOL-002', platform:'Instagram', category:'Followers', name:'Instagram Followers – Premium HQ', rate:80, minOrder:100, maxOrder:100000, description:'Premium followers with profile pictures and posts.', refill:true },
  { serviceId:'IG-LIKE-001', platform:'Instagram', category:'Likes', name:'Instagram Likes – Instant', rate:15, minOrder:50, maxOrder:50000, description:'Fast delivery likes for your posts.', refill:false },
  { serviceId:'IG-LIKE-002', platform:'Instagram', category:'Likes', name:'Instagram Likes – HQ Slow', rate:25, minOrder:100, maxOrder:30000, description:'Slow delivery for organic appearance.', refill:false },
  { serviceId:'IG-VIEW-001', platform:'Instagram', category:'Views', name:'Instagram Video Views', rate:5, minOrder:500, maxOrder:500000, description:'Fast video/reel views.', refill:false },
  { serviceId:'IG-REEL-001', platform:'Instagram', category:'Views', name:'Instagram Reel Views + Reach', rate:8, minOrder:500, maxOrder:200000, description:'Boost your reels reach and views.', refill:false },
  { serviceId:'IG-STORY-001', platform:'Instagram', category:'Views', name:'Instagram Story Views', rate:6, minOrder:100, maxOrder:100000, description:'Story views delivered fast.', refill:false },
  { serviceId:'IG-COM-001', platform:'Instagram', category:'Comments', name:'Instagram Comments – Random', rate:120, minOrder:10, maxOrder:500, description:'Random positive comments on your posts.', refill:false },
  { serviceId:'IG-SAVE-001', platform:'Instagram', category:'Saves', name:'Instagram Post Saves', rate:20, minOrder:100, maxOrder:20000, description:'Post saves to boost explore page ranking.', refill:false },

  // TIKTOK
  { serviceId:'TT-FOL-001', platform:'TikTok', category:'Followers', name:'TikTok Followers – Real Looking', rate:35, minOrder:100, maxOrder:50000, description:'Quality TikTok followers delivered gradually.', refill:true },
  { serviceId:'TT-VIEW-001', platform:'TikTok', category:'Views', name:'TikTok Video Views – Fast', rate:2, minOrder:1000, maxOrder:1000000, description:'Ultra fast TikTok views.', refill:false },
  { serviceId:'TT-LIKE-001', platform:'TikTok', category:'Likes', name:'TikTok Likes – Instant', rate:12, minOrder:100, maxOrder:100000, description:'Fast TikTok likes delivery.', refill:false },
  { serviceId:'TT-SHARE-001', platform:'TikTok', category:'Shares', name:'TikTok Shares', rate:18, minOrder:100, maxOrder:10000, description:'Boost your TikTok share count.', refill:false },
  { serviceId:'TT-COM-001', platform:'TikTok', category:'Comments', name:'TikTok Comments – Custom', rate:150, minOrder:10, maxOrder:500, description:'Custom comments on your TikTok videos.', refill:false },

  // YOUTUBE
  { serviceId:'YT-SUB-001', platform:'YouTube', category:'Subscribers', name:'YouTube Subscribers – HQ', rate:90, minOrder:100, maxOrder:20000, description:'Real looking YouTube subscribers.', refill:true },
  { serviceId:'YT-VIEW-001', platform:'YouTube', category:'Views', name:'YouTube Views – Adsense Safe', rate:12, minOrder:500, maxOrder:500000, description:'Safe views, good retention, Adsense friendly.', refill:false },
  { serviceId:'YT-WATCH-001', platform:'YouTube', category:'Watch Hours', name:'YouTube Watch Hours – 4000hrs Package', rate:350, minOrder:500, maxOrder:4000, description:'Real watch time to help you reach monetization threshold.', refill:false },
  { serviceId:'YT-LIKE-001', platform:'YouTube', category:'Likes', name:'YouTube Likes – HQ', rate:20, minOrder:50, maxOrder:20000, description:'Boost your video likes.', refill:false },
  { serviceId:'YT-COM-001', platform:'YouTube', category:'Comments', name:'YouTube Comments – Random Positive', rate:180, minOrder:5, maxOrder:300, description:'Positive random comments on your videos.', refill:false },

  // FACEBOOK
  { serviceId:'FB-PAGE-001', platform:'Facebook', category:'Page Likes', name:'Facebook Page Likes – Real', rate:40, minOrder:100, maxOrder:50000, description:'Quality Facebook page likes.', refill:true },
  { serviceId:'FB-FOL-001', platform:'Facebook', category:'Followers', name:'Facebook Profile Followers', rate:35, minOrder:100, maxOrder:50000, description:'Facebook profile followers.', refill:false },
  { serviceId:'FB-LIKE-001', platform:'Facebook', category:'Post Likes', name:'Facebook Post Likes – Fast', rate:14, minOrder:100, maxOrder:50000, description:'Fast post likes delivery.', refill:false },
  { serviceId:'FB-SHARE-001', platform:'Facebook', category:'Shares', name:'Facebook Post Shares', rate:25, minOrder:50, maxOrder:10000, description:'Boost post shares organically.', refill:false },
  { serviceId:'FB-VIEW-001', platform:'Facebook', category:'Video Views', name:'Facebook Video Views – 1 min', rate:7, minOrder:1000, maxOrder:500000, description:'1-minute retention video views.', refill:false },

  // TWITTER/X
  { serviceId:'TW-FOL-001', platform:'Twitter', category:'Followers', name:'Twitter/X Followers – Real Looking', rate:50, minOrder:100, maxOrder:50000, description:'Quality Twitter followers.', refill:true },
  { serviceId:'TW-LIKE-001', platform:'Twitter', category:'Likes', name:'Twitter/X Likes – Fast', rate:15, minOrder:50, maxOrder:30000, description:'Instant Twitter likes.', refill:false },
  { serviceId:'TW-RTWT-001', platform:'Twitter', category:'Retweets', name:'Twitter/X Retweets', rate:22, minOrder:50, maxOrder:10000, description:'Real looking retweets.', refill:false },
  { serviceId:'TW-VIEW-001', platform:'Twitter', category:'Views', name:'Twitter/X Impressions/Views', rate:5, minOrder:1000, maxOrder:500000, description:'Boost your tweet impressions.', refill:false },

  // TELEGRAM
  { serviceId:'TG-MEM-001', platform:'Telegram', category:'Members', name:'Telegram Channel Members – Real', rate:30, minOrder:100, maxOrder:100000, description:'Real looking Telegram members.', refill:true },
  { serviceId:'TG-MEM-002', platform:'Telegram', category:'Members', name:'Telegram Group Members', rate:35, minOrder:100, maxOrder:50000, description:'Members for Telegram groups.', refill:true },
  { serviceId:'TG-VIEW-001', platform:'Telegram', category:'Views', name:'Telegram Post Views', rate:3, minOrder:500, maxOrder:500000, description:'Fast Telegram post views.', refill:false },
  { serviceId:'TG-REACT-001', platform:'Telegram', category:'Reactions', name:'Telegram Reactions – 👍', rate:10, minOrder:100, maxOrder:10000, description:'Thumbs up reactions on posts.', refill:false },

  // LINKEDIN
  { serviceId:'LI-FOL-001', platform:'LinkedIn', category:'Followers', name:'LinkedIn Followers', rate:80, minOrder:50, maxOrder:10000, description:'LinkedIn profile followers.', refill:false },
  { serviceId:'LI-LIKE-001', platform:'LinkedIn', category:'Likes', name:'LinkedIn Post Likes', rate:40, minOrder:20, maxOrder:5000, description:'LinkedIn post reactions.', refill:false },

  // SOUNDCLOUD
  { serviceId:'SC-PLY-001', platform:'SoundCloud', category:'Plays', name:'SoundCloud Plays – Fast', rate:8, minOrder:500, maxOrder:500000, description:'Fast SoundCloud plays.', refill:false },
  { serviceId:'SC-FOL-001', platform:'SoundCloud', category:'Followers', name:'SoundCloud Followers', rate:45, minOrder:100, maxOrder:20000, description:'SoundCloud followers.', refill:false },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/valleysmm');
    console.log('Connected to MongoDB');
    let added = 0, skipped = 0;
    for (const svc of services) {
      const exists = await Service.findOne({ serviceId: svc.serviceId });
      if (!exists) { await Service.create({ ...svc, isActive: true }); added++; }
      else skipped++;
    }
    console.log(`✅ Seeded ${added} services, skipped ${skipped} existing`);
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e.message);
    process.exit(1);
  }
}
seed();
