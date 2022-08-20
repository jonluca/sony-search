export interface Post {
  all_awardings: any[];
  allow_live_comments: boolean;
  author: string;
  author_flair_css_class: null;
  author_flair_richtext: FlairRichtext[];
  author_flair_text: null | string;
  author_flair_type: AuthorFlairType;
  author_fullname: string;
  author_is_blocked: boolean;
  author_patreon_flair: boolean;
  author_premium: boolean;
  awarders: any[];
  can_mod_post: boolean;
  contest_mode: boolean;
  created_utc: number;
  domain: Domain;
  full_link: string;
  gildings: Gildings;
  id: string;
  is_created_from_ads_ui: boolean;
  is_crosspostable: boolean;
  is_meta: boolean;
  is_original_content: boolean;
  is_reddit_media_domain: boolean;
  is_robot_indexable: boolean;
  is_self: boolean;
  is_video: boolean;
  link_flair_background_color: LinkFlairBackgroundColor;
  link_flair_richtext: FlairRichtext[];
  link_flair_template_id?: string;
  link_flair_text?: LinkFlairText;
  link_flair_text_color: FlairTextColor;
  link_flair_type: AuthorFlairType;
  locked: boolean;
  media_only: boolean;
  no_follow: boolean;
  num_comments: number;
  num_crossposts: number;
  over_18: boolean;
  parent_whitelist_status: WhitelistStatus;
  permalink: string;
  pinned: boolean;
  post_hint?: PostHint;
  preview?: Preview;
  pwls: number;
  retrieved_on: number;
  score: number;
  selftext: string;
  send_replies: boolean;
  spoiler: boolean;
  stickied: boolean;
  subreddit: Subreddit;
  subreddit_id: SubredditID;
  subreddit_subscribers: number;
  subreddit_type: SubredditType;
  thumbnail: string;
  thumbnail_height?: number;
  thumbnail_width?: number;
  title: string;
  total_awards_received: number;
  treatment_tags: any[];
  upvote_ratio: number;
  url: string;
  url_overridden_by_dest: string;
  whitelist_status: WhitelistStatus;
  wls: number;
  author_flair_background_color?: AuthorFlairBackgroundColor;
  author_flair_template_id?: string;
  author_flair_text_color?: FlairTextColor;
  gallery_data?: GalleryData;
  is_gallery?: boolean;
  media_metadata?: { [key: string]: MediaMetadatum };
  media?: Media;
  media_embed?: MediaEmbed;
  secure_media?: Media;
  secure_media_embed?: MediaEmbed;
  crosspost_parent?: string;
  crosspost_parent_list?: CrosspostParentList[];
  author_cakeday?: boolean;
}

export enum AuthorFlairBackgroundColor {
  D3D6Da = "#d3d6da",
}

export interface FlairRichtext {
  e: AuthorFlairType;
  t: string;
}

export enum AuthorFlairType {
  Richtext = "richtext",
  Text = "text",
}

export enum FlairTextColor {
  Dark = "dark",
  Light = "light",
}

export interface CrosspostParentList {
  all_awardings: any[];
  allow_live_comments: boolean;
  approved_at_utc: null;
  approved_by: null;
  archived: boolean;
  author: string;
  author_flair_background_color: null;
  author_flair_css_class: null | string;
  author_flair_richtext: any[];
  author_flair_template_id: null | string;
  author_flair_text: null | string;
  author_flair_text_color: FlairTextColor | null;
  author_flair_type: AuthorFlairType;
  author_fullname: string;
  author_is_blocked: boolean;
  author_patreon_flair: boolean;
  author_premium: boolean;
  awarders: any[];
  banned_at_utc: null;
  banned_by: null;
  can_gild: boolean;
  can_mod_post: boolean;
  category: null;
  clicked: boolean;
  content_categories: null;
  contest_mode: boolean;
  created: number;
  created_utc: number;
  discussion_type: null;
  distinguished: null;
  domain: Domain;
  downs: number;
  edited: boolean;
  gilded: number;
  gildings: Gildings;
  hidden: boolean;
  hide_score: boolean;
  id: string;
  is_created_from_ads_ui: boolean;
  is_crosspostable: boolean;
  is_meta: boolean;
  is_original_content: boolean;
  is_reddit_media_domain: boolean;
  is_robot_indexable: boolean;
  is_self: boolean;
  is_video: boolean;
  likes: null;
  link_flair_background_color: string;
  link_flair_css_class: null | string;
  link_flair_richtext: any[];
  link_flair_template_id?: string;
  link_flair_text: LinkFlairText | null;
  link_flair_text_color: FlairTextColor;
  link_flair_type: AuthorFlairType;
  locked: boolean;
  media: null;
  media_embed: Gildings;
  media_only: boolean;
  mod_note: null;
  mod_reason_by: null;
  mod_reason_title: null;
  mod_reports: any[];
  name: string;
  no_follow: boolean;
  num_comments: number;
  num_crossposts: number;
  num_reports: null;
  over_18: boolean;
  parent_whitelist_status: WhitelistStatus;
  permalink: string;
  pinned: boolean;
  post_hint?: PostHint;
  preview?: Preview;
  pwls: number;
  quarantine: boolean;
  removal_reason: null;
  removed_by: null;
  removed_by_category: null;
  report_reasons: null;
  saved: boolean;
  score: number;
  secure_media: null;
  secure_media_embed: Gildings;
  selftext: string;
  selftext_html: null | string;
  send_replies: boolean;
  spoiler: boolean;
  stickied: boolean;
  subreddit: string;
  subreddit_id: string;
  subreddit_name_prefixed: string;
  subreddit_subscribers: number;
  subreddit_type: SubredditType;
  suggested_sort: null;
  thumbnail: string;
  thumbnail_height: number | null;
  thumbnail_width: number | null;
  title: string;
  top_awarded_type: null;
  total_awards_received: number;
  treatment_tags: any[];
  ups: number;
  upvote_ratio: number;
  url: string;
  url_overridden_by_dest?: string;
  user_reports: any[];
  view_count: null;
  visited: boolean;
  whitelist_status: WhitelistStatus;
  wls: number;
}

export enum Domain {
  DigitalcameraworldCOM = "digitalcameraworld.com",
  IImgurCOM = "i.imgur.com",
  IReddIt = "i.redd.it",
  ImgurCOM = "imgur.com",
  RedditCOM = "reddit.com",
  SelfUnderwaterphotography = "self.underwaterphotography",
  YoutuBe = "youtu.be",
}

export interface Gildings {}

export enum LinkFlairText {
  CritiqueWanted = "Critique Wanted",
  Critters = "Critters",
  Gear = "Gear",
  PhotoShare = "Photo share",
  VideoShare = "Video share",
}

export enum WhitelistStatus {
  AllAds = "all_ads",
}

export enum PostHint {
  Image = "image",
  Link = "link",
  RichVideo = "rich:video",
}

export interface Preview {
  enabled: boolean;
  images: Image[];
}

export interface Image {
  id: string;
  resolutions: Source[];
  source: Source;
  variants: Gildings;
}

export interface Source {
  height: number;
  url: string;
  width: number;
}

export enum SubredditType {
  Public = "public",
}

export interface GalleryData {
  items: Item[];
}

export interface Item {
  id: number;
  media_id: string;
  caption?: string;
}

export enum LinkFlairBackgroundColor {
  E5541C = "#e5541c",
  E8E800 = "#e8e800",
  Empty = "",
  The000000 = "#000000",
}

export interface Media {
  oembed: Oembed;
  type: MediaType;
}

export interface Oembed {
  author_name: AuthorName;
  author_url: string;
  height: number;
  html: string;
  provider_name: ProviderName;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_url: string;
  thumbnail_width: number;
  title: string;
  type: OembedType;
  version: string;
  width: number;
}

export enum AuthorName {
  Barnyz = "Barnyz",
}

export enum ProviderName {
  YouTube = "YouTube",
}

export enum OembedType {
  Video = "video",
}

export enum MediaType {
  YoutubeCOM = "youtube.com",
}

export interface MediaEmbed {
  content: string;
  height: number;
  scrolling: boolean;
  width: number;
  media_domain_url?: string;
}

export interface MediaMetadatum {
  e: E;
  id: string;
  m: M;
  p: S[];
  s: S;
  status: Status;
}

export enum E {
  Image = "Image",
}

export enum M {
  ImageJpg = "image/jpg",
}

export interface S {
  u: string;
  x: number;
  y: number;
}

export enum Status {
  Valid = "valid",
}

export enum Subreddit {
  SonyAlpha = "SonyAlpha",
}

export enum SubredditID {
  T52Si08 = "t5_2si08",
}

export interface Comment {
  all_awardings: any[];
  archived: boolean;
  associated_award: null;
  author: string;
  author_flair_background_color: null | string;
  author_flair_css_class: null;
  author_flair_richtext: AuthorFlairRichtext[];
  author_flair_template_id: null | string;
  author_flair_text: null | string;
  author_flair_text_color: null | string;
  author_flair_type: AuthorFlairType;
  author_fullname: string;
  author_patreon_flair: boolean;
  author_premium: boolean;
  body: string;
  body_sha1: string;
  can_gild: boolean;
  collapsed: boolean;
  collapsed_because_crowd_control: null;
  collapsed_reason: null;
  collapsed_reason_code: null;
  comment_type: null;
  controversiality: number;
  created_utc: number;
  distinguished: null;
  gilded: number;
  gildings: Gildings;
  id: string;
  is_submitter: boolean;
  link_id: string;
  locked: boolean;
  no_follow: boolean;
  parent_id: string;
  permalink: string;
  retrieved_utc: number;
  score: number;
  score_hidden: boolean;
  send_replies: boolean;
  stickied: boolean;
  subreddit: Subreddit;
  subreddit_id: SubredditID;
  subreddit_name_prefixed: SubredditNamePrefixed;
  subreddit_type: SubredditType;
  top_awarded_type: null;
  total_awards_received: number;
  treatment_tags: any[];
  unrepliable_reason: null;
}

export interface AuthorFlairRichtext {
  e: AuthorFlairType;
  t: string;
}

export interface Gildings {}

export enum SubredditNamePrefixed {
  RSonyAlpha = "r/SonyAlpha",
}
