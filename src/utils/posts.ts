import fs from 'node:fs';
import path from 'node:path';

export interface PostMetadata {
  title: string;
  date: string;
  slug: string;
  description: string;
}

export interface Post extends PostMetadata {
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export function getPostSlugs(): string[] {
  try {
    return fs.readdirSync(postsDirectory)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading post directory:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
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
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  
  return posts;
}