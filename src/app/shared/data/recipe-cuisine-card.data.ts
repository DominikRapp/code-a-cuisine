import { RecipeCuisine } from '../models/recipe-generation.model';

export interface RecipeCuisineCard {
    cuisine: RecipeCuisine;
    title: string;
    emojiSrc: string;
    imageSrc: string;
}

export const RECIPE_CUISINE_CARDS: RecipeCuisineCard[] = [
    {
        cuisine: 'italian',
        title: 'Italian cuisine',
        emojiSrc: 'assets/images/png/italian-emoji.png',
        imageSrc: 'assets/images/svg/italian-pic.svg',
    },
    {
        cuisine: 'german',
        title: 'German cuisine',
        emojiSrc: 'assets/images/png/german-emoji.png',
        imageSrc: 'assets/images/svg/german-pic.svg',
    },
    {
        cuisine: 'japanese',
        title: 'Japanese cuisine',
        emojiSrc: 'assets/images/png/japanese-emoji.png',
        imageSrc: 'assets/images/svg/japanese-pic.svg',
    },
    {
        cuisine: 'gourmet',
        title: 'Gourmet cuisine',
        emojiSrc: 'assets/images/png/gourmet-emoji.png',
        imageSrc: 'assets/images/svg/gourmet-pic.svg',
    },
    {
        cuisine: 'indian',
        title: 'Indian cuisine',
        emojiSrc: 'assets/images/png/indian-emoji.png',
        imageSrc: 'assets/images/svg/indian-pic.svg',
    },
    {
        cuisine: 'fusion',
        title: 'Fusion cuisine',
        emojiSrc: 'assets/images/png/fusion-emoji.png',
        imageSrc: 'assets/images/svg/fusion-pic.svg',
    },
];