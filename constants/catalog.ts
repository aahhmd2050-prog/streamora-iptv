export type Channel = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  color: string;
  viewers: string;
  isLive?: boolean;
  image?: number;
  streamUrl?: string;
  logo?: string;
  epgChannelId?: string;
};

export type Show = {
  id: string;
  title: string;
  description: string;
  category: string;
  image: number | { uri: string };
  duration: string;
  streamUrl?: string;
};

export const categories = ['الكل', 'رياضة', 'أخبار', 'ترفيه', 'أفلام', 'أطفال'];

export const channels: Channel[] = [
  { id: 'sports-1', title: 'Arena Sports', subtitle: 'المباراة المباشرة الآن', category: 'رياضة', icon: 'activity', color: '#C32632', viewers: '12.4K', isLive: true },
  { id: 'news-1', title: 'News 24', subtitle: 'نشرة الأخبار المسائية', category: 'أخبار', icon: 'radio', color: '#D55A3A', viewers: '8.2K', isLive: true },
  { id: 'cinema-1', title: 'Cinema One', subtitle: 'اختيارات الليلة', category: 'أفلام', icon: 'film', color: '#6C2735', viewers: '6.7K', isLive: true },
  { id: 'kids-1', title: 'Junior Box', subtitle: 'مغامرات ممتعة للصغار', category: 'أطفال', icon: 'smile', color: '#B65B38', viewers: '4.1K', isLive: true },
  { id: 'music-1', title: 'Pulse Music', subtitle: 'أفضل الأغاني الجديدة', category: 'ترفيه', icon: 'music', color: '#7A3042', viewers: '3.6K', isLive: true },
  { id: 'sports-2', title: 'Fight Club', subtitle: 'ليلة الأبطال', category: 'رياضة', icon: 'target', color: '#8F2430', viewers: '5.8K', isLive: false },
];

export const shows: Show[] = [
  {
    id: 'match-night',
    title: 'ليلة الأبطال',
    description: 'تابع المواجهة الحاسمة مباشرة بتجربة مشاهدة غامرة وصوت واضح.',
    category: 'رياضة',
    image: require('../assets/images/hero-football.jpg'),
    duration: 'مباشر الآن',
  },
  {
    id: 'red-city',
    title: 'مدن بعد منتصف الليل',
    description: 'سلسلة وثائقية تأخذك في جولة بين أكثر المدن حياة بعد الغروب.',
    category: 'أفلام',
    image: require('../assets/images/city-neon.jpg'),
    duration: '48 دقيقة',
  },
];