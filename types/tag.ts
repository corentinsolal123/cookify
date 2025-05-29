// types/tag.ts
export interface TagData {
    id?: string;
    name: string;
    slug: string;
    color: string;
    category: 'cuisine' | 'regime' | 'difficulte' | 'temps' | 'occasion';
    created_at?: string;
    updated_at?: string;
}