import fs from 'node:fs';
import path from 'node:path';
import AWS from 'aws-sdk';

export interface PostMetadata {
  title: string;
  date: string;
  slug: string;
  description: string;
}

export interface Post extends PostMetadata {
  content: string;
}

// Determine if running in production (Lambda@Edge)
const isServerless = import.meta.env.MODE === 'production';

// Local file system path for development
const postsDirectory = path.join(process.cwd(), 'src/content/posts');

// S3 client for serverless environment
const s3 = new AWS.S3({ region: 'us-east-1' });

// Get AWS account ID from CloudFormation
let s3BucketName: string | null = null;

// Helper to get the S3 bucket name
function getS3BucketName(): string {
  if (s3BucketName) {
    return s3BucketName;
  }
  
  // Get environment from Vite
  const env = import.meta.env.APP_ENV || 'prod';
  
  // In production, this would be replaced with account ID at build time
  // For now, we'll use a placeholder that will be filled during deployment
  const accountId = import.meta.env.AWS_ACCOUNT_ID || '';
  
  s3BucketName = `personal-website-assets-${env}-${accountId}`;
  return s3BucketName;
}

// Parse markdown content, used by both local and S3 implementations
function parsePostContent(slug: string, fileContents: string): Post | null {
  // Parse markdown frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = frontmatterRegex.exec(fileContents);
  
  if (!match) {
    throw new Error(`Invalid frontmatter in post: ${slug}`);
  }
  
  const frontMatterBlock = match[1];
  const content = fileContents.replace(frontmatterRegex, '');
  
  // Parse frontmatter into object
  const metadata: Partial<PostMetadata> = {};
  frontMatterBlock.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      // Remove quotes if present
      metadata[key.trim() as keyof PostMetadata] = value.replace(/^"(.*)"$/, '$1');
    }
  });
  
  return {
    slug,
    title: metadata.title || '',
    date: metadata.date || '',
    description: metadata.description || '',
    content
  };
}

export async function getPostSlugs(): Promise<string[]> {
  try {
    if (isServerless) {
      // In production Lambda, get posts from S3
      const bucket = getS3BucketName();
      const prefix = 'content/posts/';
      
      const params = {
        Bucket: bucket,
        Prefix: prefix
      };
      
      const result = await s3.listObjectsV2(params).promise();
      
      if (!result.Contents) {
        return [];
      }
      
      return result.Contents
        .map(item => item.Key as string)
        .filter(key => key.endsWith('.md'))
        .map(key => {
          // Extract slug from key (e.g., 'content/posts/hello-world.md' -> 'hello-world')
          const filename = key.split('/').pop() || '';
          return filename.replace(/\.md$/, '');
        });
    } else {
      // In development, read from local filesystem
      return fs.readdirSync(postsDirectory)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace(/\.md$/, ''));
    }
  } catch (error) {
    console.error('Error reading post directory:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    if (isServerless) {
      // In production Lambda, get post from S3
      const bucket = getS3BucketName();
      const key = `content/posts/${slug}.md`;
      
      const params = {
        Bucket: bucket,
        Key: key
      };
      
      const result = await s3.getObject(params).promise();
      const fileContents = result.Body?.toString('utf8') || '';
      
      return parsePostContent(slug, fileContents);
    } else {
      // In development, read from local filesystem
      const fullPath = path.join(postsDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      return parsePostContent(slug, fileContents);
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getPostSlugs();
  const postPromises = slugs.map(slug => getPostBySlug(slug));
  const postsWithNulls = await Promise.all(postPromises);
  
  const posts = postsWithNulls
    .filter((post): post is Post => post !== null)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  
  return posts;
}