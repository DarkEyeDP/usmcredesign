export interface NewsAttachment {
  label: string;
  url: string;
  type: 'pdf' | 'doc' | 'file';
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  imageUrl: string | null;
  author: string | null;
  category: string | null;
  source: 'news' | 'press-release';
  attachments: NewsAttachment[];
}
