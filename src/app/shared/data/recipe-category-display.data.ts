import { RecipeCuisine } from '../models/recipe-generation.model';

export interface RecipeCategoryDisplayConfig {
    title: string;
    label: string;
    heroDesktop: string;
    heroMobile: string;
}

export const RECIPE_CATEGORY_DISPLAY_CONFIG: Record<RecipeCuisine, RecipeCategoryDisplayConfig> = {
    italian: {
        title: 'Italian cuisine',
        label: 'Italian recipe list',
        heroDesktop: 'assets/images/svg/italian-cousine-hero.svg',
        heroMobile: 'assets/images/svg/italian-cousine-hero-mobile.svg',
    },
    german: {
        title: 'German cuisine',
        label: 'German recipe list',
        heroDesktop: 'assets/images/svg/german-cousine-hero.svg',
        heroMobile: 'assets/images/svg/german-cousine-hero-mobile.svg',
    },
    japanese: {
        title: 'Japanese cuisine',
        label: 'Japanese recipe list',
        heroDesktop: 'assets/images/svg/japanese-cousine-hero.svg',
        heroMobile: 'assets/images/svg/japanese-cousine-hero-mobile.svg',
    },
    gourmet: {
        title: 'Gourmet cuisine',
        label: 'Gourmet recipe list',
        heroDesktop: 'assets/images/svg/gourmet-cousine-hero.svg',
        heroMobile: 'assets/images/svg/gourmet-cousine-hero-mobile.svg',
    },
    indian: {
        title: 'Indian cuisine',
        label: 'Indian recipe list',
        heroDesktop: 'assets/images/svg/indian-cousine-hero.svg',
        heroMobile: 'assets/images/svg/indian-cousine-hero-mobile.svg',
    },
    fusion: {
        title: 'Fusion cuisine',
        label: 'Fusion recipe list',
        heroDesktop: 'assets/images/svg/fusion-cousine-hero.svg',
        heroMobile: 'assets/images/svg/fusion-cousine-hero-mobile.svg',
    },
};