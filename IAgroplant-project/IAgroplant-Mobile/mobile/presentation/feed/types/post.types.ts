export type PostType = 'simple' | 'diagnostic' | 'opportunity';

export interface PostAuthor {
  name: string;
  role: string;
  initials: string;
  verified: boolean;
}

export interface PostBadge {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export interface BasePost {
  id: number | string;
  type: PostType;
  author: PostAuthor;
  content: string;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  region: string;
  time: string;
  category: string;
  liked: boolean;
  badge: PostBadge | null;
}

export interface SimplePost extends BasePost {
  type: 'simple';
}

export interface DiagnosticPost extends BasePost {
  type: 'diagnostic';
  pathogen: string;
  severity: 'Baixa' | 'Moderada' | 'Alta';
  disclaimer: string;
}

export interface OpportunityPost extends BasePost {
  type: 'opportunity';
  salary: string;
  duration: string;
}

export type Post = SimplePost | DiagnosticPost | OpportunityPost;
