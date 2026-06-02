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
  feedId?: string;
  wordCount?: number;
  attachments: NewsAttachment[];
}

export type NewsArticleBlockType = 'paragraph' | 'heading' | 'quote';

export interface NewsArticleBlock {
  type: NewsArticleBlockType;
  text: string;
}

export interface NewsArticleLink {
  label: string;
  url: string;
}

export interface NewsArticleDetail {
  title: string;
  pubDate: Date | null;
  body: NewsArticleBlock[];
  links: NewsArticleLink[];
  imageUrl: string | null;
  description: string | null;
  wordCount?: number;
}
